import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@uide.edu.ec';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            email,
            contrasena: hashedPassword,
            nombre: 'Administrador',
            apellido: 'Sistema',
            rol: Rol.ADMIN,
            activo: true,
            bio: 'Cuenta administrativa del sistema',
            foto_perfil: 'https://ui-avatars.com/api/?name=Admin+Sistema&background=870a42&color=fff'
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
