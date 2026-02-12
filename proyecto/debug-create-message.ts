import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Get two users
    const users = await prisma.usuario.findMany({ take: 2 });
    if (users.length < 2) {
        console.error('Need at least 2 users');
        return;
    }

    const emisor = users[0];
    const receptor = users[1];

    console.log(`Simulating message from ${emisor.email} (ID: ${emisor.id_usuario}) to ${receptor.email} (ID: ${receptor.id_usuario})`);

    // 2. Create message manually using Prisma to verify DB is fine
    /*
    const msg = await prisma.mensaje.create({
        data: {
            id_emisor: emisor.id_usuario,
            id_receptor: receptor.id_usuario,
            contenido: 'Test message form script'
        }
    });
    console.log('Created message via Prisma:', msg);
    */

    // 3. We want to test logic, but we can't easily fetch via HTTP here without running server.
    // Instead, let's trust Prisma works (debug-db-check worked) and focus on frontend logic.
    // But wait, if previous debug-messages found 0, then NO messages were created ever.

    // Let's create one via Prisma to ensure the table works.
    try {
        const msg = await prisma.mensaje.create({
            data: {
                id_emisor: emisor.id_usuario,
                id_receptor: receptor.id_usuario,
                contenido: 'AUTOMATED TEST MESSAGE'
            }
        });
        console.log('✅ Success! Message created via Prisma:', msg.id_mensaje);
    } catch (e) {
        console.error('❌ Failed to create message via Prisma:', e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
