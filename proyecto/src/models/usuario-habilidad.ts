export interface UsuarioHabilidadDTO {
    id_usuario: number;
    id_habilidad: number;
}

export const UsuarioHabilidadSchema = {
    $id: 'UsuarioHabilidad',
    type: 'object',
    required: ['id_usuario', 'id_habilidad'],
    properties: {
        id_usuario: { type: 'integer' },
        id_habilidad: { type: 'integer' }
    }
};
