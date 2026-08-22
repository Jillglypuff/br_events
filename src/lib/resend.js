// Resend API Email Notification Service for BR Events
import { toast } from './toast.js'

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || ''
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'BR Events <onboarding@resend.dev>'
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@brevents.com'

/**
 * Send an email via Resend API
 */
export async function sendEmail({ to, subject, html }) {
  if (!to) return null

  // If no API Key, run in safe demo mode
  if (!RESEND_API_KEY) {
    console.log(`[Resend Email Mock] Para: ${to} | Asunto: ${subject}`)
    return { id: `mock-${Date.now()}`, mock: true }
  }

  try {
    let response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html
      })
    })

    let data = await response.json()

    // Fallback: If custom domain is not yet verified in Resend, retry with onboarding@resend.dev sandbox sender
    if (!response.ok && data.message && data.message.includes('domain')) {
      console.warn('[Resend Sandbox Fallback] Reintentando con el remitente de pruebas onboarding@resend.dev...')
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'BR Events <onboarding@resend.dev>',
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html
        })
      })
      data = await response.json()
    }

    if (response.ok) {
      console.log(`[Resend Email Sent] ID: ${data.id} a ${to}`)
      return data
    } else {
      console.warn('[Resend API Error]', data)
      return null
    }
  } catch (err) {
    console.warn('[Resend Exception]', err)
    return null
  }
}

/* ====================================================================
   EMAIL TEMPLATE HELPERS (BRANDED HTML TEMPLATES)
   ==================================================================== */

