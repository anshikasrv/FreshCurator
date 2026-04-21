const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
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