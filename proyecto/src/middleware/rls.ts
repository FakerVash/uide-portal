export interface UserContext {
    id: number;
    role: string;
}

export function buildRLSFilter(tabla: string, user: UserContext) {
    const filtros: Record<string, { clause: string, params: any[] }> = {
        // 'mensajes', 'pedidos', 'notificaciones', 'carritos', 'favoritos' removed
    };

    return filtros[tabla] || { clause: "1=1", params: [] };
}