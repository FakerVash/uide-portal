
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Service Images ---');
    const services = await prisma.servicio.findMany();

    for (const service of services) {
        if (service.imagen_portada && typeof service.imagen_portada === 'string') {
            const originalUrl = service.imagen_portada;
            // Check if it's an upload URL
            if (originalUrl.includes('uploads') || originalUrl.endsWith(' ')) {
                // Extract filename. Handle both absolute URL and relative path cases
                let filename = '';
                let isAbsolute = false;

                if (originalUrl.startsWith('http')) {
                    const parts = originalUrl.split('/');
                    filename = parts[parts.length - 1];
                    isAbsolute = true;
                } else if (originalUrl.startsWith('/uploads/')) {
                    filename = originalUrl.replace('/uploads/', '');
                } else {
                    // Maybe it's just the filename or something else
                    // If it ends with space, we assume it's a filename or path
                    if (originalUrl.endsWith(' ')) {
                        filename = path.basename(originalUrl);
                    }
                }

                if (filename && filename.endsWith(' ')) {
                    const trimmedFilename = filename.trim();
                    console.log(`Fixing Service ${service.id_servicio}: '${filename}' -> '${trimmedFilename}'`);

                    // fix file on disk
                    const uploadsDir = path.resolve(process.cwd(), 'uploads');
                    const oldPath = path.join(uploadsDir, filename);
                    const newPath = path.join(uploadsDir, trimmedFilename);

                    if (fs.existsSync(oldPath)) {
                        fs.renameSync(oldPath, newPath);
                        console.log(`  Renamed file on disk.`);
                    } else {
                        console.log(`  File not found on disk: ${oldPath}`);
                        // If file not found, we still update DB? check if newPath exists
                        if (fs.existsSync(newPath)) {
                            console.log(`  Target file already exists: ${newPath}`);
                        }
                    }

                    // update DB
                    // We also want to convert absolute to relative if possible, or just keep it relative
                    const newUrl = `/uploads/${trimmedFilename}`;

                    await prisma.servicio.update({
                        where: { id_servicio: service.id_servicio },
                        data: { imagen_portada: newUrl }
                    });
                    console.log(`  Updated DB to: ${newUrl}`);
                } else if (isAbsolute) {
                    // Convert absolute to relative even if no space?
                    // e.g. http://localhost/uploads/foo.jpg -> /uploads/foo.jpg
                    // This fixes the port 80 issue
                    const newUrl = `/uploads/${filename}`;
                    if (newUrl !== originalUrl) {
                        await prisma.servicio.update({
                            where: { id_servicio: service.id_servicio },
                            data: { imagen_portada: newUrl }
                        });
                        console.log(`  Converted absolute URL to relative: ${originalUrl} -> ${newUrl}`);
                    }
                } else {
                    // Case: DB URL looks clean (relative, no space), but maybe file on disk has space?
                    const uploadsDir = path.resolve(process.cwd(), 'uploads');
                    const cleanPath = path.join(uploadsDir, filename);
                    const dirtyPath = path.join(uploadsDir, filename + ' '); // Try adding space

                    if (!fs.existsSync(cleanPath) && fs.existsSync(dirtyPath)) {
                        fs.renameSync(dirtyPath, cleanPath);
                        console.log(`  Renamed dirty file on disk (had space): '${filename} ' -> '${filename}'`);
                    }
                }
            }
        }
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
