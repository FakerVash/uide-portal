import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function checkReviews() {
    try {
        console.log('Checking reviews...');
        const reviews = await prisma.resena.findMany({
            include: {
                usuario: {
                    select: { nombre: true, apellido: true }
                },
                servicio: {
                    select: { titulo: true }
                }
            }
        });

        console.log(`Found ${reviews.length} total reviews.`);

        fs.writeFileSync('reviews_debug.json', JSON.stringify(reviews, null, 2));

        const services = await prisma.servicio.findMany({
            include: {
                _count: {
                    select: { resenas: true }
                }
            }
        });

        const servicesWithReviews = services.filter(s => s._count.resenas > 0);
        console.log(`Found ${servicesWithReviews.length} services with reviews.`);
    } catch (error) {
        console.error('Error checking reviews:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkReviews();
