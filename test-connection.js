const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    try {
        console.log('🔧 Probando conexión a AWS Aurora...');
        await prisma.$connect();
        console.log('✅ Conexión exitosa a Aurora');
        
        // Probar query simple
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Query de prueba exitoso:', result);
        
        await prisma.$disconnect();
        console.log('🎉 Prueba completada!');
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    }
}

testConnection();
