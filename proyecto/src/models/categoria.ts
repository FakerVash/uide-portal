export interface CategoriaDTO {
    id_categoria?: number;
    nombre_categoria: string;
    descripcion?: string;
    icono?: string;
}

export const CategoriaSchema = {
    $id: 'Categoria',
    type: 'object',
    required: ['nombre_categoria'],
    properties: {
        id_categoria: { type: 'integer' },
        nombre_categoria: { type: 'string' },
        descripcion: { type: 'string', nullable: true },
        icono: { type: 'string', nullable: true }
    }
};
