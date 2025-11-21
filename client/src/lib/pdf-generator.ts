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

    // Definizione documento PDF con pdfmake - DESIGN MODERNO
    const docDefinition: any = {
      content: [
        // ===== PAGINA 1: STIMA E DATI IMMOBILE =====
        
        // HEADER CON GRADIENTE SIMULATO (box colorato)
        {
          canvas: [
            {
              type: 'rect',
              x: -40,
              y: -40,
              w: 595,
              h: 120,
              color: '#E11B22',
              linearGradient: ['#E11B22', '#C41018']
            }
          ]
        },
        {
          text: 'STIMA AUTOMATICA DI MERCATO',
          style: 'mainHeader',
          color: '#ffffff',
          margin: [-40, -100, 0, 5]
        },
        {
          text: 'Isola d\'Elba',
          style: 'mainSubheader',
          color: '#ffffff',
          margin: [-40, 0, 0, 30]
        },

        // CARD DATI IMMOBILE CON OMBRA
        {
          stack: [
            {
              text: '🏠  DATI IMMOBILE',
              style: 'sectionHeaderModern',
              margin: [0, 10, 0, 15]
            },
            {
              columns: [
                {
                  width: '50%',
                  stack: [
                    { text: [{ text: 'Comune: ', bold: true }, datiImmobile.comune], margin: [0, 0, 0, 8], fontSize: 11 },
                    { text: [{ text: 'Località: ', bold: true }, datiImmobile.localita || '-'], margin: [0, 0, 0, 8], fontSize: 11 },
                    { text: [{ text: 'Tipologia: ', bold: true }, datiImmobile.tipologia], margin: [0, 0, 0, 8], fontSize: 11 },
                    { text: [{ text: 'Superficie: ', bold: true }, `${datiImmobile.superficieAbitabile} mq`], margin: [0, 0, 0, 8], fontSize: 11 }
                  ]
                },
                {
                  width: '50%',
                  stack: [
                    { text: [{ text: 'Piano: ', bold: true }, datiImmobile.piano || '-'], margin: [0, 0, 0, 8], fontSize: 11 },
                    { text: [{ text: 'Stato: ', bold: true }, datiImmobile.statoManutenzione || '-'], margin: [0, 0, 0, 8], fontSize: 11 },
                    { text: [{ text: 'Vista Mare: ', bold: true }, datiImmobile.vistaMare || 'No'], margin: [0, 0, 0, 8], fontSize: 11 },
                    { text: [{ text: 'Distanza Mare: ', bold: true }, datiImmobile.distanzaMare ? datiImmobile.distanzaMare + ' m' : '-'], margin: [0, 0, 0, 8], fontSize: 11 }
                  ]
                }
              ]
            }
          ],
          margin: [0, 0, 0, 25]
        },

        // VALORI STIMATI - CARD MODERNA CON GRADIENTE
        {
          text: '💰  VALORI STIMATI',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 15]
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { 
                  text: 'Valore Minimo', 
                  style: 'tableHeaderModern', 
                  alignment: 'center',
                  fillColor: '#E11B22',
                  color: '#ffffff'
                },
                { 
                  text: 'Valore Medio', 
                  style: 'tableHeaderModern', 
                  alignment: 'center',
                  fillColor: '#E11B22',
                  color: '#ffffff'
                },
                { 
                  text: 'Valore Massimo', 
                  style: 'tableHeaderModern', 
                  alignment: 'center',
                  fillColor: '#E11B22',
                  color: '#ffffff'
                }
              ],
              [
                { 
                  text: `€ ${risultato.valoreMin.toLocaleString('it-IT')}`, 
                  style: 'tableValueModern', 
                  alignment: 'center',
                  fillColor: '#FFF5F5'
                },
                { 
                  text: `€ ${risultato.valoreTotale.toLocaleString('it-IT')}`, 
                  style: 'tableValueModern', 
                  alignment: 'center', 
                  bold: true,
                  fillColor: '#FFE6E6',
                  fontSize: 16,
                  color: '#E11B22'
                },
                { 
                  text: `€ ${risultato.valoreMax.toLocaleString('it-IT')}`, 
                  style: 'tableValueModern', 
                  alignment: 'center',
                  fillColor: '#FFF5F5'
                }
              ],
              [
                { 
                  text: `€ ${risultato.prezzoMqZona}/mq`, 
                  alignment: 'center',
                  fontSize: 9,
                  color: '#666666',
                  colSpan: 3,
                  border: [false, false, false, false]
                },
                {},
                {}
              ]
            ]
          },
          layout: {
            hLineWidth: (i: number) => i === 0 || i === 2 ? 0 : 1,
            vLineWidth: () => 1,
            hLineColor: () => '#E11B22',
            vLineColor: () => '#E11B22',
            paddingTop: () => 12,
            paddingBottom: () => 12
          },
          margin: [0, 0, 0, 25]
        },

        // DISCLAIMER CON ICONA
        {
          stack: [
            {
              text: 'ℹ️  DISCLAIMER',
              style: 'sectionHeaderModern',
              margin: [0, 0, 0, 10]
            },
            {
              text: 'Questa è una stima automatica indicativa basata su dati di mercato aggregati. Non sostituisce una valutazione professionale effettuata da un agente immobiliare abilitato.',
              style: 'disclaimerModern',
              margin: [0, 0, 0, 20]
            }
          ],
          fillColor: '#FFF9E6',
          margin: [-10, 0, -10, 25]
        },

        // COMPOSIZIONE VALORE - TABELLA MODERNA
        {
          text: '📊  COMPOSIZIONE VALORE',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 15]
        },
        {
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Valore Base', fillColor: '#F8F9FA', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] },
                { text: `€ ${risultato.valoreBase.toLocaleString('it-IT')}`, bold: true, alignment: 'right', fillColor: '#F8F9FA', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] }
              ],
              [
                { text: 'Pertinenze', fillColor: '#FFFFFF', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] },
                { text: `€ ${risultato.valorePertinenze.toLocaleString('it-IT')}`, alignment: 'right', fillColor: '#FFFFFF', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] }
              ],
              [
                { text: 'Valorizzazioni', fillColor: '#F8F9FA', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] },
                { text: `€ ${risultato.valoreValorizzazioni.toLocaleString('it-IT')}`, alignment: 'right', fillColor: '#F8F9FA', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] }
              ],
              [
                { text: 'TOTALE', bold: true, fontSize: 13, fillColor: '#E11B22', color: '#ffffff', border: [false, false, false, false] },
                { text: `€ ${risultato.valoreTotale.toLocaleString('it-IT')}`, bold: true, fontSize: 13, alignment: 'right', fillColor: '#E11B22', color: '#ffffff', border: [false, false, false, false] }
              ]
            ]
          },
          layout: {
            paddingTop: () => 10,
            paddingBottom: () => 10,
            paddingLeft: () => 15,
            paddingRight: () => 15
          },
          margin: [0, 0, 0, 25]
        },

        // PUNTI DI FORZA CON ICONE
        {
          text: '⭐  PUNTI DI FORZA',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 15]
        },
        {
          ul: risultato.consigli.puntiForza.map(punto => ({
            text: punto,
            margin: [0, 0, 0, 8]
          })),
          margin: [0, 0, 0, 20]
        },

        // ===== PAGINA 2: FUNNEL CTA =====
        { text: '', pageBreak: 'after' },

        {
          text: 'IL TUO PROSSIMO PASSO',
          style: 'pageHeaderModern',
          alignment: 'center',
          margin: [0, 30, 0, 40]
        },

        // CTA CALCOLA TASSE - DESIGN MODERNO CON OMBRA
        {
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: 515,
                  h: 120,
                  r: 8,
                  color: '#FFF9E6',
                  lineWidth: 3,
                  lineColor: '#FFB800'
                }
              ]
            },
            {
              stack: [
                { 
                  text: '💰 CALCOLA TASSE E ONERI', 
                  style: 'ctaTitleModern', 
                  margin: [20, -100, 20, 12],
                  color: '#B8860B'
                },
                { 
                  text: 'Scopri quanto dovrai pagare in tasse, imposte e spese notarili.\nCalcolo gratuito e immediato.', 
                  style: 'ctaTextModern', 
                  margin: [20, 0, 20, 15]
                },
                { 
                  text: '👉 CLICCA QUI PER CALCOLARE', 
                  link: 'https://tasseimmob-ttn8lkb9.manus.space/', 
                  style: 'ctaLinkModern', 
                  margin: [20, 0, 20, 15],
                  color: '#0066B3',
                  decoration: 'underline'
                }
              ]
            }
          ],
          margin: [0, 0, 0, 35]
        },

        // PERCHÉ SCEGLIERE RE/MAX
        {
          text: '🏆  PERCHÉ SCEGLIERE RE/MAX?',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            {
              width: '50%',
              ul: [
                '✓ Leader mondiale immobiliare',
                '✓ Network internazionale',
                '✓ Marketing professionale'
              ],
              margin: [0, 0, 10, 0]
            },
            {
              width: '50%',
              ul: [
                '✓ Strategie pricing data-driven',
                '✓ Vendita veloce e tecnologica',
                '✓ Assistenza completa'
              ]
            }
          ],
          margin: [0, 0, 0, 35]
        },

        // MERCATO COMPETITIVO - DESIGN MODERNO
        {
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: 515,
                  h: 110,
                  r: 8,
                  color: '#FFE6E6',
                  lineWidth: 3,
                  lineColor: '#E11B22'
                }
              ]
            },
            {
              stack: [
                { 
                  text: '⚠️  MERCATO COMPETITIVO - AGISCI ORA', 
                  style: 'urgencyTitleModern', 
                  margin: [20, -90, 20, 12],
                  color: '#E11B22'
                },
                { 
                  text: 'Attenzione: Diversi immobili simili sono in vendita nella zona. Un prezzo competitivo e una strategia di marketing efficace sono fondamentali per vendere velocemente al miglior prezzo.', 
                  style: 'urgencyTextModern', 
                  margin: [20, 0, 20, 15]
                }
              ]
            }
          ],
          margin: [0, 0, 0, 35]
        },

        // RICHIEDI CONSULENZA - DESIGN MODERNO
        {
          stack: [
            {
              canvas: [
                {
                  type: 'rect',
                  x: 0,
                  y: 0,
                  w: 515,
                  h: 110,
                  r: 8,
                  color: '#E6F2FF',
                  lineWidth: 3,
                  lineColor: '#0066B3'
                }
              ]
            },
            {
              stack: [
                { 
                  text: '📞  RICHIEDI CONSULENZA GRATUITA', 
                  style: 'consultTitleModern', 
                  margin: [20, -90, 20, 12],
                  color: '#0066B3'
                },
                { 
                  text: 'Contattami per una valutazione professionale completa', 
                  style: 'consultTextModern', 
                  margin: [20, 0, 20, 12]
                },
                { 
                  text: '💬 WhatsApp: Clicca qui', 
                  link: 'https://wa.me/message/4K6JSOQWVOTRL1', 
                  style: 'consultLinkModern', 
                  margin: [20, 0, 20, 15],
                  color: '#0066B3',
                  decoration: 'underline'
                }
              ]
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // ===== PAGINA 3: DISCLAIMER PROFESSIONALE =====
        { text: '', pageBreak: 'after' },

        {
          text: 'NOTE LEGALI E DISCLAIMER',
          style: 'pageHeaderModern',
          alignment: 'center',
          margin: [0, 30, 0, 35]
        },

        {
          text: '📋  NATURA DELLA STIMA',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 12]
        },
        {
          text: 'Questa stima è generata automaticamente da un algoritmo basato su dati di mercato aggregati e caratteristiche dell\'immobile. Si tratta di una stima indicativa e non vincolante, che non sostituisce in alcun modo una valutazione professionale effettuata da un agente immobiliare abilitato o da un perito qualificato.',
          margin: [0, 0, 0, 25],
          fontSize: 10,
          lineHeight: 1.4
        },

        {
          text: '⚠️  LIMITAZIONI E PRECISAZIONI',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 12]
        },
        {
          ul: [
            'La stima si basa su dati di mercato aggregati e può non riflettere condizioni specifiche',
            'Fattori non considerati: stato interno dettagliato, conformità urbanistica, vincoli',
            'Il valore reale può variare in base a condizioni di mercato e negoziazione',
            'La stima non tiene conto di difetti strutturali o problemi legali non dichiarati',
            'I prezzi possono variare rapidamente in base a domanda e offerta'
          ],
          margin: [0, 0, 0, 25],
          fontSize: 10
        },

        {
          text: '✅  RACCOMANDAZIONI PROFESSIONALI',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 12]
        },
        {
          text: 'Prima di prendere qualsiasi decisione di vendita, acquisto o investimento immobiliare, è fortemente consigliato richiedere una valutazione professionale completa da parte di un agente immobiliare abilitato. La valutazione professionale include: sopralluogo dettagliato, analisi comparativa di mercato aggiornata, verifica documentale, analisi urbanistica e catastale, strategia di pricing personalizzata.',
          margin: [0, 0, 0, 25],
          fontSize: 10,
          lineHeight: 1.4
        },

        {
          text: '🚫  ESCLUSIONE DI RESPONSABILITÀ',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 12]
        },
        {
          text: 'Francesco Principe e RE/MAX Mindset non si assumono alcuna responsabilità per decisioni prese sulla base di questa stima automatica. L\'utilizzatore riconosce di aver compreso la natura indicativa della stima e di non poter avanzare pretese basate esclusivamente su questo documento. Per qualsiasi utilizzo professionale, legale o finanziario, è necessaria una valutazione professionale certificata.',
          margin: [0, 0, 0, 25],
          fontSize: 10,
          lineHeight: 1.4
        },

        {
          text: '🔒  PRIVACY E DATI PERSONALI',
          style: 'sectionHeaderModern',
          margin: [0, 0, 0, 12]
        },
        {
          text: 'I dati forniti per la generazione di questa stima sono trattati in conformità al Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati esclusivamente per finalità di contatto commerciale e non saranno ceduti a terzi senza consenso esplicito. Per maggiori informazioni sul trattamento dei dati, contattare francesco.principe@remax.it',
          margin: [0, 0, 0, 35],
          fontSize: 10,
          lineHeight: 1.4
        },

        // CONTATTI FINALI - DESIGN MODERNO
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 515,
              h: 90,
              r: 8,
              color: '#F8F9FA'
            }
          ]
        },
        {
          stack: [
            { 
              text: '📧  CONTATTI', 
              style: 'contactTitleModern', 
              alignment: 'center', 
              margin: [0, -70, 0, 12],
              color: '#E11B22'
            },
            { 
              text: 'Francesco Principe - RE/MAX Mindset', 
              alignment: 'center', 
              margin: [0, 0, 0, 8],
              fontSize: 12,
              bold: true
            },
            { 
              text: 'Email: francesco.principe@remax.it', 
              alignment: 'center', 
              margin: [0, 0, 0, 15],
              fontSize: 11,
              color: '#0066B3'
            }
          ]
        },

        // COPYRIGHT
        {
          text: '© 2025 Francesco Principe - RE/MAX Mindset',
          style: 'footerModern',
          alignment: 'center',
          margin: [0, 25, 0, 0]
        },
        {
          text: 'Documento generato automaticamente - Non ha valore legale',
          style: 'footerModern',
          alignment: 'center',
          margin: [0, 5, 0, 0]
        }
      ],
      
      // WATERMARK MONGOLFIERA SU OGNI PAGINA
      background: function(currentPage: number, pageSize: any) {
        return {
          image: watermarkBase64,
          width: 200,
          opacity: 0.03,
          absolutePosition: { x: (pageSize.width - 200) / 2, y: (pageSize.height - 200) / 2 }
        };
      },
      
      styles: {
        mainHeader: {
          fontSize: 24,
          bold: true,
          alignment: 'center'
        },
        mainSubheader: {
          fontSize: 16,
          alignment: 'center'
        },
        pageHeaderModern: {
          fontSize: 22,
          bold: true,
          color: '#E11B22'
        },
        sectionHeaderModern: {
          fontSize: 14,
          bold: true,
          color: '#E11B22'
        },
        tableHeaderModern: {
          bold: true,
          fontSize: 12
        },
        tableValueModern: {
          fontSize: 15
        },
        disclaimerModern: {
          fontSize: 10,
          italics: true,
          color: '#666666',
          lineHeight: 1.3
        },
        ctaTitleModern: {
          fontSize: 17,
          bold: true,
          alignment: 'center'
        },
        ctaTextModern: {
          fontSize: 11,
          color: '#333333',
          alignment: 'center',
          lineHeight: 1.4
        },
        ctaLinkModern: {
          fontSize: 13,
          bold: true,
          alignment: 'center'
        },
        urgencyTitleModern: {
          fontSize: 15,
          bold: true,
          alignment: 'center'
        },
        urgencyTextModern: {
          fontSize: 10,
          color: '#333333',
          alignment: 'center',
          lineHeight: 1.4
        },
        consultTitleModern: {
          fontSize: 15,
          bold: true,
          alignment: 'center'
        },
        consultTextModern: {
          fontSize: 11,
          color: '#333333',
          alignment: 'center'
        },
        consultLinkModern: {
          fontSize: 13,
          bold: true,
          alignment: 'center'
        },
        contactTitleModern: {
          fontSize: 15,
          bold: true
        },
        footerModern: {
          fontSize: 9,
          color: '#999999'
        }
      },
      defaultStyle: {
        fontSize: 11,
        color: '#000000',
        lineHeight: 1.3
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
