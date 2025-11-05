const nodemailer = require('nodemailer');
const { getFirestore } = require('./firebaseService');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getEmailTemplate = (type, data) => {
  const templates = {
    confirm: {
      subject: `${data.name} confirmou presença!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #db2777; margin-bottom: 20px; }
            .info { background-color: #fce7f3; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Nova confirmação de presença!</h1>
            <p>Olá! <strong>${data.name}</strong> acabou de confirmar presença no Chá de Panela.</p>
            <div class="info">
              <p><strong>Nome:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Endereço do evento:</strong><br>${process.env.EVENT_ADDRESS}</p>
            </div>
            <div class="footer">
              <p>Mensagem automática do sistema de Chá de Panela Digital</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    gift: {
      subject: `${data.name} escolheu um presente!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #db2777; margin-bottom: 20px; }
            .info { background-color: #fce7f3; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .gift-info { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .btn { display: inline-block; background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎁 Novo presente escolhido!</h1>
            <p><strong>${data.name}</strong> acabou de escolher um presente!</p>
            <div class="info">
              <p><strong>Escolhido por:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
            </div>
            <div class="gift-info">
              <p><strong>Presente:</strong> ${data.giftName}</p>
              ${data.giftLink ? `<a href="${data.giftLink}" class="btn">Ver Presente</a>` : ''}
            </div>
            <div class="footer">
              <p>Mensagem automática do sistema de Chá de Panela Digital</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    invite: {
      subject: 'Novo convite gerado',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #db2777; margin-bottom: 20px; }
            .info { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📨 Novo convite gerado</h1>
            <p>Um novo convite foi criado com sucesso!</p>
            <div class="info">
              <p><strong>Token:</strong> ${data.token}</p>
              <p><strong>Link completo:</strong><br>${data.link}</p>
            </div>
            <p>Compartilhe este link com o convidado.</p>
            <div class="footer">
              <p>Mensagem automática do sistema de Chá de Panela Digital</p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };

  return templates[type];
};

const sendEmail = async (type, data) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured');
      return { success: false, error: 'Email not configured' };
    }

    const template = getEmailTemplate(type, data);
    const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails.join(','),
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);

    // Log email to Firestore
    const db = getFirestore();
    await db.collection('emailLogs').add({
      type,
      to: adminEmails.join(','),
      subject: template.subject,
      sentAt: new Date(),
      messageId: info.messageId
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  transporter
};
