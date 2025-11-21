import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RisultatoValutazione } from '../../../server/valutazione-engine';

export function generatePDFReport(
  risultato: RisultatoValutazione,
  datiImmobile: any
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // Colori RE/MAX
  const remaxRed: [number, number, number] = [225, 27, 34];
  const remaxBlue: [number, number, number] = [0, 102, 179];
  const darkGray: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [245, 245, 245];
  const green: [number, number, number] = [34, 197, 94];

  // ========== PAGINA 1: VALUTAZIONE ==========
  
  // Header con logo
  doc.setFillColor(...remaxRed);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('RE/MAX', 15, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Valutatore Immobiliare Isola d\'Elba', 15, 27);

  yPos = 50;

  // Titolo Report
  doc.setTextColor(...darkGray);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('STIMA DI MERCATO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Valutazione automatica basata su dati di mercato reali', pageWidth / 2, yPos, { align: 'center' });
  yPos += 18;

  // Box Immobile
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'bold');
  doc.text('IMMOBILE', 20, yPos + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const infoImmobile = [
    `${datiImmobile.tipologia} • ${datiImmobile.superficieAbitabile} mq`,
    `${datiImmobile.comune}${datiImmobile.localita ? ' - ' + datiImmobile.localita : ''}`,
    `Stato: ${datiImmobile.statoManutenzione}${datiImmobile.numeroCamere ? ` • ${datiImmobile.numeroCamere} camere` : ''}`,
  ];
  
  let infoY = yPos + 16;
  infoImmobile.forEach((info) => {
    doc.text(info, 20, infoY);
    infoY += 5;
  });

  yPos += 45;

  // Box Valutazione Principale - PIÙ GRANDE E ACCATTIVANTE
  doc.setFillColor(...remaxBlue);
  doc.roundedRect(15, yPos, pageWidth - 30, 50, 5, 5, 'F');

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('VALORE STIMATO', pageWidth / 2, yPos + 12, { align: 'center' });

  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`€ ${risultato.valoreTotale.toLocaleString('it-IT')}`, pageWidth / 2, yPos + 28, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Range: € ${risultato.valoreMin.toLocaleString('it-IT')} - € ${risultato.valoreMax.toLocaleString('it-IT')}`,
    pageWidth / 2,
    yPos + 40,
    { align: 'center' }
  );

  yPos += 60;

  // Box Prezzo Consigliato - EVIDENZIATO
  doc.setFillColor(...green);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('PREZZO DI VENDITA CONSIGLIATO', 20, yPos + 10);
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`€ ${risultato.prezzoConsigliato.toLocaleString('it-IT')}`, pageWidth - 20, yPos + 17, { align: 'right' });

  yPos += 35;

  // Composizione Valore - SOLO TOTALI, NO DETTAGLI
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('COMPOSIZIONE DEL VALORE', 15, yPos);
  yPos += 5;

  const tableData: any[] = [
    ['Valore Base', `€ ${risultato.valoreBase.toLocaleString('it-IT')}`],
  ];

  if (risultato.valorePertinenze > 0) {
    tableData.push(['Pertinenze', `+ € ${risultato.valorePertinenze.toLocaleString('it-IT')}`]);
  }

  if (risultato.valoreValorizzazioni > 0) {
    tableData.push(['Valorizzazioni', `+ € ${risultato.valoreValorizzazioni.toLocaleString('it-IT')}`]);
  }

  if (risultato.valoreSvalutazioni > 0) {
    tableData.push(['Svalutazioni', `- € ${risultato.valoreSvalutazioni.toLocaleString('it-IT')}`]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Voce', 'Importo']],
    body: tableData,
    foot: [['VALORE TOTALE', `€ ${risultato.valoreTotale.toLocaleString('it-IT')}`]],
    theme: 'striped',
    headStyles: { fillColor: remaxRed, textColor: 255, fontSize: 10 },
    footStyles: { fillColor: remaxBlue, textColor: 255, fontStyle: 'bold', fontSize: 11 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Competitività
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('ANALISI DI COMPETITIVITÀ', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Livello: ${risultato.livelloCompetitivita.replace('_', ' ')}`, 15, yPos);
  yPos += 5;
  doc.text(`Immobili simili in zona: ${risultato.immobiliSimiliZona}`, 15, yPos);
  yPos += 10;

  // Punti di Forza
  if (risultato.consigli.puntiForza.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PUNTI DI FORZA', 15, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    risultato.consigli.puntiForza.forEach((punto) => {
      const lines = doc.splitTextToSize(`✓ ${punto}`, pageWidth - 30);
      lines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 15, yPos);
        yPos += 5;
      });
    });
  }

  // ========== PAGINA 2: FUNNEL + CTA ==========
  doc.addPage();
  yPos = 20;

  // Header pagina 2
  doc.setFillColor(...remaxRed);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VENDI PIÙ VELOCEMENTE CON RE/MAX', pageWidth / 2, 15, { align: 'center' });

  yPos = 40;

  // Strategia di Vendita
  if (risultato.consigli.strategiaVendita.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text('STRATEGIA DI VENDITA PERSONALIZZATA', 15, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    risultato.consigli.strategiaVendita.forEach((consiglio, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${consiglio}`, pageWidth - 30);
      lines.forEach((line: string) => {
        doc.text(line, 15, yPos);
        yPos += 5;
      });
    });
    yPos += 10;
  }

  // Box Valore Aggiunto RE/MAX
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 55, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...remaxBlue);
  doc.text('PERCHÉ SCEGLIERE RE/MAX?', 20, yPos + 10);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkGray);
  const vantaggi = [
    '✓ Network internazionale con oltre 140.000 agenti in 110 paesi',
    '✓ Marketing professionale: foto, video, virtual tour 360°',
    '✓ Visibilità massima su tutti i principali portali immobiliari',
    '✓ Consulenza personalizzata per massimizzare il valore',
    '✓ Esperienza consolidata nel mercato dell\'Isola d\'Elba',
  ];
  
  let vantaggiY = yPos + 18;
  vantaggi.forEach(v => {
    doc.text(v, 20, vantaggiY);
    vantaggiY += 6;
  });

  yPos += 65;

  // Box Urgenza
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(15, yPos, pageWidth - 30, 20, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('⚡ MERCATO COMPETITIVO - AGISCI ORA', 20, yPos + 8);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Con ${risultato.immobiliSimiliZona} immobili simili in zona, è fondamentale posizionarsi correttamente`, 20, yPos + 14);

  yPos += 30;

  // CTA PRINCIPALE - GRANDE E VISIBILE
  doc.setFillColor(...remaxRed);
  doc.roundedRect(15, yPos, pageWidth - 30, 40, 5, 5, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RICHIEDI UNA CONSULENZA GRATUITA', pageWidth / 2, yPos + 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Contattaci oggi per una valutazione professionale', pageWidth / 2, yPos + 23, { align: 'center' });
  doc.text('con sopralluogo e strategia di vendita personalizzata', pageWidth / 2, yPos + 29, { align: 'center' });

  yPos += 50;

  // Contatti
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('CONTATTI', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('📱 WhatsApp: +39 328 123 4567', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('📧 Email: francesco.principe@remax.it', pageWidth / 2, yPos, { align: 'center' });
  yPos += 6;
  doc.text('🌐 Web: valutatore-elba.manus.space', pageWidth / 2, yPos, { align: 'center' });

  // ========== PAGINA 3: DISCLAIMER ==========
  doc.addPage();
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('DISCLAIMER PROFESSIONALE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const disclaimerText = [
    'La presente stima immobiliare è stata generata automaticamente mediante algoritmo proprietario basato su dati di mercato, quotazioni OMI e parametri tecnici dell\'immobile. Tale stima ha carattere puramente indicativo e orientativo.',
    '',
    'La stima automatica NON sostituisce una perizia tecnica professionale effettuata da un esperto abilitato mediante sopralluogo fisico dell\'immobile. Per una valutazione definitiva e vincolante ai fini di compravendita, è necessario richiedere una consulenza personalizzata con sopralluogo.',
    '',
    'I valori indicati nel presente report possono variare in funzione di: condizioni specifiche dell\'immobile non rilevabili da valutazione automatica, dinamiche di mercato locale, stagionalità, presenza di vincoli urbanistici o ambientali, stato documentale della proprietà.',
    '',
    'Francesco Principe e RE/MAX Mindset declinano ogni responsabilità per decisioni commerciali o finanziarie assunte sulla base della presente stima automatica senza preventiva consulenza professionale diretta.',
  ];
  
  let disclaimerY = 35;
  disclaimerText.forEach(line => {
    if (line === '') {
      disclaimerY += 5;
    } else {
      const splitLines = doc.splitTextToSize(line, pageWidth - 30);
      splitLines.forEach((splitLine: string) => {
        doc.text(splitLine, 15, disclaimerY);
        disclaimerY += 5;
      });
    }
  });

  // Footer per tutte le pagine
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Report generato il ${new Date().toLocaleDateString('it-IT')} - Pagina ${i} di ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      '© 2025 Francesco Principe - RE/MAX Mindset',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Salva il PDF
  const filename = `Stima_${datiImmobile.comune}_${Date.now()}.pdf`;
  doc.save(filename);
}
