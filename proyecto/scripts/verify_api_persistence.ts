
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_URL = 'http://localhost:3000/api';

async function verify() {
    console.log('--- API VERIFICATION START ---');
    try {
        // 1. Login (using a test user or create one? valid credentials needed)
        // I'll try to create a user first via API if register endpoint exists and is open
        console.log('1. Registering test user...');
        const email = `api_test_${Date.now()}@example.com`;
        const password = 'Password123!';

        // Need to request code first? 
        // Based on AuthController.requestVerificationCode logic, yes.
        // But for testing, maybe I can just verify an existing ONE if I knew credentials.
        // Or I can use the diagnostic script to Create a user in DB directly, then Login via API.

        // Let's use Prisma to create a user, then use API to Login.
        // Importing prisma here might conflict if the app is running? No, separate process.

        const { PrismaClient } = await import('@prisma/client');
        const bcrypt = await import('bcrypt');
        const prisma = new PrismaClient();

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.usuario.create({
            data: {
                email,
                contrasena: hashedPassword,
                nombre: 'API',
                apellido: 'Tester',
                rol: 'CLIENTE',
                activo: true
            }
        });
        console.log(`   User created in DB: ${email}`);

        // 2. Login via API
        console.log('2. Logging in via API...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contrasena: password })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Login successful. Token received.');

        // 3. Update Profile via API
        console.log('3. Updating profile via API (PUT /usuarios/me)...');
        const updatePayload = {
            bio: 'Updated via API',
            career: 'API Engineer',
            university: 'Localhost University'
        };

        const updateRes = await fetch(`${API_URL}/usuarios/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatePayload)
        });

        if (!updateRes.ok) {
            throw new Error(`Update failed: ${updateRes.status} ${await updateRes.text()}`);
        }

        const updateData = await updateRes.json();
        console.log('   Update response received.');
        console.log('   Updated Career:', updateData.career);

        // 4. Get Profile via API (GET /usuarios/me)
        console.log('4. Fetching profile via API (GET /usuarios/me)...');
        const getRes = await fetch(`${API_URL}/usuarios/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!getRes.ok) {
            throw new Error(`Get failed: ${getRes.status} ${await getRes.text()}`);
        }

        const getData = await getRes.json();
        console.log('   Get response received.');
        console.log('   Fetched Career:', getData.career);
        console.log('   Fetched Bio:', getData.bio);

        // Verify
        if (getData.career === updatePayload.career && getData.bio === updatePayload.bio) {
            console.log('--- SUCCESS: API Persistence Verified ---');
        } else {
            console.error('--- FAILURE: Data mismatch ---');
            console.error('Expected:', updatePayload);
            console.error('Received:', getData);
        }

        // Cleanup
        await prisma.usuario.delete({ where: { id_usuario: user.id_usuario } });
        console.log('   Test user deleted.');
        await prisma.$disconnect();

    } catch (error) {
        console.error('--- ERROR ---', error);
        process.exit(1);
    }
}

verify();
