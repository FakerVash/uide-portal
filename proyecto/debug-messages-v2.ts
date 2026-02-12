import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- START DEBUG ---');
    try {
        const mensajes = await prisma.mensaje.findMany({
            orderBy: { fecha_envio: 'desc' },
            take: 5
        });

        console.log(`Found ${mensajes.length} messages.`);
        if (mensajes.length === 0) {
            console.log('NO MESSAGES FOUND.');
        } else {
            for (const m of mensajes) {
                console.log(`ID: ${m.id_mensaje} | From: ${m.id_emisor} -> To: ${m.id_receptor} | Date: ${m.fecha_envio} | Content: ${m.contenido.substring(0, 50)}...`);
            }
        }
    } catch (e) {
        console.error('ERROR:', e);
    }
    console.log('--- END DEBUG ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
