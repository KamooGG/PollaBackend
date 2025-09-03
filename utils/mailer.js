const nodemailer = require('nodemailer');

async function getTransport() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: String(process.env.SMTP_SECURE || 'false') === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
    }
    const test = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: test.user, pass: test.pass }
    });
}

async function sendMail({ to, subject, html }) {
    const transporter = await getTransport();
    const info = await transporter.sendMail({
        from: process.env.MAIL_FROM || 'Polla Futbolera <no-reply@polla.local>',
        to,
        subject,
        html
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { messageId: info.messageId, previewUrl };
}

module.exports = { sendMail };
