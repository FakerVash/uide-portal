import { FastifyPluginAsync } from 'fastify';
import { UsuarioHabilidadController } from '../controllers/usuario-habilidad.controller.js';
import { checkEstudiante, checkAuth } from '../plugins/auth.js';

const personalSkillRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.get('/', {
        preHandler: [checkAuth],
        schema: {
            description: 'Ver mis habilidades',
            tags: ['Estudiante - Habilidades'],
            response: { 200: { type: 'array' } }
        }
    }, UsuarioHabilidadController.getMySkills);

    fastify.post('/', {
        preHandler: [checkEstudiante],
        schema: {
            description: 'Promocionarme con una habilidad',
            tags: ['Estudiante - Habilidades'],
            body: { $ref: 'UsuarioHabilidad#' }
        }
    }, UsuarioHabilidadController.addSkill);

    fastify.delete('/:id_usuario/:id_habilidad', {
        preHandler: [checkEstudiante],
        schema: {
            description: 'Quitar habilidad de mi perfil',
            tags: ['Estudiante - Habilidades'],
            params: {
                type: 'object',
                properties: {
                    id_usuario: { type: 'integer' },
                    id_habilidad: { type: 'integer' }
                }
            }
        }
    }, UsuarioHabilidadController.removeSkill);
};

export default personalSkillRoutes;
