import pdfMake from 'pdfmake/build/pdfmake.js';
import vfsFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';

// Configurazione font
pdfMake.vfs = vfsFonts;

// Dati di test simulati
const valutazione = {
  valoreBase: 187488,
  prezzoMqZona: 3348,
  valorePertinenze: 0,
  valoreValorizzazioni: 5625,
  valoreSvalutazioni: 0,
  valoreTotale: 193113,
  valoreMin: 173802,
  valoreMax: 212424,
  livelloCompetitivita: 'MEDIA',
  prezzoConsigliato: 183457,
  consigli: {
    puntiForza: ['Vicinanza al mare'],
    strategiaVendita: [
      'Contattaci per ricevere la strategia di vendita personalizzata per il tuo immobile',
      'Enfatizzare: Vicinanza al mare',
      'Fotografie professionali con vista mare',
      'Virtual tour 360° per massimizzare visibilità',
    ],
  },
};

const datiImmobile = {
  comune: 'Capoliveri',
  localita: 'Centro',
  tipologia: 'APPARTAMENTO',
  superficie: 56,
  piano: '-',
  stato: '-',
  vistaMare: false,
  distanzaMare: 500,
};

const valori = {
  minimo: valutazione.valoreMin,
  medio: valutazione.valoreTotale,
  massimo: valutazione.valoreMax,
  prezzoMq: valutazione.prezzoMqZona,
  prezzoConsigliato: valutazione.prezzoConsigliato,
  competitivita: valutazione.livelloCompetitivita,
};

const composizione = {
  valoreBase: valutazione.valoreBase,
  pertinenze: valutazione.valorePertinenze,
  valorizzazioni: valutazione.valoreValorizzazioni,
};

const puntiForza = valutazione.consigli.puntiForza;
const strategia = valutazione.consigli.strategiaVendita;

// Formattazione valori
const formatEuro = (val) => `€ ${val.toLocaleString('it-IT')}`;
const formatEuroMq = (val) => `€ ${val}/mq`;

// Traduzione tipologia
const tipologiaMap = {
  APPARTAMENTO: 'Appartamento',
  VILLA: 'Villa',
  VILLETTA: 'Villetta a Schiera',
  RUSTICO: 'Rustico/Casale',
};

