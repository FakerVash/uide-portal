import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { McpAuthService } from '../services/mcp-auth.service.js';

dotenv.config();

/**
 * Script de prueba para el sistema de autenticación MCP
 */
async function testMcpAuth() {
    console.log('🔐 Iniciando pruebas de autenticación MCP...\n');

    // Crear conexión a la base de datos
    const dbUrl = new URL(process.env.DATABASE_URL!);
    const pool = mysql.createPool({
        host: dbUrl.hostname,
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.split("/")[1],
        port: parseInt(dbUrl.port) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        ssl: {
            rejectUnauthorized: false
        }
    });

    const mcpAuthService = new McpAuthService(pool);

    try {
        // Test 1: Guardar código de autenticación
        console.log('📝 Test 1: Guardar código de autenticación');
        const correo1 = 'test@ejemplo.com';
        const codigo1 = 'TEST-' + Math.random().toString(36).substring(7).toUpperCase();

        const id1 = await mcpAuthService.guardarCodigoAutenticacion(correo1, codigo1);
        console.log(`✅ Código guardado - ID: ${id1}, Correo: ${correo1}, Código: ${codigo1}\n`);

        // Test 2: Guardar otro código para el mismo correo
        console.log('📝 Test 2: Guardar segundo código para el mismo correo');
        const codigo2 = 'TEST-' + Math.random().toString(36).substring(7).toUpperCase();

        const id2 = await mcpAuthService.guardarCodigoAutenticacion(correo1, codigo2);
        console.log(`✅ Segundo código guardado - ID: ${id2}, Código: ${codigo2}\n`);

        // Test 3: Verificar código válido
        console.log('🔍 Test 3: Verificar código válido');
        const esValido = await mcpAuthService.verificarCodigo(correo1, codigo1);
        console.log(`✅ Verificación: ${esValido ? 'VÁLIDO' : 'INVÁLIDO'}\n`);

        // Test 4: Verificar código inválido
        console.log('🔍 Test 4: Verificar código inválido');
        const esInvalido = await mcpAuthService.verificarCodigo(correo1, 'CODIGO-FALSO');
        console.log(`✅ Verificación: ${esInvalido ? 'VÁLIDO' : 'INVÁLIDO (esperado)'}\n`);

        // Test 5: Obtener historial
        console.log('📋 Test 5: Obtener historial de autenticaciones');
        const historial = await mcpAuthService.obtenerHistorial(correo1);
        console.log(`✅ Total de autenticaciones: ${historial.length}`);
        console.log('Historial:');
        historial.forEach((auth, index) => {
            console.log(`  ${index + 1}. ID: ${auth.id_autenticacion}, Código: ${auth.codigo}, Fecha: ${auth.fecha_solicitud}`);
        });
        console.log('');

        // Test 6: Guardar código para otro correo
        console.log('📝 Test 6: Guardar código para otro correo');
        const correo2 = 'otro@ejemplo.com';
        const codigo3 = 'TEST-' + Math.random().toString(36).substring(7).toUpperCase();

        const id3 = await mcpAuthService.guardarCodigoAutenticacion(correo2, codigo3);
        console.log(`✅ Código guardado - ID: ${id3}, Correo: ${correo2}, Código: ${codigo3}\n`);

        // Test 7: Verificar que los códigos son específicos por correo
        console.log('🔍 Test 7: Verificar que los códigos son específicos por correo');
        const verificacionCruzada = await mcpAuthService.verificarCodigo(correo2, codigo1);
        console.log(`✅ Código de ${correo1} usado en ${correo2}: ${verificacionCruzada ? 'VÁLIDO (error!)' : 'INVÁLIDO (correcto)'}\n`);

        console.log('✨ Todas las pruebas completadas exitosamente!\n');

    } catch (error: any) {
        console.error('❌ Error durante las pruebas:', error.message);
    } finally {
        await pool.end();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar pruebas
testMcpAuth().catch(console.error);
