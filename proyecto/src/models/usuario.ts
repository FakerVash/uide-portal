export interface UsuarioDTO {
    id_usuario?: number;
    email: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    id_carrera?: number;
    rol?: 'ESTUDIANTE' | 'CLIENTE' | 'ADMIN';
    foto_perfil?: string;
    calificacion_promedio?: number;
    fecha_registro?: Date;
    activo?: boolean;
    codigo?: string;
    bio?: string;
    banner?: string;
    university?: string;
    career?: string;
    habilidades?: number[];
}

// Schema for response (full object)
export const UsuarioSchema = {
    $id: 'Usuario',
    type: 'object',
    required: ['email', 'nombre', 'apellido'],
    properties: {
        id_usuario: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        nombre: { type: 'string' },
        apellido: { type: 'string' },
        telefono: { type: 'string', nullable: true },
        id_carrera: { type: 'integer', nullable: true },
        rol: { type: 'string', enum: ['ESTUDIANTE', 'CLIENTE', 'ADMIN'], default: 'CLIENTE' },
        foto_perfil: { type: 'string', nullable: true },
        calificacion_promedio: { type: 'number', nullable: true },
        fecha_registro: { type: 'string', format: 'date-time' },
        activo: { type: 'boolean', default: true },
        bio: { type: 'string', nullable: true },
        banner: { type: 'string', nullable: true },
        university: { type: 'string', nullable: true },
        career: { type: 'string', nullable: true }, // Some users might have text career instead of relation
        carrera: { $ref: 'Carrera#', nullable: true }
    }
};

// Schema for creation (input only)
export const CreateUsuarioSchema = {
    $id: 'CreateUsuario',
    type: 'object',
    required: ['email', 'contrasena', 'nombre', 'apellido'],
    properties: {
        email: { type: 'string', format: 'email' },
        contrasena: { type: 'string' },
        nombre: { type: 'string' },
        apellido: { type: 'string' },
        telefono: { type: 'string', nullable: true },
        id_carrera: { type: 'integer', nullable: true },
        rol: { type: 'string', enum: ['ESTUDIANTE', 'CLIENTE', 'ADMIN'], default: 'CLIENTE' },
        foto_perfil: { type: 'string', nullable: true },
        codigo: { type: 'string' }
    }
};

// Schema for updating (all optional)
export const UpdateUsuarioSchema = {
    $id: 'UpdateUsuario',
    type: 'object',
    properties: {
        email: { type: 'string', format: 'email' },
        contrasena: { type: 'string' },
        nombre: { type: 'string' },
        apellido: { type: 'string' },
        telefono: { type: 'string', nullable: true },
        id_carrera: { type: 'integer', nullable: true },
        foto_perfil: { type: 'string', nullable: true },
        bio: { type: 'string', nullable: true },
        banner: { type: 'string', nullable: true },
        university: { type: 'string', nullable: true },
        career: { type: 'string', nullable: true },
        habilidades: { type: 'array', items: { type: 'integer' }, nullable: true }
    }
};
