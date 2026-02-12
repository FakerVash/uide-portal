import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const codes = await prisma.autenticacionMcp.findMany({
        orderBy: { fecha_solicitud: 'desc' },
        take: 5
    });

    console.log('--- Recent Codes ---');
    console.log(JSON.stringify(codes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
