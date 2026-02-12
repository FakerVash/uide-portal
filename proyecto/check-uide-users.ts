import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.usuario.findMany({
        where: {
            email: {
                endsWith: '@uide.edu.ec'
            }
        },
        select: {
            email: true,
            rol: true
        }
    });

    console.log('--- Users with @uide.edu.ec ---');
    console.log(users);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
