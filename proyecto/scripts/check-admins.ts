
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAdmins() {
    console.log('--- Checking Administrators ---');
    const admins = await prisma.usuario.findMany({
        where: { rol: 'ADMIN' }
    });
    console.log('Current Admins:', JSON.stringify(admins, null, 2));

    if (admins.length === 0) {
        console.log('NO ADMINS FOUND! Recreating default admin (admin@uide.edu.ec)...');

        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const newAdmin = await prisma.usuario.create({
            data: {
                email: 'admin@uide.edu.ec',
                contrasena: hashedPassword,
                nombre: 'Admin',
                apellido: 'Sistema',
                rol: 'ADMIN',
                activo: true
            }
        });
        console.log('Admin recreated successfully:', newAdmin.email);
    } else {
        console.log('Admins still exist. No restoration needed.');
    }
}

checkAdmins().catch(console.error).finally(() => prisma.$disconnect());
