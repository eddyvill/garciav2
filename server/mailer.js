import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

/**
 * Send new lead notification using Resend (HTTPS) or SMTP fallback
 */
export async function sendLeadNotification(lead) {
  const resendApiKey = process.env.RESEND_API_KEY;

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
            <div class="message-box">${(lead.message || '').replace(/\n/g, '<br>')}</div>
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

  // 1. Send via Resend (HTTPS over port 443 - works everywhere!)
  if (resendApiKey) {
    try {
      let targetRecipient = process.env.NOTIFICATION_EMAIL || 'info@garciaconstrucciones503.com';
      const fromAddress = process.env.EMAIL_FROM || 'García Construcciones 503 <notificaciones@garciaconstrucciones503.com>';
      const subject = `🚨 Nuevo Contacto Web: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`;

      const sendTo = async (recipient) => {
        return fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipient],
            reply_to: lead.email,
            subject,
            html: htmlContent,
          }),
        });
      };

      let response = await sendTo(targetRecipient);
      let data = await response.json();

      // If Resend free testing mode requires sending to account owner email:
      if (!response.ok && data?.message?.includes('only send testing emails to your own email address')) {
        const ownerEmailMatch = data.message.match(/\(([^)]+)\)/);
        const ownerEmail = ownerEmailMatch ? ownerEmailMatch[1] : 'edduar.villegas@gmail.com';
        console.warn(`[Mailer] Resend en modo test: redirigiendo envío al correo del propietario (${ownerEmail})`);
        response = await sendTo(ownerEmail);
        data = await response.json();
      }

      if (response.ok) {
        console.log('[Mailer] Notificación enviada exitosamente vía Resend ID:', data.id);
        return { success: true, id: data.id };
      } else {
        console.error('[Mailer] Error respuesta Resend:', data);
        return { success: false, error: data };
      }
    } catch (err) {
      console.error('[Mailer] Error en fetch Resend:', err.message);
      return { success: false, error: err.message };
    }
  }

  console.warn('[Mailer] Ni RESEND_API_KEY ni SMTP configurados. No se envió correo.');
  return { success: false, reason: 'no_service' };
}
