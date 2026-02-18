import { FastifyPluginAsync } from 'fastify';
import { RequerimientoController } from '../controllers/requerimiento.controller.js';
import { checkAuth, checkEstudiante } from '../plugins/auth.js'; // Adjust imports if necessary

const requerimientoRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // GET /requerimientos (Listar todos los disponibles o mis requerimientos)
    fastify.get('/', {
        preHandler: [checkAuth]
    }, RequerimientoController.getAll);

    // POST /requerimientos (Crear nuevo)
    fastify.post('/', {
        preHandler: [checkAuth]
    }, RequerimientoController.create);

    // GET /requerimientos/mis-postulaciones (Ver mis postulaciones - Estudiante)
    fastify.get('/mis-postulaciones', {
        preHandler: [checkAuth]
    }, RequerimientoController.getMisPostulaciones);

    // POST /requerimientos/:id/postular (Estudiantes)
    fastify.post('/:id/postular', {
        preHandler: [checkEstudiante]
    }, RequerimientoController.postular);

    // PATCH /requerimientos/:id (Actualizar requerimiento - Cliente dueño)
    fastify.patch('/:id', {
        preHandler: [checkAuth]
    }, RequerimientoController.update);

    // PATCH /requerimientos/:id/eliminar (Eliminación lógica - Cliente dueño)
    fastify.patch('/:id/eliminar', {
        preHandler: [checkAuth]
    }, RequerimientoController.softDelete);

    // GET /requerimientos/:id/postulaciones (Ver candidatos)
    fastify.get('/:id/postulaciones', {
        preHandler: [checkAuth] // Controller verifies ownership
    }, RequerimientoController.getPostulantes);

    // PATCH /requerimientos/:id/seleccionar/:idPostulacion (Seleccionar candidato)
    fastify.patch('/:id/seleccionar/:idPostulacion', {
        preHandler: [checkAuth]
    }, RequerimientoController.seleccionarCandidato);

    // PATCH /requerimientos/:id/archivar (Archivar - Cliente dueño)
    fastify.patch('/:id/archivar', {
        preHandler: [checkAuth]
    }, RequerimientoController.archive);
};

export default requerimientoRoutes;
