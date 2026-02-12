import mysql from 'mysql2/promise';
import { EmailService } from './email.service.js';

/**
 * Servicio para guardar códigos de autenticación MCP en la base de datos
 */
export class McpAuthService {
    private pool: mysql.Pool;
    private emailService: EmailService;

    constructor(pool: mysql.Pool) {
        this.pool = pool;
        this.emailService = new EmailService();
    }

    /**
     * Guarda un código de autenticación MCP en la base de datos y lo envía por correo
     * @param correo - Email del usuario
     * @param codigo - Código de autenticación generado
     * @returns ID del registro creado
     */
    async guardarCodigoAutenticacion(correo: string, codigo: string): Promise<number> {
        try {
            // 1. Guardar en base de datos
            const query = `
                INSERT INTO autenticacion_mcp (correo, codigo, fecha_solicitud)
                VALUES (?, ?, NOW())
            `;

            const [result] = await this.pool.execute(query, [correo, codigo]);
            const insertResult = result as mysql.ResultSetHeader;

            console.error(`Código de autenticación guardado para ${correo} - ID: ${insertResult.insertId}`);

            // 2. Enviar por correo
            const enviado = await this.emailService.enviarCodigoMcp(correo, codigo);
            if (!enviado) {
                console.warn(`Advertencia: No se pudo enviar el correo a ${correo}`);
            }

            return insertResult.insertId;
        } catch (error: any) {
            console.error('Error al guardar código de autenticación:', error.message);
            throw new Error(`No se pudo guardar el código de autenticación: ${error.message}`);
        }
    }

    /**
     * Verifica si un código de autenticación es válido
     * @param correo - Email del usuario
     * @param codigo - Código a verificar
     * @returns true si el código es válido
     */
    async verificarCodigo(correo: string, codigo: string): Promise<boolean> {
        try {
            const query = `
                SELECT id_autenticacion 
                FROM autenticacion_mcp 
                WHERE correo = ? AND codigo = ?
                ORDER BY fecha_solicitud DESC
                LIMIT 1
            `;

            const [rows] = await this.pool.execute(query, [correo, codigo]);
            const results = rows as any[];

            return results.length > 0;
        } catch (error: any) {
            console.error('Error al verificar código:', error.message);
            return false;
        }
    }

    /**
     * Obtiene el historial de autenticaciones de un correo
     * @param correo - Email del usuario
     * @returns Lista de autenticaciones
     */
    async obtenerHistorial(correo: string): Promise<any[]> {
        try {
            const query = `
                SELECT id_autenticacion, correo, codigo, fecha_solicitud
                FROM autenticacion_mcp
                WHERE correo = ?
                ORDER BY fecha_solicitud DESC
            `;

            const [rows] = await this.pool.execute(query, [correo]);
            return rows as any[];
        } catch (error: any) {
            console.error('Error al obtener historial:', error.message);
            return [];
        }
    }
}
