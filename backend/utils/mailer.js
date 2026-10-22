const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!process.env.EMAIL || !process.env.PASS) {
        throw new Error('Email delivery is not configured. Set EMAIL and PASS on the backend.');
    }
    if (!options?.to || !options.subject || !options.html) throw new Error('Email recipient, subject, and body are required.');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    const mailOptions = {
        from: `"FreshCurator" <${process.env.EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
