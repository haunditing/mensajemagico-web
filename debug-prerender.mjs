import puppeteer from "puppeteer";

const BASE = "http://localhost:4173";
const b = await puppeteer.launch({ headless: true, args: ["--no-sandbox","--disable-dev-shm-usage"] });
const p = await b.newPage();
await p.setRequestInterception(true);
p.on("request", req => {
  const u = req.url();
  if (/google|font|ads|gtag|doubleclick|hotjar|clarity/i.test(u)) req.abort(); else req.continue();
});
await p.goto(`${BASE}/mensajes/navidad`, { waitUntil: "networkidle0", timeout: 30000 });
console.log("URL:", p.url());
console.log("PATH:", await p.evaluate(() => window.location.pathname));
console.log("TITLE:", await p.title());
console.log("H1:", await p.evaluate(() => document.querySelector("h1")?.textContent.trim().slice(0,80)));
console.log("OG TITLE:", await p.evaluate(() => document.querySelector("meta[property='og:title']")?.content));
await b.close();
