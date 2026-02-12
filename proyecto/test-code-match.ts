import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'osmacasmo@uide.edu.ec'; // Test with actual email from DB or any
    const codeToTest = '123456'; // The code you think should work

    const verif = await prisma.autenticacionMcp.findFirst({
        where: { correo: email },
        orderBy: { fecha_solicitud: 'desc' }
    });

    if (!verif) {
        console.log('No validation code found for', email);
        return;
    }

    console.log('Found verification record:');
    console.log('ID:', verif.id_autenticacion);
    console.log('Email:', verif.correo);
    console.log('Hash in DB:', verif.codigo);
    console.log('Date:', verif.fecha_solicitud);

    const isMatch = await bcrypt.compare(codeToTest, verif.codigo);
    console.log(`Comparison result for "${codeToTest}":`, isMatch);

    // Also check for trailing spaces or hidden chars in email
    console.log('Email length:', verif.correo.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
