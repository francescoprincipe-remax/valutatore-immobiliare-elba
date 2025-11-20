import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RisultatoValutazione } from '../../../server/valutazione-engine';

export function generatePDFReport(
  risultato: RisultatoValutazione,
  datiImmobile: any
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Colori RE/MAX
  const remaxRed: [number, number, number] = [225, 27, 34];
  const remaxBlue: [number, number, number] = [0, 102, 179];
  const darkGray: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [245, 245, 245];

  // Header con logo (simulato con testo)
  doc.setFillColor(...remaxRed);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RE/MAX', 15, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Valutatore Immobiliare Isola d\'Elba', 15, 23);

  yPos = 45;

  // Titolo Report
  doc.setTextColor(...darkGray);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT DI VALUTAZIONE IMMOBILIARE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Informazioni Immobile
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('IMMOBILE', 15, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const infoImmobile = [
    `Tipologia: ${datiImmobile.tipologia}`,
    `Superficie: ${datiImmobile.superficieAbitabile} mq`,
    `Località: ${datiImmobile.comune}${datiImmobile.localita ? ' - ' + datiImmobile.localita : ''}`,
    datiImmobile.numeroCamere ? `Camere: ${datiImmobile.numeroCamere}` : null,
    datiImmobile.numeroBagni ? `Bagni: ${datiImmobile.numeroBagni}` : null,
    `Stato: ${datiImmobile.statoManutenzione}`,
  ].filter(Boolean);

  infoImmobile.forEach((info) => {
    doc.text(info as string, 15, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Box Valutazione Principale
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yPos, pageWidth - 30, 40, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('VALORE STIMATO', pageWidth / 2, yPos + 10, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(...remaxRed);
  doc.setFont('helvetica', 'bold');
  doc.text(`€ ${risultato.valoreTotale.toLocaleString('it-IT')}`, pageWidth / 2, yPos + 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(...darkGray);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Range: € ${risultato.valoreMin.toLocaleString('it-IT')} - € ${risultato.valoreMax.toLocaleString('it-IT')}`,
    pageWidth / 2,
    yPos + 32,
    { align: 'center' }
  );

  yPos += 50;

  // Tabella Composizione Valore
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPOSIZIONE DEL VALORE', 15, yPos);
  yPos += 5;

  const tableData: any[] = [
    ['Valore Base', `€ ${risultato.valoreBase.toLocaleString('it-IT')}`],
  ];

  if (risultato.valorePertinenze > 0) {
    tableData.push(['Pertinenze', `+ € ${risultato.valorePertinenze.toLocaleString('it-IT')}`]);
    Object.entries(risultato.dettaglioPertinenze).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      tableData.push([`  • ${label}`, `€ ${(value as number).toLocaleString('it-IT')}`]);
    });
  }

  if (risultato.valoreValorizzazioni > 0) {
    tableData.push(['Valorizzazioni', `+ € ${risultato.valoreValorizzazioni.toLocaleString('it-IT')}`]);
    Object.entries(risultato.dettaglioValorizzazioni).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      tableData.push([`  • ${label}`, `€ ${(value as number).toLocaleString('it-IT')}`]);
    });
  }

  if (risultato.valoreSvalutazioni > 0) {
    tableData.push(['Svalutazioni', `- € ${risultato.valoreSvalutazioni.toLocaleString('it-IT')}`]);
    Object.entries(risultato.dettaglioSvalutazioni).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
      tableData.push([`  • ${label}`, `€ ${(value as number).toLocaleString('it-IT')}`]);
    });
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Voce', 'Importo']],
    body: tableData,
    foot: [['TOTALE', `€ ${risultato.valoreTotale.toLocaleString('it-IT')}`]],
    theme: 'striped',
    headStyles: { fillColor: remaxRed, textColor: 255 },
    footStyles: { fillColor: remaxBlue, textColor: 255, fontStyle: 'bold' },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Nuova pagina se necessario
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Analisi Competitività
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ANALISI DI COMPETITIVITÀ', 15, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Livello di competitività: ${risultato.livelloCompetitivita.replace('_', ' ')}`, 15, yPos);
  yPos += 6;
  doc.text(`Immobili simili in zona: ${risultato.immobiliSimiliZona}`, 15, yPos);
  yPos += 6;
  doc.text(`Prezzo consigliato: € ${risultato.prezzoConsigliato.toLocaleString('it-IT')}`, 15, yPos);
  yPos += 12;

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
    yPos += 5;
  }

  // Strategia di Vendita
  if (risultato.consigli.strategiaVendita.length > 0) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('STRATEGIA DI VENDITA', 15, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    risultato.consigli.strategiaVendita.forEach((consiglio, idx) => {
      const lines = doc.splitTextToSize(`${idx + 1}. ${consiglio}`, pageWidth - 30);
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

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Report generato il ${new Date().toLocaleDateString('it-IT')} - Pagina ${i} di ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      '© 2025 Francesco Principe - RE/MAX Mindset',
      pageWidth / 2,
      doc.internal.pageSize.height - 5,
      { align: 'center' }
    );
  }

  // Disclaimer professionale (ultima pagina)
  doc.addPage();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkGray);
  doc.text('DISCLAIMER PROFESSIONALE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const disclaimerText = [
    'La presente valutazione immobiliare è stata generata automaticamente mediante algoritmo proprietario basato su dati di mercato, quotazioni OMI e parametri tecnici dell\'immobile. Tale stima ha carattere puramente indicativo e orientativo.',
    '',
    'La valutazione automatica NON sostituisce una perizia tecnica professionale effettuata da un esperto abilitato mediante sopralluogo fisico dell\'immobile. Per una valutazione definitiva e vincolante ai fini di compravendita, è necessario richiedere una consulenza personalizzata con sopralluogo.',
    '',
    'I valori indicati nel presente report possono variare in funzione di: condizioni specifiche dell\'immobile non rilevabili da valutazione automatica, dinamiche di mercato locale, stagionalità, presenza di vincoli urbanistici o ambientali, stato documentale della proprietà.',
    '',
    'Francesco Principe e RE/MAX Mindset declinano ogni responsabilità per decisioni commerciali o finanziarie assunte sulla base della presente valutazione automatica senza preventiva consulenza professionale diretta.',
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

  // Footer anche per pagina disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Report generato il ${new Date().toLocaleDateString('it-IT')} - Pagina ${pageCount + 1} di ${pageCount + 1}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  doc.text(
    '© 2025 Francesco Principe - RE/MAX Mindset',
    pageWidth / 2,
    doc.internal.pageSize.height - 5,
    { align: 'center' }
  );

  // Salva il PDF
  const filename = `Valutazione_${datiImmobile.comune}_${Date.now()}.pdf`;
  doc.save(filename);
}
