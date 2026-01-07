import nodemailer from 'nodemailer';

interface ISendEmailProps {
    to: string;
    subject: string;
    text: string;
}

export async function sendEmail({ to, subject, text }: ISendEmailProps) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}
