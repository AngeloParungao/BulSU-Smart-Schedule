const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  secure: true,
  port: 587,
  host: 'smtp.gmail.com',
  service: 'gmail', // Replace with your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

const sendEmail = async (recipient, subject, html) => {
  try {
    const mailOptions = {
      from: 'Smart Schedule <smartschedule.bulsu@gmail.com>', // Sender address
      to: recipient, // List of recipients
      subject: subject, // Subject line
      html: html, // HTML body content
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};

module.exports = { sendEmail };
