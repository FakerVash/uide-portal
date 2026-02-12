import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
    try {
        // Check the most recent service
        const service = await prisma.servicio.findFirst({
            where: { id_servicio: 8 },
            include: {
                imagenes: true
            }
        });

        console.log('Service data:');
        console.log(JSON.stringify(service, null, 2));

        // Check all images in the table
        const allImages = await prisma.servicioImagen.findMany();
        console.log('\nAll images in servicio_imagenes:');
        console.log(JSON.stringify(allImages, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkImages();
