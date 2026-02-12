export interface HabilidadDTO {
    id_habilidad?: number;
    nombre_habilidad: string;
}

export const HabilidadSchema = {
    $id: 'Habilidad',
    type: 'object',
    required: ['nombre_habilidad'],
    properties: {
        id_habilidad: { type: 'integer' },
        nombre_habilidad: { type: 'string' }
    }
};
