export interface ResenaDTO {
    id_resena?: number;
    id_pedido: number;
    id_servicio: number;
    calificacion: number;
    comentario?: string;
    fecha_resena?: Date;
}

export const ResenaSchema = {
    $id: 'Resena',
    type: 'object',
    required: ['id_pedido', 'id_servicio', 'calificacion'],
    properties: {
        id_resena: { type: 'integer' },
        id_pedido: { type: 'integer' },
        id_servicio: { type: 'integer' },
        calificacion: { type: 'integer', minimum: 1, maximum: 5 },
        comentario: { type: 'string', nullable: true },
        fecha_resena: { type: 'string', format: 'date-time' }
    }
};
