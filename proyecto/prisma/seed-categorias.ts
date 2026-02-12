import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategorias() {
    console.log('🌱 Iniciando seed de categorías...');

    const categorias = [
        {
            nombre_categoria: 'Desarrollo Web',
            descripcion: 'Creación y desarrollo de sitios web, aplicaciones web y sistemas online',
            icono: 'code'
        },
        {
            nombre_categoria: 'Diseño Gráfico',
            descripcion: 'Diseño de logos, branding, ilustraciones y material gráfico',
            icono: 'palette'
        },
        {
            nombre_categoria: 'Tutorías',
            descripcion: 'Clases particulares y tutorías académicas en diversas materias',
            icono: 'school'
        },
        {
            nombre_categoria: 'Multimedia',
            descripcion: 'Edición de video, audio, fotografía y contenido multimedia',
            icono: 'movie'
        },
        {
            nombre_categoria: 'Asesorías',
            descripcion: 'Asesoramiento profesional en proyectos de grado y consultorías',
            icono: 'people'
        },
        {
            nombre_categoria: 'Redacción',
            descripcion: 'Redacción de contenido, artículos, ensayos y textos profesionales',
            icono: 'edit'
        },
        {
            nombre_categoria: 'Traducción',
            descripcion: 'Servicios de traducción en múltiples idiomas',
            icono: 'translate'
        },
        {
            nombre_categoria: 'Marketing',
            descripcion: 'Marketing digital, gestión de redes sociales y publicidad',
            icono: 'trending_up'
        },
        {
            nombre_categoria: 'Programación',
            descripcion: 'Desarrollo de software, apps móviles y soluciones tecnológicas',
            icono: 'laptop_mac'
        },
        {
            nombre_categoria: 'Consultoría',
            descripcion: 'Consultoría empresarial y asesoramiento estratégico',
            icono: 'business_center'
        }
    ];

    for (const categoria of categorias) {
        try {
            const created = await prisma.categoria.upsert({
                where: { nombre_categoria: categoria.nombre_categoria },
                update: {},
                create: categoria
            });
            console.log(`✅ Categoría creada: ${created.nombre_categoria}`);
        } catch (error) {
            console.log(`⚠️  Categoría ya existe: ${categoria.nombre_categoria}`);
        }
    }

    console.log('✨ Seed de categorías completado!');
}

seedCategorias()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
