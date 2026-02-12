import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'osmacasmo@uide.edu.ec';
    console.log(`Checking AutenticacionMcp records for ${email}...`);

    const records = await prisma.autenticacionMcp.findMany({
        where: {
            correo: email
        },
        orderBy: {
            fecha_solicitud: 'desc'
        },
        take: 5
    });

    console.log(`Found ${records.length} records.`);
    records.forEach(r => {
        console.log(`ID: ${r.id_autenticacion}, Date: ${r.fecha_solicitud}, Code Hash: ${r.codigo.substring(0, 10)}...`);
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
