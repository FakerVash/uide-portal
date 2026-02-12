export interface FacultadDTO {
    id_facultad?: number;
    nombre_facultad: string;
}

export const FacultadSchema = {
    $id: 'Facultad',
    type: 'object',
    required: ['nombre_facultad'],
    properties: {
        id_facultad: { type: 'integer' },
        nombre_facultad: { type: 'string' }
    }
};