function wrapEmailTemplate(title, contentHtml) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #12111A; color: #F8F9FA; margin: 0; padding: 20px; }
        .email-container { max-width: 600px; margin: 0 auto; background: #1D1A2B; border: 1px solid rgba(216,30,91,0.3); border-radius: 16px; padding: 32px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
        .email-header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px; }
        .brand-br { color: #FFFFFF; font-size: 28px; font-weight: 900; }
        .brand-events { background: linear-gradient(90deg, #D81E5B, #FF4D7D, #2A9D8F); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; }
        .email-title { font-size: 20px; color: #FF4D7D; margin-top: 12px; font-weight: 700; }
        .email-body { font-size: 15px; line-height: 1.6; color: #E2E8F0; }
        .info-box { background: rgba(216,30,91,0.1); border: 1px solid rgba(216,30,91,0.3); border-radius: 12px; padding: 16px; margin: 20px 0; }
        .btn-cta { display: inline-block; background: linear-gradient(135deg, #9E2A2B, #D81E5B); color: #FFFFFF !important; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: 700; margin-top: 20px; text-align: center; }
        .email-footer { margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; text-align: center; font-size: 12px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div><span class="brand-br">BR</span> <span class="brand-events">Events</span></div>
          <div class="email-title">${title}</div>
        </div>
        <div class="email-body">
          ${contentHtml}
        </div>
        <div class="email-footer">
          BR Events &copy; ${new Date().getFullYear()} — Plataforma Exclusiva de Eventos del Grupo BR.<br>
          Desarrollado por <a href="https://www.tejidev.com/" style="color: #FF4D7D; text-decoration: none;">Teji</a>
        </div>
      </div>
    </body>
    </html>
  `
}

/* ====================================================================
   13 NOTIFICATION TRIGGER FUNCTIONS
   ==================================================================== */

// 1. Bienvenida a la Integrante
export async function sendWelcomeEmail(user) {
  const html = wrapEmailTemplate('¡Bienvenida a BR Events!', `
    <p>¡Hola, <strong>${user.name}</strong>!</p>
    <p>Te damos la bienvenida oficial a <strong>BR Events</strong>, la plataforma del grupo de amigas BR.</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Tus Datos Registrados:</strong></p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Email: ${user.email}</li>
        <li>Talla de Camiseta: ${user.shirtSize || 'M'}</li>
        <li>Ubicación: ${[user.province, user.canton].filter(Boolean).join(', ') || 'Costa Rica'}</li>
      </ul>
    </div>
    <p>Ya puedes ingresar a la plataforma, revisar el Turnero de Meses y confirmar tu asistencia a nuestros eventos.</p>
  `)
  return sendEmail({ to: user.email, subject: '¡Bienvenida a BR Events! 🎉', html })
}

// 2. Asignación / Postulación de Mes
export async function sendOrganizerAssignedEmail(monthName, organizer) {
  const html = wrapEmailTemplate(`¡Mes de ${monthName} Asignado!`, `
    <p>¡Hola, <strong>${organizer.name}</strong>!</p>
    <p>Se ha confirmado tu postulación como <strong>Organizadora Oficial</strong> para el evento del mes de <strong>${monthName}</strong>.</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Próximos Pasos como Organizadora:</strong></p>
      <ol style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Crear la encuesta de fechas probables en el tablero.</li>
        <li>Fijar la fecha y hora oficial del evento.</li>
        <li>Definir el lugar/ubicación (Google Maps / Waze).</li>
        <li>Gestionar la lista de compras del grupo.</li>
      </ol>
    </div>
  `)
  return sendEmail({ to: organizer.email, subject: `BR Events — ¡Eres la Organizadora de ${monthName}! 📅`, html })
}

// 3. Convocatoria Masiva por Fecha Confirmada
export async function sendEventDateConfirmedEmail(event, recipientEmail, recipientName) {
  const html = wrapEmailTemplate(`¡Fecha Confirmada para ${event.title}!`, `
    <p>¡Hola, <strong>${recipientName || 'Amiga'}</strong>!</p>
    <p>La organizadora <strong>${event.organizer || 'del grupo'}</strong> ha fijado la fecha oficial para el evento:</p>
    <div class="info-box" style="text-align: center;">
      <h3 style="margin: 0; color: #3BCEAC;">${event.title}</h3>
      <p style="font-size: 18px; margin: 8px 0 0 0; color: #FFFFFF;"><strong>📅 ${event.confirmedDate}</strong></p>
      <p style="margin: 4px 0 0 0; color: #A0AEC0;">⏰ ${event.confirmedTime || 'Horario por confirmar'}</p>
    </div>
    <p>Por favor ingresa a la aplicación para confirmar tu asistencia (RSVP).</p>
  `)
  return sendEmail({ to: recipientEmail, subject: `BR Events — Fecha Confirmada: ${event.title} 🥳`, html })
}

// 4. Actualización de Ubicación
export async function sendLocationUpdatedEmail(event, recipientEmail, recipientName) {
  const html = wrapEmailTemplate(`Nueva Ubicación: ${event.title}`, `
    <p>¡Hola, <strong>${recipientName || 'Amiga'}</strong>!</p>
    <p>Se ha actualizado la ubicación oficial del evento <strong>"${event.title}"</strong>:</p>
    <div class="info-box">
      <p style="margin:0;">📍 <strong>Lugar:</strong> ${event.location}</p>
    </div>
    <p>Por favor revisa la app y vuelve a confirmar tu asistencia si fuera necesario.</p>
  `)
  return sendEmail({ to: recipientEmail, subject: `BR Events — Ubicación Actualizada para ${event.title} 📍`, html })
}

// 5. Registro de Nuevo Gasto
export async function sendExpenseAddedEmail(expense, recipientEmail, recipientName) {
  const html = wrapEmailTemplate('Nuevo Gasto Registrado en CRC ₡', `
    <p>¡Hola, <strong>${recipientName || 'Amiga'}</strong>!</p>
    <p>Se ha registrado un nuevo gasto grupal en la cuenta del evento:</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Concepto:</strong> ${expense.description}</p>
      <p style="margin:4px 0 0 0;"><strong>Pagado por:</strong> ${expense.paidBy}</p>
      <p style="margin:4px 0 0 0; font-size: 18px; color: #3BCEAC;"><strong>Monto: ₡${Number(expense.amount).toLocaleString()} CRC</strong></p>
    </div>
  `)
  return sendEmail({ to: recipientEmail, subject: `BR Events — Nuevo Gasto: ${expense.description} 💰`, html })
}

// 6. Acuse de Recibo a Solicitante de Patrocinio
export async function sendSponsorshipReceivedEmail(sponsorship) {
  const html = wrapEmailTemplate('Propuesta de Patrocinio Recibida', `
    <p>Estimado/a <strong>${sponsorship.contactName || sponsorship.sponsorName}</strong>,</p>
    <p>Hemos recibido con éxito su propuesta de patrocinio para <strong>BR Events</strong> a nombre de <strong>${sponsorship.sponsorName}</strong>.</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Detalles Recibidos:</strong></p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Tipo: ${sponsorship.type}</li>
        <li>Mes / Evento: ${sponsorship.monthName || 'General'}</li>
        <li>Estado actual: Pendiente de Revisión por Administración</li>
      </ul>
    </div>
    <p>Nuestro equipo revisará su propuesta y le contactará a la brevedad.</p>
  `)
  return sendEmail({ to: sponsorship.contactEmail || ADMIN_EMAIL, subject: 'BR Events — Acuse de Recibo de Propuesta de Patrocinio 🤝', html })
}

// 7. Notificación de Aprobación de Patrocinio
export async function sendSponsorshipApprovedEmail(sponsorship) {
  const html = wrapEmailTemplate('¡Patrocinio Aprobado!', `
    <p>Estimado/a <strong>${sponsorship.contactName || sponsorship.sponsorName}</strong>,</p>
    <p>Nos complace informarle que su propuesta de patrocinio para <strong>${sponsorship.sponsorName}</strong> ha sido <strong>APROBADA</strong> por la administración de BR Events.</p>
    <div class="info-box">
      <p style="margin:0; color: #3BCEAC;"><strong>¡Bienvenido/a como Patrocinador Oficial!</strong></p>
      <p style="margin: 4px 0 0 0;">Su marca se destacará en las actividades y canales oficiales del grupo.</p>
    </div>
  `)
  return sendEmail({ to: sponsorship.contactEmail || ADMIN_EMAIL, subject: 'BR Events — ¡Su Propuesta de Patrocinio ha sido Aprobada! 🎉', html })
}

// 8. Notificación de Rechazo / Ajuste de Patrocinio
export async function sendSponsorshipRejectedEmail(sponsorship) {
  const html = wrapEmailTemplate('Actualización sobre su Propuesta de Patrocinio', `
    <p>Estimado/a <strong>${sponsorship.contactName || sponsorship.sponsorName}</strong>,</p>
    <p>Le agradecemos profundamente su interés en colaborar con BR Events a nombre de <strong>${sponsorship.sponsorName}</strong>.</p>
    <p>En esta oportunidad la administración ha debido declinar o solicitar ajustes sobre la propuesta actual. Nos pondremos en contacto si se abren nuevas oportunidades.</p>
  `)
  return sendEmail({ to: sponsorship.contactEmail || ADMIN_EMAIL, subject: 'BR Events — Notificación sobre Propuesta de Patrocinio', html })
}

// 9. Acuse de Recibo a Solicitante de Banner Publicitario
export async function sendAdRequestReceivedEmail(ad) {
  const html = wrapEmailTemplate('Solicitud de Banner Publicitario Recibida', `
    <p>Estimado/a representante de <strong>${ad.businessName}</strong>,</p>
    <p>Hemos recibido su solicitud para la publicación de un banner publicitario panorámico de 1200x400 px en la plataforma de <strong>BR Events</strong>.</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Detalles de la Solicitud:</strong></p>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Negocio/Marca: ${ad.businessName}</li>
        <li>Vigencia propuesta: ${ad.startDate} al ${ad.endDate}</li>
        <li>Estado: Pendiente de Aprobación por Administración</li>
      </ul>
    </div>
  `)
  return sendEmail({ to: ad.contactEmail || ADMIN_EMAIL, subject: 'BR Events — Solicitud de Banner Publicitario Recibida 📢', html })
}

// 10. Notificación de Aprobación y Activación de Banner
export async function sendAdApprovedEmail(ad) {
  const html = wrapEmailTemplate('¡Su Banner Publicitario ha sido Activado!', `
    <p>Estimado/a representante de <strong>${ad.businessName}</strong>,</p>
    <p>Nos alegra comunicarle que su banner publicitario de 1200x400 px ha sido <strong>APROBADO Y ACTIVADO</strong> en BR Events.</p>
    <div class="info-box">
      <p style="margin:0; color: #3BCEAC;"><strong>Detalles de Publicación:</strong></p>
      <p style="margin: 4px 0 0 0;">Su banner ya se despliega de forma panorámica e interactiva en la Landing Page, Turnero, Eventos y Galería de fotos con enlace a su sitio web.</p>
    </div>
  `)
  return sendEmail({ to: ad.contactEmail || ADMIN_EMAIL, subject: 'BR Events — ¡Su Banner Publicitario está en Vivo! 🚀', html })
}

// 11. Notificación de Rechazo / Desactivación de Banner
export async function sendAdRejectedEmail(ad) {
  const html = wrapEmailTemplate('Actualización de Campaña Publicitaria', `
    <p>Estimado/a representante de <strong>${ad.businessName}</strong>,</p>
    <p>Le informamos que la administración de BR Events ha desactivado o rechazado la solicitud del banner publicitario para <strong>${ad.businessName}</strong>.</p>
  `)
  return sendEmail({ to: ad.contactEmail || ADMIN_EMAIL, subject: 'BR Events — Notificación de Campaña Publicitaria', html })
}

// 12. Alerta Interna al Admin por Nuevo Patrocinador
export async function sendAdminAlertNewSponsorship(sponsorship) {
  const html = wrapEmailTemplate('⚡ Alerta Admin: Nueva Propuesta de Patrocinio', `
    <p>Se ha recibido una nueva solicitud de patrocinio desde la web:</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Empresa:</strong> ${sponsorship.sponsorName}</p>
      <p style="margin:4px 0 0 0;"><strong>Contacto:</strong> ${sponsorship.contactName} (${sponsorship.contactPhone})</p>
      <p style="margin:4px 0 0 0;"><strong>Tipo:</strong> ${sponsorship.type}</p>
    </div>
    <p>Ingresa al Panel Admin en el tab "Patrocinadores" para revisar y aprobar la solicitud.</p>
  `)
  return sendEmail({ to: ADMIN_EMAIL, subject: '⚡ Admin Alert: Nuevo Patrocinador Registrado', html })
}

// 13. Alerta Interna al Admin por Nueva Solicitud Publicitaria
export async function sendAdminAlertNewAd(ad) {
  const html = wrapEmailTemplate('⚡ Alerta Admin: Nueva Solicitud de Banner Publicitario', `
    <p>Se ha registrado una nueva solicitud de banner publicitario (1200x400 px):</p>
    <div class="info-box">
      <p style="margin:0;"><strong>Negocio:</strong> ${ad.businessName}</p>
      <p style="margin:4px 0 0 0;"><strong>Vigencia:</strong> ${ad.startDate} al ${ad.endDate}</p>
    </div>
    <p>Ingresa al Panel Admin en el tab "Publicidad" para revisar, aprobar y activar la campaña.</p>
  `)
  return sendEmail({ to: ADMIN_EMAIL, subject: '⚡ Admin Alert: Nueva Solicitud de Publicidad', html })
}
