export interface CarreraDTO {
    id_carrera?: number;
    id_facultad: number;
    nombre_carrera: string;
}

export const CarreraSchema = {
    $id: 'Carrera',
    type: 'object',
    required: ['id_facultad', 'nombre_carrera'],
    properties: {
        id_carrera: { type: 'integer' },
        id_facultad: { type: 'integer' },
        nombre_carrera: { type: 'string' }
    }
};
