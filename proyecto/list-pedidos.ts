import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const pedidos = await prisma.pedido.findMany({
        where: { estado: 'COMPLETADO' },
        include: {
            servicio: {
                select: { titulo: true, id_usuario: true }
            },
            cliente: {
                select: { nombre: true, apellido: true }
            }
        }
    });
    console.log(JSON.stringify(pedidos, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
