export interface ServicioDTO {
    id_servicio?: number;
    id_usuario: number;
    id_categoria: number;
    titulo: string;
    descripcion: string;
    precio: number;
    tiempo_entrega?: string;
    imagen_portada?: string;
    imagenes?: string[];
    fecha_publicacion?: Date;
    activo?: boolean;
    archivado?: boolean;
}

export const ServicioSchema = {
    $id: 'Servicio',
    type: 'object',
    required: ['id_usuario', 'id_categoria', 'titulo', 'descripcion', 'precio'],
    properties: {
        id_servicio: { type: 'integer' },
        id_usuario: { type: 'integer' },
        id_categoria: { type: 'integer' },
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        precio: { type: 'number' },
        tiempo_entrega: { type: 'string', nullable: true },
        imagen_portada: { type: 'string', nullable: true },
        imagenes: {
            type: 'array',
            items: { type: 'string' }
        },
        fecha_publicacion: { type: 'string', format: 'date-time' },
        calificacion_promedio: { type: 'number', nullable: true },
        activo: { type: 'boolean', default: true },
        archivado: { type: 'boolean', default: false },
        categoria: {
            type: 'object',
            properties: {
                id_categoria: { type: 'integer' },
                nombre_categoria: { type: 'string' },
                descripcion: { type: 'string', nullable: true },
                icono: { type: 'string', nullable: true }
            }
        },
        usuario: {
            type: 'object',
            properties: {
                id_usuario: { type: 'integer' },
                nombre: { type: 'string' },
                apellido: { type: 'string' },
                email: { type: 'string' },
                telefono: { type: 'string', nullable: true },
                foto_perfil: { type: 'string', nullable: true },
                calificacion_promedio: { type: 'number' } // decimal in prisma commonly mapped to number in JSON
            }
        },
        _count: {
            type: 'object',
            properties: {
                resenas: { type: 'integer' }
            }
        }
    }
};

export const ServicioUpdateSchema = {
    $id: 'ServicioUpdate',
    type: 'object',
    properties: {
        id_categoria: { type: 'integer' },
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        precio: { type: 'number' },
        tiempo_entrega: { type: 'string', nullable: true },
        imagen_portada: { type: 'string', nullable: true },
        activo: { type: 'boolean' }
    }
};
