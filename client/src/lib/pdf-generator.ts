import type { RisultatoValutazione } from '../../../server/valutazione-engine';

export async function generatePDFReport(
  risultato: RisultatoValutazione,
  datiImmobile: any
): Promise<void> {
  try {
    // Import dinamico di pdfmake per evitare blocchi al caricamento iniziale
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    
    const pdfMake = pdfMakeModule.default;
    const pdfFonts = pdfFontsModule.default;
    
    // Registra i font
    if (pdfMake && pdfFonts) {
      (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;
    }

    // Converti immagine watermark in base64 per pdfmake
    const watermarkBase64 = await fetch('/remax-balloon-watermark.png')
      .then(res => res.blob())
      .then(blob => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }));

    // Definizione documento PDF con pdfmake
    const docDefinition: any = {
      content: [
        // ===== PAGINA 1: STIMA E DATI IMMOBILE =====
        {
          text: 'STIMA AUTOMATICA DI MERCATO - ISOLA D\'ELBA',
          style: 'header',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Report Valutazione Immobiliare',
          style: 'subheader',
          margin: [0, 0, 0, 20]
        },

        // DATI IMMOBILE
        {
          text: 'DATI IMMOBILE',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `Comune: ${datiImmobile.comune}`, margin: [0, 0, 0, 5] },
                { text: `Località: ${datiImmobile.localita || '-'}`, margin: [0, 0, 0, 5] },
                { text: `Tipologia: ${datiImmobile.tipologia}`, margin: [0, 0, 0, 5] },
                { text: `Superficie: ${datiImmobile.superficieAbitabile} mq`, margin: [0, 0, 0, 5] }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: `Piano: ${datiImmobile.piano || '-'}`, margin: [0, 0, 0, 5] },
                { text: `Stato: ${datiImmobile.statoManutenzione || '-'}`, margin: [0, 0, 0, 5] },
                { text: `Vista Mare: ${datiImmobile.vistaMare || 'No'}`, margin: [0, 0, 0, 5] },
                { text: `Distanza Mare: ${datiImmobile.distanzaMare ? datiImmobile.distanzaMare + ' m' : '-'}`, margin: [0, 0, 0, 5] }
              ]
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // VALORI STIMATI
        {
          text: 'VALORI STIMATI',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Valore Minimo', style: 'tableHeader', alignment: 'center' },
                { text: 'Valore Medio', style: 'tableHeader', alignment: 'center' },
                { text: 'Valore Massimo', style: 'tableHeader', alignment: 'center' }
              ],
              [
                { text: `EUR ${risultato.valoreMin.toLocaleString('it-IT')}`, style: 'tableValue', alignment: 'center' },
                { text: `EUR ${risultato.valoreTotale.toLocaleString('it-IT')}`, style: 'tableValue', alignment: 'center', bold: true },
                { text: `EUR ${risultato.valoreMax.toLocaleString('it-IT')}`, style: 'tableValue', alignment: 'center' }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#E11B22' : '#f5f5f5',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#cccccc',
            vLineColor: () => '#cccccc'
          },
          margin: [0, 0, 0, 20]
        },

        // DISCLAIMER
        {
          text: 'DISCLAIMER',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Questa è una stima automatica indicativa basata su dati di mercato aggregati. Non sostituisce una valutazione professionale effettuata da un agente immobiliare abilitato.',
          style: 'disclaimer',
          margin: [0, 0, 0, 20]
        },

        // COMPOSIZIONE VALORE
        {
          text: 'COMPOSIZIONE VALORE',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Valore Base:', `EUR ${risultato.valoreBase.toLocaleString('it-IT')}`],
              ['Pertinenze:', `EUR ${risultato.valorePertinenze.toLocaleString('it-IT')}`],
              ['Valorizzazioni:', `EUR ${risultato.valoreValorizzazioni.toLocaleString('it-IT')}`],
              [{ text: 'Totale:', bold: true }, { text: `EUR ${risultato.valoreTotale.toLocaleString('it-IT')}`, bold: true }]
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 20]
        },

        // PUNTI DI FORZA
        {
          text: 'PUNTI DI FORZA',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          ul: risultato.consigli.puntiForza.map(punto => punto),
          margin: [0, 0, 0, 20]
        },

        // ===== PAGINA 2: FUNNEL CTA =====
        { text: '', pageBreak: 'after' },

        {
          text: 'IL TUO PROSSIMO PASSO',
          style: 'header',
          alignment: 'center',
          margin: [0, 20, 0, 30]
        },

        // CTA CALCOLA TASSE
        {
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: '>> CALCOLA TASSE E ONERI', style: 'ctaTitle', margin: [0, 10, 0, 10] },
                  { text: 'Scopri quanto dovrai pagare in tasse, imposte e spese notarili. Calcolo gratuito e immediato.', style: 'ctaText', margin: [0, 0, 0, 10] },
                  { text: '>> CLICCA QUI PER CALCOLARE', link: 'https://tasseimmob-ttn8lkb9.manus.space/', style: 'ctaLink', margin: [0, 0, 0, 10] }
                ],
                fillColor: '#FFF3CD',
                border: [true, true, true, true]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => '#FFA500',
            vLineColor: () => '#FFA500'
          },
          margin: [0, 0, 0, 30]
        },

        // PERCHÉ SCEGLIERE RE/MAX
        {
          text: 'PERCHÉ SCEGLIERE RE/MAX?',
          style: 'sectionHeader',
          margin: [0, 0, 0, 15]
        },
        {
          ul: [
            'Leader mondiale nel settore immobiliare',
            'Network internazionale per massima visibilità',
            'Marketing professionale (foto, video, virtual tour)',
            'Strategie di pricing basate su dati reali',
            'Vendita più veloce grazie a tecnologia avanzata',
            'Assistenza completa dalla stima alla firma'
          ],
          margin: [0, 0, 0, 30]
        },

        // MERCATO COMPETITIVO
        {
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'MERCATO COMPETITIVO - AGISCI ORA', style: 'urgencyTitle', margin: [0, 10, 0, 10] },
                  { text: 'Attenzione: Diversi immobili simili sono attualmente in vendita nella stessa zona. Un prezzo competitivo e una strategia di marketing efficace sono fondamentali per vendere velocemente al miglior prezzo.', style: 'urgencyText', margin: [0, 0, 0, 10] }
                ],
                fillColor: '#FFE6E6',
                border: [true, true, true, true]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => '#E11B22',
            vLineColor: () => '#E11B22'
          },
          margin: [0, 0, 0, 30]
        },

        // RICHIEDI CONSULENZA
        {
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'RICHIEDI CONSULENZA GRATUITA', style: 'consultTitle', margin: [0, 10, 0, 10] },
                  { text: 'Contattami per una valutazione professionale completa', style: 'consultText', margin: [0, 0, 0, 10] },
                  { text: 'WhatsApp: Clicca qui', link: 'https://wa.me/message/4K6JSOQWVOTRL1', style: 'consultLink', margin: [0, 0, 0, 10] }
                ],
                fillColor: '#E6F2FF',
                border: [true, true, true, true]
              }
            ]]
          },
          layout: {
            hLineWidth: () => 2,
            vLineWidth: () => 2,
            hLineColor: () => '#0066B3',
            vLineColor: () => '#0066B3'
          },
          margin: [0, 0, 0, 20]
        },

        // ===== PAGINA 3: DISCLAIMER PROFESSIONALE =====
        { text: '', pageBreak: 'after' },

        {
          text: 'NOTE LEGALI E DISCLAIMER',
          style: 'header',
          alignment: 'center',
          margin: [0, 20, 0, 30]
        },

        {
          text: 'NATURA DELLA STIMA',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Questa stima è generata automaticamente da un algoritmo basato su dati di mercato aggregati e caratteristiche dell\'immobile. Si tratta di una stima indicativa e non vincolante, che non sostituisce in alcun modo una valutazione professionale effettuata da un agente immobiliare abilitato o da un perito qualificato.',
          margin: [0, 0, 0, 20]
        },

        {
          text: 'LIMITAZIONI E PRECISAZIONI',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          ul: [
            'La stima si basa su dati di mercato aggregati e può non riflettere condizioni specifiche dell\'immobile',
            'Fattori non considerati: stato interno dettagliato, conformità urbanistica, vincoli, situazione legale',
            'Il valore reale può variare significativamente in base a condizioni di mercato, stagionalità e negoziazione',
            'La stima non tiene conto di eventuali difetti strutturali, problemi legali o vincoli non dichiarati',
            'I prezzi di mercato possono variare rapidamente in base a domanda, offerta e condizioni economiche'
          ],
          margin: [0, 0, 0, 20]
        },

        {
          text: 'RACCOMANDAZIONI PROFESSIONALI',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Prima di prendere qualsiasi decisione di vendita, acquisto o investimento immobiliare, è fortemente consigliato richiedere una valutazione professionale completa da parte di un agente immobiliare abilitato. La valutazione professionale include: sopralluogo dettagliato, analisi comparativa di mercato aggiornata, verifica documentale, analisi urbanistica e catastale, strategia di pricing personalizzata.',
          margin: [0, 0, 0, 20]
        },

        {
          text: 'ESCLUSIONE DI RESPONSABILITÀ',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'Francesco Principe e RE/MAX Mindset non si assumono alcuna responsabilità per decisioni prese sulla base di questa stima automatica. L\'utilizzatore riconosce di aver compreso la natura indicativa della stima e di non poter avanzare pretese basate esclusivamente su questo documento. Per qualsiasi utilizzo professionale, legale o finanziario, è necessaria una valutazione professionale certificata.',
          margin: [0, 0, 0, 20]
        },

        {
          text: 'PRIVACY E DATI PERSONALI',
          style: 'sectionHeader',
          margin: [0, 0, 0, 10]
        },
        {
          text: 'I dati forniti per la generazione di questa stima sono trattati in conformità al Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati esclusivamente per finalità di contatto commerciale e non saranno ceduti a terzi senza consenso esplicito. Per maggiori informazioni sul trattamento dei dati, contattare francesco.principe@remax.it',
          margin: [0, 0, 0, 30]
        },

        // CONTATTI FINALI
        {
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'CONTATTI', style: 'contactTitle', alignment: 'center', margin: [0, 10, 0, 10] },
                  { text: 'Francesco Principe - RE/MAX Mindset', alignment: 'center', margin: [0, 0, 0, 5] },
                  { text: 'Email: francesco.principe@remax.it', alignment: 'center', margin: [0, 0, 0, 10] }
                ],
                fillColor: '#f5f5f5',
                border: [true, true, true, true]
              }
            ]]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20]
        },

        // COPYRIGHT
        {
          text: '© 2025 Francesco Principe - RE/MAX Mindset',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0]
        },
        {
          text: 'Documento generato automaticamente - Non ha valore legale',
          style: 'footer',
          alignment: 'center',
          margin: [0, 5, 0, 0]
        }
      ],
      
      // WATERMARK MONGOLFIERA SU OGNI PAGINA
      background: function(currentPage: number, pageSize: any) {
        return {
          image: watermarkBase64,
          width: 200,
          opacity: 0.05,
          absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 }
        };
      },
      
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#000000'
        },
        subheader: {
          fontSize: 14,
          color: '#666666'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#000000'
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#ffffff'
        },
        tableValue: {
          fontSize: 14,
          color: '#000000'
        },
        disclaimer: {
          fontSize: 10,
          italics: true,
          color: '#666666'
        },
        ctaTitle: {
          fontSize: 16,
          bold: true,
          color: '#000000',
          alignment: 'center'
        },
        ctaText: {
          fontSize: 11,
          color: '#333333',
          alignment: 'center'
        },
        ctaLink: {
          fontSize: 12,
          bold: true,
          color: '#0066B3',
          decoration: 'underline',
          alignment: 'center'
        },
        urgencyTitle: {
          fontSize: 14,
          bold: true,
          color: '#E11B22',
          alignment: 'center'
        },
        urgencyText: {
          fontSize: 11,
          color: '#333333',
          alignment: 'center'
        },
        consultTitle: {
          fontSize: 14,
          bold: true,
          color: '#0066B3',
          alignment: 'center'
        },
        consultText: {
          fontSize: 11,
          color: '#333333',
          alignment: 'center'
        },
        consultLink: {
          fontSize: 12,
          bold: true,
          color: '#0066B3',
          decoration: 'underline',
          alignment: 'center'
        },
        contactTitle: {
          fontSize: 14,
          bold: true,
          color: '#E11B22'
        },
        footer: {
          fontSize: 9,
          color: '#999999'
        }
      },
      defaultStyle: {
        fontSize: 11,
        color: '#000000'
      },
      pageMargins: [40, 40, 40, 40]
    };

    // Genera e scarica il PDF
    pdfMake.createPdf(docDefinition).download(`stima-immobiliare-elba.pdf`);
  } catch (error) {
    console.error('Errore generazione PDF:', error);
    throw error;
  }
}
