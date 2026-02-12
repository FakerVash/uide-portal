import { FastifyReply, FastifyRequest } from 'fastify';
import { UsuarioDTO } from '../models/usuario.js';
import bcrypt from 'bcrypt';

export const UsuarioController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const usuarios = await request.server.prisma.usuario.findMany({
            where: { activo: true },
            include: { carrera: true }
        });
        // Excluir contraseña de la respuesta
        const usuariosSinPass = usuarios.map(({ contrasena, ...rest }) => rest);
        return usuariosSinPass;
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const usuario = await request.server.prisma.usuario.findUnique({
            where: { id_usuario: parseInt(id) },
            include: {
                carrera: true,
                servicios: true,
                habilidades: {
                    include: { habilidad: true }
                }
            }
        });

        if (!usuario || !usuario.activo) return reply.status(404).send({ message: 'Usuario no encontrado o inactivo' });

        // Excluir contraseña
        const { contrasena, ...usuarioSinPass } = usuario;
        return usuarioSinPass;
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as UsuarioDTO;

        // 1. Verificar si el correo ya existe (Doble check)
        const existingUser = await request.server.prisma.usuario.findUnique({
            where: { email: body.email }
        });
        if (existingUser) {
            return reply.status(400).send({ message: 'El correo ya está registrado' });
        }

        // 2. Validar Código de Verificación
        if (!body.codigo) {
            return reply.status(400).send({ message: 'El código de verificación es requerido' });
        }

        const email = body.email.trim().toLowerCase();
        const code = body.codigo.trim();

        const verificacion = await request.server.prisma.autenticacionMcp.findFirst({
            where: {
                correo: email,
            },
            orderBy: { fecha_solicitud: 'desc' }
        });

        if (!verificacion || !(await bcrypt.compare(code, verificacion.codigo))) {
            return reply.status(400).send({ message: 'Código de verificación incorrecto' });
        }

        // Verificar expiración (15 min)
        const ahora = new Date();
        const expiracion = new Date(verificacion.fecha_solicitud);
        expiracion.setMinutes(expiracion.getMinutes() + 15);

        if (ahora > expiracion) {
            return reply.status(400).send({ message: 'El código ha expirado, solicita uno nuevo' });
        }

        // Eliminar código usado
        await request.server.prisma.autenticacionMcp.delete({
            where: { id_autenticacion: verificacion.id_autenticacion }
        });

        // 3. Crear Usuario
        const hashedPassword = await bcrypt.hash(body.contrasena, 10);

        // Si el correo es institucional (@uide.edu.ec), forzar rol ESTUDIANTE
        let rolAsignado = body.rol || 'CLIENTE';
        if (body.email.toLowerCase().endsWith('@uide.edu.ec')) {
            rolAsignado = 'ESTUDIANTE';
        }

        const nuevoUsuario = await request.server.prisma.usuario.create({
            data: {
                email: body.email,
                contrasena: hashedPassword,
                nombre: body.nombre,
                apellido: body.apellido,
                telefono: body.telefono,
                id_carrera: body.id_carrera,
                university: body.university,
                rol: rolAsignado
            }
        });
        return reply.status(201).send(nuevoUsuario);
    },

    async updateStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { activo } = request.body as { activo: boolean };
        const usuario = await request.server.prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: { activo }
        });
        return usuario;
    },

    async updateMe(request: FastifyRequest, reply: FastifyReply) {
        // Obtener usuario del token JWT
        const user = request.user as { id_usuario: number; email: string; rol: string };

        if (!user || !user.id_usuario) {
            return reply.status(401).send({ message: 'No autorizado' });
        }

        const id_usuario = user.id_usuario;
        const body = request.body as Partial<UsuarioDTO>;

        // 1. Obtener datos actuales antes de actualizar
        const usuarioActual = await request.server.prisma.usuario.findUnique({
            where: { id_usuario }
        });

        if (!usuarioActual) {
            return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Forzar universidad fija para estudiantes de la UIDE
        if (usuarioActual.email.toLowerCase().endsWith('@uide.edu.ec')) {
            delete body.university;
        }

        // Evitar cambios de rol o ID por parte del cliente
        delete body.rol;
        delete (body as any).id_usuario;

        // Extract skills to update separately
        const skillsToUpdate = body.habilidades;
        delete body.habilidades;

        // Actualizar Habilidades si se envían
        if (Array.isArray(skillsToUpdate)) {
            // 1. Eliminar habilidades anteriores
            await request.server.prisma.usuarioHabilidad.deleteMany({
                where: { id_usuario }
            });

            // 2. Insertar nuevas
            if (skillsToUpdate.length > 0) {
                // Filtrar duplicados y asegurarse de que sean números
                const skillsUnicos = [...new Set(skillsToUpdate)].map(id => parseInt(id.toString()));

                await request.server.prisma.usuarioHabilidad.createMany({
                    data: skillsUnicos.map(id_habilidad => ({
                        id_usuario,
                        id_habilidad
                    }))
                });
            }
        }

        // 2. Si se actualiza la contraseña, hashearla
        if (body.contrasena) {
            body.contrasena = await bcrypt.hash(body.contrasena, 10);
        }

        // 3. Registrar Historial de Cambios (Auditoría)
        const camposSensibles = ['nombre', 'apellido', 'telefono'];
        const historialPromesas = [];

        for (const campo of camposSensibles) {
            const valorNuevo = (body as any)[campo];
            const valorAnterior = (usuarioActual as any)[campo];

            if (valorNuevo !== undefined && valorNuevo !== valorAnterior) {
                historialPromesas.push(
                    request.server.prisma.historialPerfil.create({
                        data: {
                            id_usuario,
                            campo_modificado: campo,
                            valor_anterior: valorAnterior?.toString() || '',
                            valor_nuevo: valorNuevo.toString()
                        }
                    })
                );
            }
        }

        // Ejecutar historial en paralelo
        if (historialPromesas.length > 0) {
            await Promise.all(historialPromesas);
        }

        const usuario = await request.server.prisma.usuario.update({
            where: { id_usuario },
            data: body as any,
            include: { carrera: true }
        });

        const { contrasena, ...usuarioSinPass } = usuario;
        return usuarioSinPass;
    },

    async getMe(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as { id_usuario: number };
        if (!user || !user.id_usuario) return reply.status(401).send({ message: 'No autorizado' });

        const usuario = await request.server.prisma.usuario.findUnique({
            where: { id_usuario: user.id_usuario },
            include: { carrera: true }
        });

        if (!usuario) return reply.status(404).send({ message: 'Usuario no encontrado' });

        const { contrasena, ...usuarioSinPass } = usuario;
        return usuarioSinPass;
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const currentUser = request.user as { id_usuario: number };

        // 1. Prevenir auto-eliminación
        if (currentUser && currentUser.id_usuario === parseInt(id)) {
            return reply.status(400).send({ message: 'No puedes desactivar tu propia cuenta' });
        }

        // 2. Verificar si el usuario existe
        const usuario = await request.server.prisma.usuario.findUnique({
            where: { id_usuario: parseInt(id) }
        });

        if (!usuario) {
            return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        // 3. Proteger a los administradores de ser desactivados
        if (usuario.rol === 'ADMIN') {
            return reply.status(400).send({ message: 'No se puede desactivar una cuenta de administrador' });
        }

        // Borrado Lógico: Cambiar estado a inactivo
        await request.server.prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: { activo: false }
        });

        return reply.status(204).send();
    }
};
