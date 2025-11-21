/**
 * Helper per invio email tramite SendGrid
 */

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'francesco.principe@remax.it';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Valutatore Immobiliare Elba';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'francesco.principe@remax.it';

interface LeadNotificationData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  comune?: string;
  tipologia?: string;
  superficie?: number;
  valoreTotale?: number;
}

/**
 * Invia notifica email al proprietario quando un nuovo lead compila il form
 */
export async function sendLeadNotification(leadData: LeadNotificationData): Promise<boolean> {
  if (!SENDGRID_API_KEY || SENDGRID_API_KEY === '') {
    console.warn('[Email] SendGrid API key non configurata, skip invio email');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: OWNER_EMAIL }],
            subject: `🏠 Nuovo Lead: ${leadData.nome} ${leadData.cognome} - ${leadData.comune || 'N/D'}`,
          },
        ],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME,
        },
        content: [
          {
            type: 'text/html',
            value: generateLeadEmailHTML(leadData),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] Errore invio email SendGrid:', response.status, errorText);
      return false;
    }

    console.log('[Email] Notifica lead inviata con successo a', OWNER_EMAIL);
    return true;
  } catch (error) {
    console.error('[Email] Errore invio email:', error);
    return false;
  }
}

/**
 * Genera HTML email per notifica lead
 */
function generateLeadEmailHTML(leadData: LeadNotificationData): string {
  const valoreTotaleFormatted = leadData.valoreTotale
    ? `€${leadData.valoreTotale.toLocaleString('it-IT')}`
    : 'Non disponibile';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuovo Lead - Valutatore Immobiliare Elba</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e31e24 0%, #c41e3a 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                🏠 Nuovo Lead dal Valutatore
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                Valutatore Immobiliare Isola d'Elba
              </p>
            </td>
          </tr>

          <!-- Contenuto -->
          <tr>
            <td style="padding: 30px;">
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                Un nuovo potenziale cliente ha completato la valutazione del suo immobile e ha lasciato i suoi dati di contatto.
              </p>

              <!-- Dati Contatto -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #e31e24; font-size: 18px; font-weight: bold;">
                      📞 Dati di Contatto
                    </h2>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold; width: 120px;">Nome:</td>
                        <td style="color: #333333; font-size: 14px;">${leadData.nome} ${leadData.cognome}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold;">Email:</td>
                        <td style="color: #333333; font-size: 14px;">
                          <a href="mailto:${leadData.email}" style="color: #e31e24; text-decoration: none;">${leadData.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold;">Telefono:</td>
                        <td style="color: #333333; font-size: 14px;">
                          <a href="tel:${leadData.telefono}" style="color: #e31e24; text-decoration: none;">${leadData.telefono}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Dati Immobile -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #e31e24; font-size: 18px; font-weight: bold;">
                      🏡 Dettagli Immobile
                    </h2>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold; width: 120px;">Comune:</td>
                        <td style="color: #333333; font-size: 14px;">${leadData.comune || 'Non specificato'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold;">Tipologia:</td>
                        <td style="color: #333333; font-size: 14px;">${leadData.tipologia || 'Non specificata'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold;">Superficie:</td>
                        <td style="color: #333333; font-size: 14px;">${leadData.superficie ? `${leadData.superficie} mq` : 'Non specificata'}</td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; font-weight: bold;">Valore Stimato:</td>
                        <td style="color: #e31e24; font-size: 16px; font-weight: bold;">${valoreTotaleFormatted}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="mailto:${leadData.email}" style="display: inline-block; background-color: #e31e24; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Contatta Subito il Cliente
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5; text-align: center;">
                💡 <strong>Suggerimento:</strong> Contatta il lead entro 5 minuti per massimizzare il tasso di conversione.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                Valutatore Immobiliare Isola d'Elba - RE/MAX Mindset
              </p>
              <p style="margin: 0; color: #999999; font-size: 11px;">
                Questa email è stata generata automaticamente dal sistema di valutazione immobiliare.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
