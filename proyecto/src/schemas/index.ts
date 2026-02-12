export const UsuarioSchema = {
    $id: 'Usuario',
    type: 'object',
    properties: {
        id_usuario: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        nombre: { type: 'string' },
        apellido: { type: 'string' },
        telefono: { type: 'string', nullable: true },
        rol: { type: 'string', enum: ['ESTUDIANTE', 'CLIENTE', 'ADMIN'] },
        foto_perfil: { type: 'string', nullable: true },
        calificacion_promedio: { type: 'number', nullable: true },
        fecha_registro: { type: 'string', format: 'date-time' },
        activo: { type: 'boolean' }
    }
};

export const ServicioSchema = {
    $id: 'Servicio',
    type: 'object',
    properties: {
        id_servicio: { type: 'integer' },
        id_usuario: { type: 'integer' },
        id_categoria: { type: 'integer' },
        titulo: { type: 'string' },
        descripcion: { type: 'string' },
        precio: { type: 'number' },
        tiempo_entrega: { type: 'string', nullable: true },
        imagen_portada: { type: 'string', nullable: true },
        fecha_publicacion: { type: 'string', format: 'date-time' },
        activo: { type: 'boolean' }
    }
};



export const CategoriaSchema = {
    $id: 'Categoria',
    type: 'object',
    properties: {
        id_categoria: { type: 'integer' },
        nombre_categoria: { type: 'string' },
        descripcion: { type: 'string', nullable: true },
        icono: { type: 'string', nullable: true }
    }
};
