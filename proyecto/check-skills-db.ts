import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSkills() {
    try {
        // Check user ID 2 (Osyual)
        const usuario = await prisma.usuario.findUnique({
            where: { id_usuario: 2 },
            include: {
                habilidades: {
                    include: {
                        habilidad: true
                    }
                }
            }
        });

        console.log('=== USUARIO EN BASE DE DATOS ===');
        console.log('Nombre:', usuario?.nombre, usuario?.apellido);
        console.log('Habilidades en DB:', usuario?.habilidades);
        console.log('\n=== DETALLE DE HABILIDADES ===');
        usuario?.habilidades.forEach((uh, index) => {
            console.log(`${index + 1}. ${uh.habilidad.nombre_habilidad} (ID: ${uh.id_habilidad})`);
        });

        if (!usuario?.habilidades || usuario.habilidades.length === 0) {
            console.log('\n❌ NO HAY HABILIDADES GUARDADAS EN LA BASE DE DATOS');
        } else {
            console.log(`\n✅ ${usuario.habilidades.length} habilidades encontradas en la base de datos`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSkills();
