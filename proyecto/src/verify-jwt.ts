
import buildApp from './app.js';
import Fastify from 'fastify';
import fs from 'fs';

async function verify() {
    const log = (msg: any) => {
        console.log(msg);
        fs.appendFileSync('verify.log', (typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg) + '\n');
    };

    fs.writeFileSync('verify.log', '--- Starting JWT Verification ---\n');

    const fastify = Fastify();
    await fastify.register(buildApp);
    await fastify.ready();

    // 1. Register a new user
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    log(`\n1. Registering user: ${email}`);
    const registerRes = await fastify.inject({
        method: 'POST',
        url: '/api/usuarios',
        payload: {
            email,
            contrasena: password,
            nombre: 'Test',
            apellido: 'User',
            telefono: '1234567890',
            id_carrera: 1
        }
    });

    log('Register Status: ' + registerRes.statusCode);
    if (registerRes.statusCode !== 201) {
        log('Registration failed: ' + registerRes.payload);
    }

    // 2. Login
    log('\n2. Logging in...');
    const loginRes = await fastify.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
            email,
            contrasena: password
        }
    });

    log('Login Status: ' + loginRes.statusCode);
    if (loginRes.statusCode !== 200) {
        log('Login failed: ' + loginRes.payload);
        process.exit(1);
    }

    const { token } = JSON.parse(loginRes.payload);
    log('Token received: ' + (token ? 'Yes' : 'No'));

    // 3. Access Protected Route (Update Me)
    log('\n3. Accessing Protected Route (Update Me)...');
    const updateRes = await fastify.inject({
        method: 'PUT',
        url: '/api/usuarios/me',
        headers: {
            Authorization: `Bearer ${token}`
        },
        payload: {
            nombre: 'Updated Name'
        }
    });

    log('Update Status: ' + updateRes.statusCode);
    log('Update Response: ' + updateRes.payload);

    if (updateRes.statusCode === 200) {
        log('\nSUCCESS: JWT Authentication is working!');
    } else {
        log('\nFAILURE: Could not access protected route.');
    }

    await fastify.close();
}

verify().catch(console.error);
