import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkService() {
    try {
        const servicio = await prisma.servicio.findUnique({
            where: { id_servicio: 8 },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        foto_perfil: true,
                        telefono: true,
                        email: true,
                        calificacion_promedio: true
                    }
                },
                categoria: true,
                imagenes: true,
                _count: {
                    select: { resenas: true }
                }
            }
        });

        console.log('Full service object:');
        console.log(JSON.stringify(servicio, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkService();
