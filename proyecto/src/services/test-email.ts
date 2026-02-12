import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

async function test() {
    console.log('Probando configuración con:', process.env.GMAIL_USER);
    try {
        await transporter.verify();
        console.log('✅ Conexión EXITOSA');
    } catch (error) {
        console.error('❌ Error de conexión:', error);
    }
}

test();