const docDefinition = {
  pageSize: 'A4',
  pageMargins: [30, 30, 30, 30],
  content: [
    // ==================== PAGINA 1: HEADER E VALUTAZIONE ====================
    
    // HEADER ROSSO FULL-WIDTH
    {
      canvas: [
        {
          type: 'rect',
          x: -30,
          y: -30,
          w: 595,
          h: 100,
          color: '#E11B22',
        },
      ],
      absolutePosition: { x: 0, y: 0 },
    },
    {
      text: 'STIMA AUTOMATICA DI MERCATO',
      fontSize: 26,
      bold: true,
      color: '#FFFFFF',
      alignment: 'center',
      margin: [0, 15, 0, 3],
    },
    {
      text: `Isola d'Elba - ${datiImmobile.comune}`,
      fontSize: 14,
      color: '#FFFFFF',
      alignment: 'center',
      margin: [0, 0, 0, 20],
    },

    // DATI IMMOBILE - Layout compatto
    {
      text: 'DATI IMMOBILE',
      fontSize: 14,
      bold: true,
      color: '#E11B22',
      margin: [0, 25, 0, 12],
    },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: [{ text: 'Comune: ', bold: true }, datiImmobile.comune], fontSize: 10, margin: [0, 0, 0, 5] },
            { text: [{ text: 'Località: ', bold: true }, datiImmobile.localita], fontSize: 10, margin: [0, 0, 0, 5] },
            { text: [{ text: 'Tipologia: ', bold: true }, tipologiaMap[datiImmobile.tipologia] || datiImmobile.tipologia], fontSize: 10, margin: [0, 0, 0, 5] },
            { text: [{ text: 'Superficie: ', bold: true }, `${datiImmobile.superficie} mq`], fontSize: 10, margin: [0, 0, 0, 0] },
          ],
        },
        {
          width: '50%',
          stack: [
            { text: [{ text: 'Piano: ', bold: true }, datiImmobile.piano || '-'], fontSize: 10, margin: [0, 0, 0, 5] },
            { text: [{ text: 'Stato: ', bold: true }, datiImmobile.stato || '-'], fontSize: 10, margin: [0, 0, 0, 5] },
            { text: [{ text: 'Vista Mare: ', bold: true }, datiImmobile.vistaMare ? 'Sì' : 'No'], fontSize: 10, margin: [0, 0, 0, 5] },
            { text: [{ text: 'Distanza Mare: ', bold: true }, `${datiImmobile.distanzaMare} m`], fontSize: 10, margin: [0, 0, 0, 0] },
          ],
        },
      ],
      margin: [0, 0, 0, 20],
    },

    // VALORI STIMATI - Tabella compatta
    {
      text: 'VALORI STIMATI',
      fontSize: 14,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 12],
    },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Valore Minimo', fontSize: 11, bold: true, fillColor: '#E11B22', color: '#FFFFFF', alignment: 'center', margin: [0, 8, 0, 8] },
            { text: 'Valore Stimato', fontSize: 11, bold: true, fillColor: '#E11B22', color: '#FFFFFF', alignment: 'center', margin: [0, 8, 0, 8] },
            { text: 'Valore Massimo', fontSize: 11, bold: true, fillColor: '#FFFFFF', color: '#FFFFFF', alignment: 'center', margin: [0, 8, 0, 8] },
          ],
          [
            { text: formatEuro(valori.minimo), fontSize: 14, bold: true, alignment: 'center', margin: [0, 10, 0, 10] },
            {
              stack: [
                { text: formatEuro(valori.medio), fontSize: 18, bold: true, color: '#E11B22', alignment: 'center' },
                { text: formatEuroMq(valori.prezzoMq), fontSize: 10, color: '#666666', alignment: 'center', margin: [0, 3, 0, 0] },
              ],
              margin: [0, 8, 0, 8],
            },
            { text: formatEuro(valori.massimo), fontSize: 14, bold: true, alignment: 'center', margin: [0, 10, 0, 10] },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#DDDDDD',
        vLineColor: () => '#DDDDDD',
      },
      margin: [0, 0, 0, 10],
    },
    {
      text: `Competitività mercato: ${valori.competitivita}`,
      fontSize: 11,
      bold: true,
      color: '#0066CC',
      alignment: 'center',
      margin: [0, 0, 0, 20],
    },

    // DISCLAIMER
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'DISCLAIMER', fontSize: 11, bold: true, color: '#CC8800', margin: [0, 0, 0, 5] },
                {
                  text: 'Questa è una stima automatica indicativa basata su dati di mercato aggregati. Non sostituisce una valutazione professionale effettuata da un agente immobiliare abilitato.',
                  fontSize: 9,
                  color: '#666666',
                  lineHeight: 1.3,
                },
              ],
              margin: [10, 10, 10, 10],
            },
          ],
        ],
      },
      layout: {
        fillColor: '#FFF9E6',
        hLineWidth: () => 2,
        vLineWidth: () => 2,
        hLineColor: () => '#FFD700',
        vLineColor: () => '#FFD700',
      },
      margin: [0, 0, 0, 20],
    },

    // COMPOSIZIONE VALORE
    {
      text: 'COMPOSIZIONE VALORE',
      fontSize: 14,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Valore Base', fontSize: 10, border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] },
            { text: formatEuro(composizione.valoreBase), fontSize: 11, bold: true, alignment: 'right', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'] },
          ],
          [
            { text: `${datiImmobile.superficie} mq × ${formatEuroMq(valori.prezzoMq)}`, fontSize: 9, color: '#999999', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
          ],
          [
            { text: 'Pertinenze', fontSize: 10, border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'], margin: [0, 5, 0, 0] },
            { text: formatEuro(composizione.pertinenze), fontSize: 11, bold: true, alignment: 'right', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'], margin: [0, 5, 0, 0] },
          ],
          [
            { text: 'Valorizzazioni', fontSize: 10, border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'], margin: [0, 5, 0, 0] },
            { text: formatEuro(composizione.valorizzazioni), fontSize: 11, bold: true, alignment: 'right', border: [false, false, false, true], borderColor: ['', '', '', '#E0E0E0'], margin: [0, 5, 0, 0] },
          ],
          [
            { text: 'TOTALE', fontSize: 11, bold: true, fillColor: '#E11B22', color: '#FFFFFF', border: [false, false, false, false], margin: [5, 8, 0, 8] },
            { text: formatEuro(valori.medio), fontSize: 13, bold: true, fillColor: '#E11B22', color: '#FFFFFF', alignment: 'right', border: [false, false, false, false], margin: [0, 8, 5, 8] },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 20],
    },

    // PUNTI DI FORZA
    {
      text: 'PUNTI DI FORZA',
      fontSize: 14,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 10],
    },
    ...puntiForza.map((punto) => ({
      text: `• ${punto}`,
      fontSize: 10,
      color: '#2ECC71',
      bold: true,
      margin: [0, 0, 0, 5],
    })),

    // ==================== PAGINA 2: CTA E STRATEGIA ====================
    { text: '', pageBreak: 'after' },

    {
      text: 'IL TUO PROSSIMO PASSO',
      fontSize: 22,
      bold: true,
      color: '#E11B22',
      alignment: 'center',
      margin: [0, 30, 0, 30],
    },

    // CTA 1 - CALCOLA TASSE (BOTTONE CENTRATO)
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'CALCOLA TASSE E ONERI', fontSize: 13, bold: true, color: '#CC8800', alignment: 'center', margin: [0, 0, 0, 8] },
                {
                  text: 'Scopri quanto dovrai pagare in tasse, imposte e spese notarili. Calcolo gratuito e immediato.',
                  fontSize: 10,
                  color: '#333333',
                  alignment: 'center',
                  lineHeight: 1.4,
                  margin: [10, 0, 10, 12],
                },
                {
                  text: 'CLICCA QUI PER CALCOLARE',
                  link: 'https://tasseimmob-ttn8lkb9.manus.space/',
                  fontSize: 11,
                  bold: true,
                  color: '#0066CC',
                  decoration: 'underline',
                  alignment: 'center',
                },
              ],
              margin: [15, 15, 15, 15],
            },
          ],
        ],
      },
      layout: {
        fillColor: '#FFF3CD',
        hLineWidth: () => 3,
        vLineWidth: () => 3,
        hLineColor: () => '#FFD700',
        vLineColor: () => '#FFD700',
      },
      margin: [0, 0, 0, 25],
    },

    // PERCHÉ SCEGLIERE RE/MAX
    {
      text: 'PERCHÉ SCEGLIERE RE/MAX',
      fontSize: 14,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 12],
    },
    {
      columns: [
        {
          width: '50%',
          stack: [
            { text: '• Leader mondiale immobiliare', fontSize: 10, margin: [0, 0, 0, 6] },
            { text: '• Network internazionale', fontSize: 10, margin: [0, 0, 0, 6] },
            { text: '• Marketing professionale', fontSize: 10, margin: [0, 0, 0, 0] },
          ],
        },
        {
          width: '50%',
          stack: [
            { text: '• Strategie pricing data-driven', fontSize: 10, margin: [0, 0, 0, 6] },
            { text: '• Vendita veloce e tecnologica', fontSize: 10, margin: [0, 0, 0, 6] },
            { text: '• Assistenza completa', fontSize: 10, margin: [0, 0, 0, 0] },
          ],
        },
      ],
      margin: [0, 0, 0, 25],
    },

    // CTA 2 - MERCATO COMPETITIVO (BOTTONE CENTRATO)
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'MERCATO COMPETITIVO - AGISCI ORA', fontSize: 13, bold: true, color: '#C00000', alignment: 'center', margin: [0, 0, 0, 8] },
                {
                  text: 'Attenzione: Diversi immobili simili sono in vendita nella zona. Un prezzo competitivo e una strategia di marketing efficace sono fondamentali per vendere velocemente al miglior prezzo.',
                  fontSize: 10,
                  color: '#333333',
                  alignment: 'center',
                  lineHeight: 1.4,
                  margin: [10, 0, 10, 0],
                },
              ],
              margin: [15, 15, 15, 15],
            },
          ],
        ],
      },
      layout: {
        fillColor: '#FFE6E6',
        hLineWidth: () => 3,
        vLineWidth: () => 3,
        hLineColor: () => '#E11B22',
        vLineColor: () => '#E11B22',
      },
      margin: [0, 0, 0, 25],
    },

    // CTA 3 - CONSULENZA (BOTTONE CENTRATO)
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'RICHIEDI CONSULENZA GRATUITA', fontSize: 13, bold: true, color: '#0066CC', alignment: 'center', margin: [0, 0, 0, 8] },
                {
                  text: 'Contattami per una valutazione professionale completa',
                  fontSize: 10,
                  color: '#333333',
                  alignment: 'center',
                  margin: [10, 0, 10, 12],
                },
                {
                  text: 'WHATSAPP: CLICCA QUI',
                  link: 'https://wa.me/message/4K6JSOQWVOTRL1',
                  fontSize: 11,
                  bold: true,
                  color: '#25D366',
                  decoration: 'underline',
                  alignment: 'center',
                },
              ],
              margin: [15, 15, 15, 15],
            },
          ],
        ],
      },
      layout: {
        fillColor: '#E6F2FF',
        hLineWidth: () => 3,
        vLineWidth: () => 3,
        hLineColor: () => '#4A90E2',
        vLineColor: () => '#4A90E2',
      },
      margin: [0, 0, 0, 0],
    },

    // ==================== PAGINA 3: STRATEGIA E DISCLAIMER ====================
    { text: '', pageBreak: 'after' },

    {
      text: 'STRATEGIA DI VENDITA',
      fontSize: 22,
      bold: true,
      color: '#E11B22',
      alignment: 'center',
      margin: [0, 30, 0, 20],
    },
    {
      text: 'Consigli per massimizzare il valore e velocizzare la vendita',
      fontSize: 11,
      color: '#666666',
      italics: true,
      alignment: 'center',
      margin: [0, 0, 0, 25],
    },

    ...strategia.map((consiglio, index) => ({
      text: `${index + 1}. ${consiglio}`,
      fontSize: 10,
      lineHeight: 1.5,
      margin: [0, 0, 0, 10],
    })),

    { text: '', margin: [0, 0, 0, 25] },

    // PREZZO CONSIGLIATO
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'Prezzo di Vendita Consigliato', fontSize: 12, color: '#666666', alignment: 'center', margin: [0, 0, 0, 5] },
                { text: formatEuro(valori.prezzoConsigliato), fontSize: 24, bold: true, color: '#E11B22', alignment: 'center', margin: [0, 0, 0, 5] },
                {
                  text: `Basato sull'analisi di competitività e sulle condizioni attuali del mercato immobiliare dell'Isola d'Elba`,
                  fontSize: 9,
                  color: '#999999',
                  italics: true,
                  alignment: 'center',
                  lineHeight: 1.3,
                  margin: [15, 0, 15, 0],
                },
              ],
              margin: [15, 15, 15, 15],
            },
          ],
        ],
      },
      layout: {
        fillColor: '#F5F5F5',
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      margin: [0, 0, 0, 30],
    },

    // CTA FINALE
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'Vuoi Vendere Più Velocemente?', fontSize: 15, bold: true, color: '#FFFFFF', alignment: 'center', margin: [0, 0, 0, 10] },
                {
                  text: `Contattaci per ricevere una guida personalizzata su come vendere il tuo immobile all'Isola d'Elba. Strategie testate, consigli pratici e supporto professionale RE/MAX.`,
                  fontSize: 10,
                  color: '#FFFFFF',
                  alignment: 'center',
                  lineHeight: 1.4,
                  margin: [15, 0, 15, 0],
                },
              ],
              margin: [20, 20, 20, 20],
            },
          ],
        ],
      },
      layout: {
        fillColor: '#E11B22',
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      margin: [0, 0, 0, 40],
    },

    // NOTE LEGALI
    {
      text: 'NOTE LEGALI E DISCLAIMER',
      fontSize: 18,
      bold: true,
      color: '#E11B22',
      alignment: 'center',
      margin: [0, 0, 0, 25],
    },

    {
      text: 'NATURA DELLA STIMA',
      fontSize: 12,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 8],
    },
    {
      text: `Questa stima è generata automaticamente da un algoritmo basato su dati di mercato aggregati e caratteristiche dell'immobile. Si tratta di una stima indicativa e non vincolante, che non sostituisce in alcun modo una valutazione professionale effettuata da un agente immobiliare abilitato o da un perito qualificato.`,
      fontSize: 9,
      lineHeight: 1.4,
      alignment: 'justify',
      margin: [0, 0, 0, 15],
    },

    {
      text: 'LIMITAZIONI E PRECISAZIONI',
      fontSize: 12,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 8],
    },
    {
      ul: [
        'La stima si basa su dati di mercato aggregati e può non riflettere condizioni specifiche',
        'Fattori non considerati: stato interno dettagliato, conformità urbanistica, vincoli',
        'Il valore reale può variare in base a condizioni di mercato e negoziazione',
        'La stima non tiene conto di difetti strutturali o problemi legali non dichiarati',
        'I prezzi possono variare rapidamente in base a domanda e offerta',
      ],
      fontSize: 9,
      lineHeight: 1.4,
      margin: [0, 0, 0, 15],
    },

    {
      text: 'ESCLUSIONE DI RESPONSABILITÀ',
      fontSize: 12,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 8],
    },
    {
      text: `Francesco Principe e RE/MAX Mindset non si assumono alcuna responsabilità per decisioni prese sulla base di questa stima automatica. L'utilizzatore riconosce di aver compreso la natura indicativa della stima e di non poter avanzare pretese basate esclusivamente su questo documento. Per qualsiasi utilizzo professionale, legale o finanziario, è necessaria una valutazione professionale certificata.`,
      fontSize: 9,
      lineHeight: 1.4,
      alignment: 'justify',
      margin: [0, 0, 0, 15],
    },

    {
      text: 'PRIVACY E DATI PERSONALI',
      fontSize: 12,
      bold: true,
      color: '#E11B22',
      margin: [0, 0, 0, 8],
    },
    {
      text: `I dati forniti per la generazione di questa stima sono trattati in conformità al Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati esclusivamente per finalità di contatto commerciale e non saranno ceduti a terzi senza consenso esplicito. Per maggiori informazioni sul trattamento dei dati, contattare francesco.principe@remax.it`,
      fontSize: 9,
      lineHeight: 1.4,
      alignment: 'justify',
      margin: [0, 0, 0, 25],
    },

    // BOX CONTATTI
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'CONTATTI', fontSize: 12, bold: true, color: '#E11B22', alignment: 'center', margin: [0, 0, 0, 5] },
                { text: 'Francesco Principe - RE/MAX Mindset', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 3] },
                {
                  text: 'Email: francesco.principe@remax.it',
                  link: 'mailto:francesco.principe@remax.it',
                  fontSize: 10,
                  color: '#0066CC',
                  decoration: 'underline',
                  alignment: 'center',
                },
              ],
              margin: [15, 12, 15, 12],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 2,
        vLineWidth: () => 2,
        hLineColor: () => '#E11B22',
        vLineColor: () => '#E11B22',
      },
      margin: [0, 0, 0, 15],
    },

    // FOOTER
    {
      text: '© 2025 Francesco Principe - RE/MAX Mindset',
      fontSize: 9,
      color: '#999999',
      alignment: 'center',
      margin: [0, 0, 0, 2],
    },
    {
      text: 'Documento generato automaticamente - Non ha valore legale',
      fontSize: 8,
      color: '#CCCCCC',
      alignment: 'center',
    },
  ],
  defaultStyle: {
    font: 'Roboto',
  },
};

// Genera PDF
const pdfDoc = pdfMake.createPdf(docDefinition);
pdfDoc.getBuffer((buffer) => {
  fs.writeFileSync('/home/ubuntu/stima-immobiliare-elba-hightech.pdf', buffer);
  console.log('✅ PDF high-tech generato con successo: /home/ubuntu/stima-immobiliare-elba-hightech.pdf');
});
