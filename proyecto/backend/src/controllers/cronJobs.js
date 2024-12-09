import cron from "node-cron";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// Crear una única instancia de PrismaClient
const prisma = new PrismaClient();

const iniciarCronJobs = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        console.log("Iniciando la tarea de revisión de cursos...");
        const fechaActual = new Date();

        // Ajustar la fecha actual para que sea a las 00:00:00 del día
        fechaActual.setHours(0, 0, 0, 0); // Establecer a las 00:00:00 para evitar la influencia de la hora

        console.log(`Fecha actual (sin hora): ${fechaActual}`);

        // Ejecutar la consulta para obtener los cursos con fecha límite menor a la fecha actual
        const cursosVencidos = await prisma.cursoCapacitacion.findMany({
          where: {
            estado_curso: true, // Asegúrate de que este campo exista para verificar si el curso está activo
            fecha_limite: {
              lt: fechaActual, // Comparar solo las fechas sin la hora
            },
          },
        });

        console.log(
          "Cursos vencidos encontrados:",
          JSON.stringify(cursosVencidos, null, 2)
        );

        if (cursosVencidos.length > 0) {
          console.log(
            `Se encontraron ${cursosVencidos.length} cursos vencidos.`
          );

          // Deshabilitar los cursos vencidos actualizando su estado
          await prisma.cursoCapacitacion.updateMany({
            where: {
              id_curso: {
                in: cursosVencidos.map((curso) => curso.id_curso),
              },
            },
            data: {
              estado_curso: false, // Actualizar estado a false (deshabilitado)
            },
          });

          console.log("Cursos vencidos deshabilitados correctamente.");
        } else {
          console.log("No se encontraron cursos vencidos.");
        }
      } catch (error) {
        console.error("Error detallado al procesar la revisión de cursos:", {
          mensaje: error.message,
          stack: error.stack,
        });
      } finally {
        // No es necesario desconectar aquí ya que queremos mantener la conexión
        // para futuros jobs
      }
    },
    {
      scheduled: true,
      timezone: "America/Santiago", // Asegúrate de que el cron esté configurado para la zona correcta
    }
  );
};

// Manejar el cierre de la aplicación
process.on("SIGTERM", async () => {
  console.log("Cerrando conexión Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

export default iniciarCronJobs;
