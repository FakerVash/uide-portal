import { FastifyInstance } from 'fastify';

export class AuditService {
    /**
     * Registra una acción en la auditoría del sistema.
     * @param server Instancia de Fastify con Prisma
     * @param idUsuario ID del usuario que realiza la acción
     * @param accion Descripción corta de la acción (ej: 'CREAR_SERVICIO')
     * @param detalles Detalles adicionales (opcional, puede ser objeto o string)
     * @param ip Dirección IP del usuario (opcional)
     */
    static async log(
        server: FastifyInstance,
        idUsuario: number,
        accion: string,
        detalles?: any,
        ip?: string
    ) {
        try {
            // LOGGING DISABLED BY USER REQUEST
            // const detallesStr = detalles ? (typeof detalles === 'string' ? detalles : JSON.stringify(detalles)) : null;

            // await server.prisma.auditoria.create({
            //     data: {
            //         id_usuario: idUsuario,
            //         accion,
            //         detalles: detallesStr,
            //         ip: ip || null
            //     }
            // });
            return;
        } catch (error) {
            console.error('Error al registrar auditoría:', error);
            // No lanzamos el error para no interrumpir el flujo principal
        }
    }
}
