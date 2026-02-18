import { FastifyReply, FastifyRequest } from 'fastify';
import { UsuarioDTO } from '../models/usuario.js';
import { AuditService } from '../services/audit.service.js';
import bcrypt from 'bcrypt';

export const UsuarioController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const { include_inactive, carrera_id, rol } = request.query as {
            include_inactive?: string,
            carrera_id?: string,
            rol?: string
        };

        const whereClause: any = {};

        if (include_inactive !== 'true') {
            whereClause.activo = true;
        }

        if (carrera_id) {
            whereClause.id_carrera = parseInt(carrera_id);
        }

        if (rol) {
            whereClause.rol = rol.toUpperCase();
        }

        const usuarios = await request.server.prisma.usuario.findMany({
            where: whereClause,
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

        const rolFinal = rolAsignado;
        const universityFinal = (rolFinal === 'ESTUDIANTE')
            ? 'Universidad Internacional del Ecuador'
            : body.university;

        const nuevoUsuario = await request.server.prisma.usuario.create({
            data: {
                email: body.email,
                contrasena: hashedPassword,
                nombre: body.nombre,
                apellido: body.apellido,
                telefono: body.telefono,
                id_carrera: body.id_carrera,
                university: universityFinal,
                rol: rolFinal
            }
        });
        return reply.status(201).send(nuevoUsuario);
    },
    async updateStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { activo } = request.body as { activo: boolean };
        const adminUser = (request as any).user;

        const usuario = await request.server.prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: { activo }
        });

        // Registrar Auditoría
        if (adminUser) {
            await AuditService.log(
                request.server,
                adminUser.id_usuario,
                'CAMBIO_ESTADO_USUARIO',
                { id_usuario_afectado: id, nuevo_estado: activo ? 'ACTIVO' : 'INACTIVO' },
                request.ip
            );
        }

        return usuario;
    },

    async adminUpdate(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { id_carrera } = request.body as { id_carrera: number };

        if (!id_carrera) {
            return reply.status(400).send({ message: 'Se requiere id_carrera' });
        }

        // Verificar que el usuario exista
        const usuarioExistente = await request.server.prisma.usuario.findUnique({
            where: { id_usuario: parseInt(id) }
        });

        if (!usuarioExistente) {
            return reply.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Actualizar solo la carrera
        const usuarioActualizado = await request.server.prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: { id_carrera },
            include: { carrera: true }
        });

        // Registrar en historial (opcional pero recomendado)
        await request.server.prisma.historialPerfil.create({
            data: {
                id_usuario: parseInt(id),
                campo_modificado: 'carrera (ADMIN)',
                valor_anterior: usuarioExistente.id_carrera?.toString() || 'N/A',
                valor_nuevo: id_carrera.toString()
            }
        });

        // Registrar Auditoría
        const adminUser = (request as any).user;
        if (adminUser) {
            await AuditService.log(
                request.server,
                adminUser.id_usuario,
                'CAMBIO_CARRERA_ADMIN',
                { id_usuario_afectado: id, id_nueva_carrera: id_carrera },
                request.ip
            );
        }

        const { contrasena, ...usuarioSinPass } = usuarioActualizado;
        return usuarioSinPass;
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
        delete (body as any).bio;

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
            include: {
                carrera: true,
                habilidades: {
                    include: { habilidad: true }
                }
            }
        });

        console.log('=== updateMe RESPONSE ===');
        console.log('usuario.habilidades:', usuario.habilidades);

        const { contrasena, ...usuarioSinPass } = usuario;
        return usuarioSinPass;
    },

    // FORCE RECOMPILE: Get current user profile with skills
    async getMe(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as { id_usuario: number };
        if (!user || !user.id_usuario) return reply.status(401).send({ message: 'No autorizado' });

        console.log('🔍 getMe called for user ID:', user.id_usuario);

        const usuario = await request.server.prisma.usuario.findUnique({
            where: { id_usuario: user.id_usuario },
            include: {
                carrera: true,
                habilidades: {
                    include: { habilidad: true }
                }
            }
        });

        if (!usuario) return reply.status(404).send({ message: 'Usuario no encontrado' });

        console.log('=== getMe RESPONSE ===');
        console.log('usuario.habilidades:', usuario.habilidades);
        console.log('Total habilidades:', usuario.habilidades?.length || 0);

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
