export interface LoginDTO {
    email: string;
    contrasena: string;
}

export interface AuthResponseDTO {
    token: string;
    usuario: {
        id_usuario: number;
        email: string;
        nombre: string;
        rol: string;
    };
}

export const LoginSchema = {
    $id: 'Login',
    type: 'object',
    required: ['email', 'contrasena'],
    properties: {
        email: { type: 'string', format: 'email' },
        contrasena: { type: 'string' }
    }
};

export const AuthResponseSchema = {
    $id: 'AuthResponse',
    type: 'object',
    properties: {
        token: { type: 'string' },
        usuario: {
            type: 'object',
            properties: {
                id_usuario: { type: 'integer' },
                email: { type: 'string' },
                nombre: { type: 'string' },
                rol: { type: 'string' }
            }
        }
    }
};
export interface Verify2FADTO {
    email: string;
    code: string;
}

export const Verify2FASchema = {
    $id: 'Verify2FA',
    type: 'object',
    required: ['email', 'code'],
    properties: {
        email: { type: 'string', format: 'email' },
        code: { type: 'string', minLength: 6, maxLength: 6 }
    }
};
