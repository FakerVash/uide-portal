export interface AuditoriaDTO {
    id_auditoria?: number;
    id_usuario: number;
    accion: string;
    detalles?: string | null;
    fecha?: string | Date;
    ip?: string | null;
}

export const AuditoriaSchema = {
    $id: 'Auditoria',
    type: 'object',
    properties: {
        id_auditoria: { type: 'integer' },
        id_usuario: { type: 'integer' },
        accion: { type: 'string' },
        detalles: { type: 'string', nullable: true },
        fecha: { type: 'string', format: 'date-time' },
        ip: { type: 'string', nullable: true },
        usuario: { $ref: 'Usuario#' }
    }
};
