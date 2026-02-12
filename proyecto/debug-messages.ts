import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Mensaje records...');
    const mensajes = await prisma.mensaje.findMany({
        orderBy: { fecha_envio: 'desc' },
        take: 10
    });

    console.log(`Found ${mensajes.length} messages.`);
    mensajes.forEach(m => {
        console.log(`[${m.fecha_envio}] From ID: ${m.id_emisor} -> To ID: ${m.id_receptor} | Content: ${m.contenido}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
