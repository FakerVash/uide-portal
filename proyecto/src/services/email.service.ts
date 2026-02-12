import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });
    }

    async comprobarConexion(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.error('✅ Conexión con servidor de correos establecida');
            return true;
        } catch (error) {
            console.error('❌ Error de conexión con servidor de correos:', error);
            return false;
        }
    }

    async enviarCodigoMcp(destinatario: string, codigo: string): Promise<boolean> {
        const mailOptions = {
            from: `"Soporte UniServicios" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: '🔐 Tu Código de Autenticación MCP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Autenticación MCP</h2>
                    <p style="color: #555; font-size: 16px;">Hola,</p>
                    <p style="color: #555; font-size: 16px;">Has solicitado un código de autenticación para servicios estudiantiles.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #007bff;">${codigo}</span>
                    </div>

                    <p style="color: #777; font-size: 14px;">Este código es válido para una sola sesión. Si no solicitaste este código, ignora este correo.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Servicios Estudiantiles UIDE</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.error(`📧 Correo enviado a ${destinatario}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar correo:', error);
            return false;
        }
    }
    async enviarCodigoRegistro(destinatario: string, codigo: string): Promise<boolean> {
        const mailOptions = {
            from: `"Soporte UniServicios" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: '✉️ Valida tu correo - Portal UIDE',
            text: `Hola,\n\nPara completar tu registro, por favor ingresa el siguiente código de verificación: ${codigo}\n\nEste código expirará en 15 minutos.\n\n© ${new Date().getFullYear()} Servicios Estudiantiles UIDE`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #870a42; text-align: center;">¡Bienvenido al Portal!</h2>
                    <p style="color: #555; font-size: 16px;">Hola,</p>
                    <p style="color: #555; font-size: 16px;">Para completar tu registro, por favor ingresa el siguiente código de verificación:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; border: 2px dashed #870a42;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #870a42;">${codigo}</span>
                    </div>

                    <p style="color: #777; font-size: 14px;">Este código expirará en 15 minutos.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">© ${new Date().getFullYear()} Servicios Estudiantiles UIDE</p>
                </div>
            `
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 Correo de registro enviado a ${destinatario}: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('❌ Error al enviar correo:', error);
            return false;
        }
    }
}
