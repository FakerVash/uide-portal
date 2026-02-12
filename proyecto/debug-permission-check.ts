
import { PrismaClient } from '@prisma/client';
import http from 'http';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING DEBUG SCRIPT ---');

    // 1. SETUP: Find a non-admin user and create a service
    const clientUser = await prisma.usuario.findFirst({
        where: { rol: 'CLIENTE' }
    });

    if (!clientUser) {
        console.error('No CLIENTE user found. Cannot create test service.');
        return;
    }

    const service = await prisma.servicio.create({
        data: {
            titulo: 'DEBUG_SERVICE_TO_DELETE',
            descripcion: 'Temporary service for debugging admin delete permissions',
            precio: 10.00,
            id_usuario: clientUser.id_usuario,
            id_categoria: 1 // Assuming category 1 exists, if not this might fail.
        }
    });

    console.log(`Created Test Service ID: ${service.id_servicio} (Owner: ${clientUser.email})`);

    // 2. LOGIN AS ADMIN
    const loginData = JSON.stringify({
        email: 'admin@uide.edu.ec',
        contrasena: 'admin123'
    });

    const loginReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    }, (res: http.IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: any) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                const token = JSON.parse(data).token;
                console.log('Admin Login Successful');

                // 3. ATTEMPT DELETE
                attemptDelete(token, service.id_servicio);
            } else {
                console.error('Admin Login Failed:', data);
            }
        });
    });

    loginReq.write(loginData);
    loginReq.end();
}

function attemptDelete(token: string, serviceId: number) {
    console.log(`Attempting to delete Service ID: ${serviceId} as Admin...`);

    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/servicios/${serviceId}`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }, (res: http.IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: any) => data += chunk);
        res.on('end', async () => {
            console.log(`DELETE Response Code: ${res.statusCode}`);
            console.log(`DELETE Response Body: ${data}`);

            // Cleanup if delete failed (optional, but good practice)
            if (res.statusCode !== 204) {
                console.log('Cleanup: Deleting service via Prisma...');
                await prisma.servicio.delete({ where: { id_servicio: serviceId } }).catch(() => { });
            }
            await prisma.$disconnect();
        });
    });

    req.end();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
});
