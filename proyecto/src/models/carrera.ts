export interface CarreraDTO {
    id_carrera?: number;
    id_facultad: number;
    nombre_carrera: string;
    descripcion_carrera?: string;
    imagen_carrera?: string;
    banner_carrera?: string;
    duracion_anios?: number;
    tipo_carrera?: 'PREGRADO' | 'POSTGRADO' | 'MAESTRIA' | 'DOCTORADO';
    activo?: boolean;
}

export const CarreraSchema = {
    $id: 'Carrera',
    type: 'object',
    required: ['id_facultad', 'nombre_carrera'],
    properties: {
        id_carrera: { type: 'integer' },
        id_facultad: { type: 'integer' },
        nombre_carrera: { type: 'string' },
        descripcion_carrera: { type: 'string', nullable: true },
        imagen_carrera: { type: 'string', nullable: true },
        banner_carrera: { type: 'string', nullable: true },
        duracion_anios: { type: 'integer', default: 4 },
        tipo_carrera: {
            type: 'string',
            enum: ['PREGRADO', 'POSTGRADO', 'MAESTRIA', 'DOCTORADO'],
            default: 'PREGRADO'
        },
        activo: { type: 'boolean', default: true },
        facultad: { $ref: 'Facultad#' },
        _count: {
            type: 'object',
            properties: {
                usuarios: { type: 'integer' }
            }
        }
    }
};
