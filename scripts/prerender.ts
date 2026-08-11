/**
 * Prerenderizado estático para SEO.
 * Genera archivos HTML estáticos para todas las rutas /mensajes/* a partir del
 * build de Vite, para que los crawlers reciban el contenido renderizado sin
 * necesidad de ejecutar JavaScript.
 *
 * Uso: npx tsx scripts/prerender.ts  (se ejecuta automáticamente en "npm run build")
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// @ts-ignore - tsx maneja la importación de archivos TS directamente
import { OCCASIONS, RELATIONSHIPS } from "../constants";
import { preview } from "vite";
import puppeteer, { Browser } from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");

// Recursos externos que no afectan al HTML renderizado (analytics, ads, fonts)
const BLOCKED_PATTERNS = [
  /google-analytics/,
  /googletagmanager/,
  /gtag/,
  /pagead2/,
  /doubleclick/,
  /fonts\.googleapis/,
  /fonts\.gstatic/,
  /google\.com\/recaptcha/,
  /gstatic\.com\/recaptcha/,
  /hotjar/,
  /clarity\.ms/,
];

const buildRoutes = (): string[] => {
  const routes: string[] = [];
  for (const occasion of OCCASIONS as any[]) {
    routes.push(`/mensajes/${occasion.slug}`);
    for (const rel of RELATIONSHIPS as any[]) {
      routes.push(`/mensajes/${occasion.slug}/${rel.slug}`);
    }
  }
  return routes;
};

const main = async () => {
  const routes = buildRoutes();
  console.log(`[prerender] Preparando ${routes.length} rutas /mensajes/*...`);

  let server: Awaited<ReturnType<typeof preview>>;
  try {
    server = await preview({ preview: { port: 4173, open: false } });
  } catch (err: any) {
    console.error(
      `[prerender] No se pudo iniciar el servidor de preview, se omite el prerenderizado: ${err?.message}`,
    );
    return;
  }

  let browser: Browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
      ],
    });
  } catch (err: any) {
    console.error(
      `[prerender] No se pudo lanzar el navegador, se omite el prerenderizado: ${err?.message}`,
    );
    await server.close();
    return;
  }

  const baseUrl = server.resolvedUrls?.local?.[0];
  if (!baseUrl) {
    console.error("[prerender] No se pudo resolver la URL del servidor.");
    await browser.close();
    await server.close();
    return;
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (BLOCKED_PATTERNS.some((p) => p.test(req.url()))) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Snapshot limpio: acepta cookies y oculta onboarding/trials
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem("cookie_consent", "true");
      } catch {}
      try {
        localStorage.setItem("trial_onboarding_seen", "true");
      } catch {}
      try {
        localStorage.setItem("quickstart_completed", "true");
      } catch {}
    });

    let ok = 0;
    for (const route of routes) {
      try {
        await page.goto(`${baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        // El h1 solo existe cuando el contenido de la ocasión terminó de renderizar
        await page.waitForSelector("h1", { timeout: 15000 });
        // Esperar a que terminen efectos/splash (loader se elimina a los ~450ms)
        await new Promise((r) => setTimeout(r, 700));

        const html = await page.evaluate(
          () => `<!doctype html>\n${document.documentElement.outerHTML}`,
        );
        const outFile = path.join(DIST_DIR, route, "index.html");
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, html);
        console.log(`  ✓ ${route}  (${(await page.title()).slice(0, 60)})`);
        ok++;
      } catch (err: any) {
        console.warn(`  ✗ ${route}: ${err?.message}`);
      }
    }

    console.log(
      `[prerender] ${ok}/${routes.length} rutas prerenderizadas en ${DIST_DIR}`,
    );
  } finally {
    await browser.close();
    await server.close();
  }
};

main();
