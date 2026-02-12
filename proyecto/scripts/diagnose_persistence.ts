
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---');
    const email = `test_diag_${Date.now()}@example.com`;
    const password = 'Password123!';

    try {
        // 1. Create User
        console.log(`1. Creating user: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.usuario.create({
            data: {
                email,
                contrasena: hashedPassword,
                nombre: 'Diagnostic',
                apellido: 'User',
                rol: 'CLIENTE'
            }
        });
        console.log('   User created with ID:', user.id_usuario);

        // 2. Update Profile
        console.log('2. Updating profile (bio, banner, career)...');
        const updateData = {
            bio: 'This is a diagnostic bio update.',
            banner: 'https://example.com/banner.jpg',
            career: 'Ingeniería de Software' // Note: schema has 'career' string field
        };

        const updatedUser = await prisma.usuario.update({
            where: { id_usuario: user.id_usuario },
            data: updateData
        });
        console.log('   Update command executed.');

        // 3. Verify Persistence (Fetch fresh data)
        console.log('3. Fetching fresh data to verify persistence...');
        const freshUser = await prisma.usuario.findUnique({
            where: { id_usuario: user.id_usuario }
        });

        if (!freshUser) {
            console.error('   FATAL: User not found after update!');
            return;
        }

        console.log('   Fresh Data:', {
            bio: freshUser.bio,
            banner: freshUser.banner,
            career: freshUser.career
        });

        // Check values
        const isBioCorrect = freshUser.bio === updateData.bio;
        const isBannerCorrect = freshUser.banner === updateData.banner;
        const isCareerCorrect = freshUser.career === updateData.career;

        if (isBioCorrect && isBannerCorrect && isCareerCorrect) {
            console.log('--- SUCCESS: Backend persistence is working correctly. ---');
            console.log('The issue is likely in the Frontend (Login response or State management).');
        } else {
            console.error('--- FAILURE: Data did not persist correctly. ---');
            console.error(`Bio match: ${isBioCorrect}`);
            console.error(`Banner match: ${isBannerCorrect}`);
            console.error(`Career match: ${isCareerCorrect}`);
        }

        // Cleanup
        await prisma.usuario.delete({ where: { id_usuario: user.id_usuario } });
        console.log('   Test user deleted.');

    } catch (error) {
        console.error('--- ERROR ---');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
