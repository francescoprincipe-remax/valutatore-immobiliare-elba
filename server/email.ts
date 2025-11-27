/**
 * Funzioni per l'invio di email tramite SendGrid
 */

interface LeadNotificationData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  comune: string;
  tipologia: string;
  superficie: number;
  valoreTotale: number;
}

export async function sendLeadNotification(data: LeadNotificationData): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn('[Email] SendGrid API key not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'francesco.principe@remax.it' }],
          subject: `🏠 Nuovo Lead Valutazione - ${data.nome} ${data.cognome}`,
        }],
        from: {
          email: 'noreply@manus.space',
          name: 'Valutatore Immobiliare Elba'
        },
        content: [{
          type: 'text/html',
          value: `
            <h2>Nuovo Lead da Valutazione Immobiliare</h2>
            
            <h3>📋 Dati Contatto</h3>
            <ul>
              <li><strong>Nome:</strong> ${data.nome} ${data.cognome}</li>
              <li><strong>Email:</strong> ${data.email}</li>
              <li><strong>Telefono:</strong> ${data.telefono}</li>
            </ul>
            
            <h3>🏡 Dati Immobile</h3>
            <ul>
              <li><strong>Comune:</strong> ${data.comune}</li>
              <li><strong>Tipologia:</strong> ${data.tipologia}</li>
              <li><strong>Superficie:</strong> ${data.superficie} mq</li>
              <li><strong>Valore Stimato:</strong> €${data.valoreTotale.toLocaleString('it-IT')}</li>
            </ul>
            
            <p><em>Lead generato dal sistema di valutazione automatica</em></p>
          `
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] SendGrid error:', response.status, errorText);
      return false;
    }

    console.log('[Email] Lead notification sent successfully');
    return true;
  } catch (error) {
    console.error('[Email] Failed to send notification:', error);
    return false;
  }
}
