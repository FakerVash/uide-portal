import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const carreras = await prisma.carrera.findMany();
    console.log(JSON.stringify(carreras, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
