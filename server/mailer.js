import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Transporter configuration for Zoho Mail / Custom SMTP
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtppro.zoho.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false' && port === 465;
  const user = process.env.SMTP_USER || 'info@garciaconstrucciones503.com';
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Send new lead notification to info@garciaconstrucciones503.com
 */
export async function sendLeadNotification(lead) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Mailer] SMTP_PASS no configurado en .env. El lead fue guardado en el CRM pero no se envió correo.');
    return { success: false, reason: 'no_credentials' };
  }

  const notificationTarget = process.env.NOTIFICATION_EMAIL || 'info@garciaconstrucciones503.com';
  const senderEmail = process.env.SMTP_USER || 'info@garciaconstrucciones503.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f1115; color: #e2e8f0; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #1a1e24; border-radius: 12px; border: 1px solid #2d3748; overflow: hidden; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 24px; }
        .item { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #2d3748; }
        .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #f59e0b; font-weight: 600; margin-bottom: 4px; }
        .value { font-size: 15px; color: #ffffff; }
        .message-box { background-color: #0f1115; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; font-size: 14px; line-height: 1.5; color: #e2e8f0; margin-top: 6px; }
        .footer { padding: 20px 24px; text-align: center; background-color: #14171d; border-top: 1px solid #2d3748; }
        .btn { display: inline-block; background: #f59e0b; color: #000000; text-decoration: none; padding: 10px 22px; border-radius: 6px; font-weight: 600; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>🚨 Nuevo Contacto desde la Web</h1>
          <p>García Construcciones 503, C.A.</p>
        </div>
        <div class="content">
          <div class="item">
            <div class="label">Cliente / Contacto</div>
            <div class="value"><strong>${lead.name}</strong></div>
          </div>
          <div class="item">
            <div class="label">Empresa o Institución</div>
            <div class="value">${lead.company || 'No especificada'}</div>
          </div>
          <div class="item">
            <div class="label">Correo Electrónico</div>
            <div class="value"><a href="mailto:${lead.email}" style="color: #60a5fa; text-decoration: none;">${lead.email}</a></div>
          </div>
          <div class="item">
            <div class="label">Teléfono</div>
            <div class="value"><a href="tel:${lead.phone}" style="color: #60a5fa; text-decoration: none;">${lead.phone || 'No especificado'}</a></div>
          </div>
          <div class="item" style="border-bottom: none;">
            <div class="label">Mensaje / Requerimiento</div>
            <div class="message-box">${lead.message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <a href="https://garciaconstrucciones503.com/gestion/crm" class="btn">Abrir y Gestionar en el CRM</a>
          <p style="font-size: 12px; color: #718096; margin-top: 14px; margin-bottom: 0;">
            Este prospecto ya ha sido registrado automáticamente en tu base de datos CRM.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"García Construcciones Web" <${senderEmail}>`,
      to: notificationTarget,
      replyTo: lead.email,
      subject: `🚨 Nuevo Contacto Web: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`,
      html: htmlContent,
      text: `Nuevo contacto desde la web:\n\nCliente: ${lead.name}\nEmpresa: ${lead.company || 'N/A'}\nEmail: ${lead.email}\nTeléfono: ${lead.phone || 'N/A'}\n\nMensaje:\n${lead.message}\n\nGestionar en CRM: https://garciaconstrucciones503.com/gestion/crm`,
    });

    console.log('[Mailer] Correo de notificación enviado exitosamente:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer] Error enviando correo de notificación:', error.message);
    return { success: false, error: error.message };
  }
}
