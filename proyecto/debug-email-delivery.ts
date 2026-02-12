import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

async function main() {
    const testEmail = 'osmacasmo@uide.edu.ec'; // Using the email from the screenshot
    const code = '123456';

    const mailOptions = {
        from: `"Portal UIDE" <${process.env.GMAIL_USER}>`,
        to: testEmail,
        subject: '✉️ Test Delivery - Portal UIDE',
        text: `Testing email delivery. Code: ${code}`,
    };

    try {
        console.log(`Attempting to send email to ${testEmail}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

main();
