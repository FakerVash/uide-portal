import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCarreras() {
    try {
        const carreras = await prisma.carrera.findMany({
            include: {
                facultad: true
            }
        });

        console.log('\n✅ Carreras en la base de datos:\n');
        carreras.forEach((carrera, index) => {
            console.log(`${index + 1}. ${carrera.nombre_carrera}`);
            console.log(`   Facultad: ${carrera.facultad.nombre_facultad}`);
            console.log(`   ID: ${carrera.id_carrera}\n`);
        });

        console.log(`\n📊 Total de carreras: ${carreras.length}`);
    } catch (error) {
        console.error('Error al verificar carreras:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyCarreras();
