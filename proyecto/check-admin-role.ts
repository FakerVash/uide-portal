import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminRole() {
    try {
        const admin = await prisma.usuario.findUnique({
            where: { email: 'admin@uide.edu.ec' }
        });
        console.log('Admin User:', admin);
        console.log('Role Type:', typeof admin?.rol);
        console.log('Role Value:', admin?.rol);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdminRole();
