export interface PedidoDTO {
    id_pedido?: number;
    id_servicio: number;
    id_cliente: number;
    estado?: 'PENDIENTE' | 'EN_PROCESO' | 'CASI_TERMINADO' | 'COMPLETADO' | 'CANCELADO';
    monto_total: number;
    notas?: string;
}
