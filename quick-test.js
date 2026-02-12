// Prueba rápida de conexión a Aurora
const mysql = require('mysql2/promise');

async function quickTest() {
    try {
        console.log('🔧 Conectando a AWS Aurora...');
        
        const connection = await mysql.createConnection({
            host: 'database-1.cgfqom6awot1.us-east-1.rds.amazonaws.com',
            port: 3306,
            user: 'admin',
            password: 'nandos27',
            database: 'uide_portal',
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('✅ Conexión exitosa!');
        
        // Probar query
        const [result] = await connection.execute('SELECT VERSION() as version');
        console.log(`📊 MySQL Version: ${result[0].version}`);
        
        // Verificar tablas
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tablas encontradas: ${tables.length}`);
        
        await connection.end();
        console.log('🎉 Prueba completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

quickTest();
