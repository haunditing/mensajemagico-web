const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const logger = require("../utils/logger");
// const EmailService = require("./EmailService"); // Asegúrate de tener tu servicio de email

const initScheduledJobs = () => {
  // Ejecutar todos los días a las 9:00 AM (Hora del servidor)
  // Formato Cron: Minuto Hora Día Mes DíaSemana
  cron.schedule("0 9 * * *", async () => {
    logger.info("⏰ Ejecutando tarea automática de recordatorios...");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // 1. Buscar recordatorios cuya 'nextOccurrence' sea HOY
      const reminders = await Reminder.find({
        nextOccurrence: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).populate("userId"); // Traemos datos del usuario para tener su email

      logger.info(
        `📅 Se encontraron ${reminders.length} recordatorios para hoy.`,
      );

      for (const reminder of reminders) {
        if (reminder.userId && reminder.userId.email) {
          // 2. Enviar Notificación (Email)
          // await EmailService.sendReminderEmail(reminder.userId.email, reminder);
          logger.info(
            `📧 Email enviado a ${reminder.userId.email}: "${reminder.title}"`,
          );
        }

        // 3. Actualizar para el próximo año si es recurrente
        if (reminder.isRecurring) {
          const nextDate = new Date(reminder.nextOccurrence);
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          reminder.nextOccurrence = nextDate;
          await reminder.save();
        } else {
          // Si no es recurrente, podríamos marcarlo como 'notified: true' o borrarlo
        }
      }
    } catch (error) {
      logger.error("❌ Error en tarea de recordatorios", { error });
    }
  });
};

module.exports = { initScheduledJobs };
