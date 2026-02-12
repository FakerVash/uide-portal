import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando carga de datos iniciales...');

    // 1. Seed de Categorías
    const categorias = [
        { nombre_categoria: 'Desarrollo Web', descripcion: 'Sistemas y apps online', icono: 'code' },
        { nombre_categoria: 'Diseño Gráfico', descripcion: 'Logos y branding', icono: 'palette' },
        { nombre_categoria: 'Tutorías', descripcion: 'Clases académicas', icono: 'school' },
        { nombre_categoria: 'Multimedia', descripcion: 'Video y audio', icono: 'movie' },
        { nombre_categoria: 'Asesorías', descripcion: 'Proyectos y consultoría', icono: 'people' },
        { nombre_categoria: 'Redacción', descripcion: 'Contenido y ensayos', icono: 'edit' },
        { nombre_categoria: 'Traducción', descripcion: 'Múltiples idiomas', icono: 'translate' },
        { nombre_categoria: 'Marketing', descripcion: 'Digital y redes', icono: 'trending_up' },
        { nombre_categoria: 'Programación', descripcion: 'Software y apps', icono: 'laptop_mac' },
        { nombre_categoria: 'Consultoría', descripcion: 'Estratégica', icono: 'business_center' }
    ];

    for (const cat of categorias) {
        await prisma.categoria.upsert({
            where: { nombre_categoria: cat.nombre_categoria },
            update: {},
            create: cat
        });
    }
    console.log('✅ Categorías cargadas');

    // 2. Seed de Administrador
    const emailAdmin = 'admin@uide.edu.ec';
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    await prisma.usuario.upsert({
        where: { email: emailAdmin },
        update: {},
        create: {
            email: emailAdmin,
            contrasena: hashedAdminPassword,
            nombre: 'Administrador',
            apellido: 'Sistema',
            rol: Rol.ADMIN,
            activo: true,
            bio: 'Cuenta administrativa',
            foto_perfil: 'https://ui-avatars.com/api/?name=Admin+Sistema&background=870a42&color=fff'
        }
    });
    console.log('✅ Administrador configurado (admin@uide.edu.ec / admin123)');

    console.log('✨ Carga de datos completada con éxito.');
}

main()
    .catch((e) => {
        console.error('❌ Error en el proceso de seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
