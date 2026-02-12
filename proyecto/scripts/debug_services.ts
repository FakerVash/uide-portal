
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Services ---');
    const services = await prisma.servicio.findMany({
        take: 5,
        orderBy: { id_servicio: 'desc' },
        include: {
            categoria: true
        }
    });

    for (const service of services) {
        console.log(`Service ID: ${service.id_servicio}`);
        console.log(`  Title: '${service.titulo}'`);
        console.log(`  Category ID: ${service.id_categoria}`);
        console.log(`  Category Name: '${service.categoria?.nombre_categoria}'`);
        console.log(`  Cover Image: '${service.imagen_portada}'`); // Quotes to see spaces

        if (service.imagen_portada && service.imagen_portada.includes('uploads')) {
            const urlParts = service.imagen_portada.split('/');
            const filename = urlParts[urlParts.length - 1];
            console.log(`  Filename extracted from URL: '${filename}'`);
        } else {
            console.log('  Cover Image does not contain "uploads"');
        }
    }

    console.log('\n--- Checking Uploads Directory ---');
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        console.log(`Uploads dir: ${uploadsDir}`);
        for (const file of files) {
            console.log(`  File: '${file}' (Length: ${file.length})`);
            if (file.endsWith(' ')) {
                console.log('    WARNING: Filename ends with space!');
            }
        }
    } else {
        console.log('Uploads directory not found at:', uploadsDir);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
