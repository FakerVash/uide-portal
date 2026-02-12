// Script para probar conexión a AWS Aurora
const mysql = require('mysql2/promise');

// Configuración desde .env
require('dotenv').config();

const auroraConfig = {
    host: 'database-1.cgfqom6awot1.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'nandos27',
    database: 'uide_portal',
    ssl: {
        rejectUnauthorized: false
    },
    connectionLimit: 5,
    acquireTimeout: 60000,
    timeout: 60000
};

async function testConnection() {
    let connection;
    
    try {
        console.log('🔧 Probando conexión a AWS Aurora...');
        console.log(`📍 Host: ${auroraConfig.host}`);
        console.log(`👤 Usuario: ${auroraConfig.user}`);
        console.log(`📊 Base de datos: ${auroraConfig.database}`);
        
        // Intentar conexión
        connection = await mysql.createConnection(auroraConfig);
        
        console.log('✅ Conexión exitosa a AWS Aurora');
        
        // Probar query simple
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Query de prueba exitoso:', rows[0]);
        
        // Verificar si existen tablas principales
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tablas encontradas: ${tables.length}`);
        
        if (tables.length > 0) {
            console.log('📊 Tablas:');
            tables.forEach(table => {
                console.log(`   - ${Object.values(table)[0]}`);
            });
        } else {
            console.log('⚠️  No se encontraron tablas. Ejecute las migraciones:');
            console.log('   npm run db:push');
            console.log('   npm run db:seed');
        }
        
        // Probar latencia
        const start = Date.now();
        await connection.execute('SELECT NOW() as server_time');
        const latency = Date.now() - start;
        console.log(`⚡ Latencia: ${latency}ms`);
        
        console.log('🎉 Prueba de conexión completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Solución: Verifique usuario y contraseña');
        } else if (error.code === 'ENOTFOUND') {
            console.log('💡 Solución: Verifique el endpoint de Aurora');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('💡 Solución: Verifique el Security Group y firewall');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Solución: La base de datos no existe. Créela primero');
        }
        
        process.exit(1);
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar prueba
testConnection();
