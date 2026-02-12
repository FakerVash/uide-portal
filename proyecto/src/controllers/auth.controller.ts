import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginDTO, Verify2FADTO } from '../models/auth.js';
import bcrypt from 'bcrypt';

export const AuthController = {
    async login(request: FastifyRequest, reply: FastifyReply) {
        const { email, contrasena } = request.body as LoginDTO;

        // Buscar al usuario por email
        const usuario = await request.server.prisma.usuario.findUnique({
            where: { email },
            include: { carrera: true }
        });

        if (!usuario) {
            return reply.status(401).send({ message: 'Credenciales inválidas' });
        }

        // Verificar contraseña con soporte para migración
        let isMatch = false;

        // Si la contraseña guardada parece un hash de bcrypt (empieza con $2)
        if (usuario.contrasena.startsWith('$2')) {
            isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
        } else {
            // Fallback para contraseñas antiguas en texto plano
            if (usuario.contrasena === contrasena) {
                isMatch = true;
                // MIGRACIÓN AUTOMÁTICA: Hashear la contraseña insegura
                const hashedPassword = await bcrypt.hash(contrasena, 10);
                await request.server.prisma.usuario.update({
                    where: { id_usuario: usuario.id_usuario },
                    data: { contrasena: hashedPassword }
                });
            }
        }

        if (!isMatch) {
            return reply.status(401).send({ message: 'Credenciales inválidas' });
        }

        if (!usuario.activo) {
            return reply.status(403).send({ message: 'Usuario inactivo' });
        }

        // BYPASS 2FA FOR ADMIN
        if (email === 'admin@uide.edu.ec') {
            const token = request.server.jwt.sign({
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                rol: usuario.rol
            });

            const { contrasena, ...userResponse } = usuario;

            return {
                token,
                usuario: userResponse
            };
        }

        // GENERAR CÓDIGO 2FA
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // HASHEAR CÓDIGO ANTES DE GUARDAR
        const hashCode = await bcrypt.hash(code, 10);

        // Guardar hash
        await request.server.prisma.autenticacionMcp.create({
            data: {
                correo: email,
                codigo: hashCode // Guardamos el hash, no el código plano
            }
        });

        // Enviar correo (enviamos el código plano AL USUARIO)
        const emailService = new (await import('../services/email.service.js')).EmailService();
        const sent = await emailService.enviarCodigoMcp(email, code);

        if (!sent) {
            return reply.status(500).send({ message: 'Error al enviar código de verificación' });
        }

        return { message: '2FA_REQUIRED', email };
    },

    async verify2FA(request: FastifyRequest, reply: FastifyReply) {
        const { email, code } = request.body as { email: string; code: string };

        // BUSCAR EL ÚLTIMO CÓDIGO GENERADO PARA ESTE EMAIL
        // Ya no podemos buscar por codigo directo porque está hasheado
        const verificacion = await request.server.prisma.autenticacionMcp.findFirst({
            where: {
                correo: email
            },
            orderBy: { fecha_solicitud: 'desc' }
        });

        if (!verificacion) {
            return reply.status(400).send({ message: 'Código incorrecto o expirado' });
        }

        // VERIFICAR CÓDIGO CON BCRYPT
        const isValid = await bcrypt.compare(code, verificacion.codigo);

        if (!isValid) {
            return reply.status(400).send({ message: 'Código incorrecto' });
        }

        // Verificar expiración (15 mins)
        const ahora = new Date();
        const expiracion = new Date(verificacion.fecha_solicitud);
        expiracion.setMinutes(expiracion.getMinutes() + 15);

        if (ahora > expiracion) {
            return reply.status(400).send({ message: 'El código ha expirado' });
        }

        // Buscar usuario para generar token
        const usuario = await request.server.prisma.usuario.findUnique({
            where: { email },
            include: { carrera: true }
        });

        if (!usuario) {
            return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Eliminar código usado
        await request.server.prisma.autenticacionMcp.delete({
            where: { id_autenticacion: verificacion.id_autenticacion }
        });

        // Generar token JWT
        const token = request.server.jwt.sign({
            id_usuario: usuario.id_usuario,
            email: usuario.email,
            rol: usuario.rol
        });

        const { contrasena, ...userResponse } = usuario;

        return {
            token,
            usuario: userResponse
        };
    },
    async requestVerificationCode(request: FastifyRequest, reply: FastifyReply) {
        let { email } = request.body as { email: string };

        if (!email) {
            return reply.status(400).send({ message: 'El email es requerido' });
        }

        email = email.trim().toLowerCase();

        // Verificar si el usuario ya existe
        const existingUser = await request.server.prisma.usuario.findUnique({
            where: { email }
        });

        if (existingUser) {
            return reply.status(400).send({ message: 'El correo ya está registrado' });
        }

        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // HASHEAR CÓDIGO ANTES DE GUARDAR
        const hashCode = await bcrypt.hash(code, 10);

        // Guardar código en BD (Hasheado)
        await request.server.prisma.autenticacionMcp.create({
            data: {
                correo: email,
                codigo: hashCode
            }
        });

        // Enviar correo (Código plano)
        const emailService = new (await import('../services/email.service.js')).EmailService();
        const sent = await emailService.enviarCodigoRegistro(email, code);

        if (!sent) {
            return reply.status(500).send({ message: 'Error al enviar el correo' });
        }

        return reply.status(200).send({ message: 'Código enviado correctamente' });
    }
};
