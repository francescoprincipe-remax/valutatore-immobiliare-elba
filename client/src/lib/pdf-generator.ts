import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RisultatoValutazione } from '../../../server/valutazione-engine';

export function generatePDFReport(
  risultato: RisultatoValutazione,
  datiImmobile: any
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Colori RE/MAX
  const remaxRed: [number, number, number] = [225, 27, 34];
  const remaxBlue: [number, number, number] = [0, 102, 179];
  const darkGray: [number, number, number] = [51, 51, 51];
  const lightGray: [number, number, number] = [245, 245, 245];
  const green: [number, number, number] = [34, 197, 94];
  const yellow: [number, number, number] = [251, 191, 36];
  const orange: [number, number, number] = [249, 115, 22];

  // Funzione per aggiungere watermark mongolfiera trasparente
  const addWatermark = () => {
    const watermarkImg = new Image();
    watermarkImg.src = '/remax-balloon.png';
    
    // Watermark centrato, trasparente (opacity 3%), dimensione 150x150
    const watermarkSize = 150;
    const watermarkX = (pageWidth - watermarkSize) / 2;
    const watermarkY = (pageHeight - watermarkSize) / 2;
    
    try {
      doc.setGState((doc as any).GState({ opacity: 0.03 }));
      doc.addImage(watermarkImg, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize);
      doc.setGState((doc as any).GState({ opacity: 1 }));
    } catch (e) {
      console.warn('Watermark non disponibile');
    }
  };

  // ========== PAGINA 1: STIMA E DATI IMMOBILE ==========
  
  addWatermark();

  // Header RE/MAX rosso
  doc.setFillColor(...remaxRed);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('STIMA AUTOMATICA DI MERCATO', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Isola d\'Elba - Analisi Immobiliare', pageWidth / 2, 28, { align: 'center' });

  let yPos = 50;

  // Box dati immobile compatti (2 colonne)
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yPos, pageWidth - 30, 28, 2, 2, 'F');
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Colonna sinistra
  doc.text('Comune:', 20, yPos + 6);
  doc.text('Località:', 20, yPos + 12);
  doc.text('Tipologia:', 20, yPos + 18);
  doc.text('Superficie:', 20, yPos + 24);
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(datiImmobile.comune || '-'), 45, yPos + 6);
  doc.text(String(datiImmobile.localita || '-'), 45, yPos + 12);
  doc.text(String(datiImmobile.tipologia || '-'), 45, yPos + 18);
  doc.text(`${datiImmobile.superficie || 0} mq`, 45, yPos + 24);
  
  // Colonna destra
  doc.setFont('helvetica', 'bold');
  doc.text('Piano:', 110, yPos + 6);
  doc.text('Stato:', 110, yPos + 12);
  doc.text('Vista Mare:', 110, yPos + 18);
  doc.text('Dist. Mare:', 110, yPos + 24);
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(datiImmobile.piano || '-'), 130, yPos + 6);
  doc.text(String(datiImmobile.statoManutenzione || '-'), 130, yPos + 12);
  doc.text(String(datiImmobile.vistaMare || '-'), 130, yPos + 18);
  doc.text(String(datiImmobile.distanzaMare || '-') + ' m', 130, yPos + 24);

  yPos += 38;

  // Box valori stimati - GRANDE E CENTRALE
  doc.setFillColor(...remaxBlue);
  doc.roundedRect(15, yPos, pageWidth - 30, 45, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VALORI STIMATI', pageWidth / 2, yPos + 8, { align: 'center' });
  
  // Range min-max
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`€ ${risultato.valoreMin.toLocaleString('it-IT')}`, 30, yPos + 18);
  doc.text(`€ ${risultato.valoreMax.toLocaleString('it-IT')}`, pageWidth - 30, yPos + 18, { align: 'right' });
  
  // Linea range
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(30, yPos + 22, pageWidth - 30, yPos + 22);
  
  // Valore medio GRANDE
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`€ ${risultato.valoreTotale.toLocaleString('it-IT')}`, pageWidth / 2, yPos + 32, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Valore Medio Stimato', pageWidth / 2, yPos + 39, { align: 'center' });

  yPos += 50;

  // Disclaimer importante - subito sotto i valori
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, yPos, pageWidth - 30, 18, 2, 2, 'FD');
  
  doc.setTextColor(...darkGray);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  const disclaimerText = 'Questa è una stima automatica indicativa basata su dati di mercato. Non sostituisce una valutazione professionale effettuata da un agente immobiliare abilitato.';
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
  doc.text(disclaimerLines, pageWidth / 2, yPos + 6, { align: 'center' });

  yPos += 24;

  // Tabella composizione valore - COMPATTA
  doc.setTextColor(...darkGray);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPOSIZIONE DEL VALORE', 15, yPos);
  yPos += 2;

  autoTable(doc, {
    startY: yPos,
    head: [['Voce', 'Importo']],
    body: [
      ['Valore Base', `€ ${risultato.valoreBase.toLocaleString('it-IT')}`],
      ['Pertinenze', `+ € ${risultato.valorePertinenze.toLocaleString('it-IT')}`],
      ['Valorizzazioni', `+ € ${risultato.valoreValorizzazioni.toLocaleString('it-IT')}`],
    ],
    foot: [['VALORE TOTALE', `€ ${risultato.valoreTotale.toLocaleString('it-IT')}`]],
    theme: 'grid',
    headStyles: {
      fillColor: remaxBlue,
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    footStyles: {
      fillColor: remaxRed,
      fontSize: 10,
      fontStyle: 'bold',
    },
    margin: { left: 15, right: 15 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Competitività mercato
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPETITIVITÀ MERCATO', 15, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Livello: ${risultato.livelloCompetitivita}`, 15, yPos);
  yPos += 5;
  doc.text(`Immobili simili in zona: ${risultato.immobiliSimiliZona}`, 15, yPos);
  yPos += 5;
  doc.text(`Prezzo consigliato: € ${risultato.prezzoConsigliato.toLocaleString('it-IT')}`, 15, yPos);
  yPos += 8;

  // Punti di forza - COMPATTI
  if (risultato.consigli?.puntiForza && risultato.consigli.puntiForza.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PUNTI DI FORZA', 15, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    risultato.consigli.puntiForza.slice(0, 4).forEach((punto: string) => {
      doc.text(`✓ ${punto}`, 20, yPos);
      yPos += 5;
    });
  }

  // Footer Pagina 1
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2025 Francesco Principe - RE/MAX Mindset', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // ========== PAGINA 2: FUNNEL CTA + VALORE AGGIUNTO ==========
  
  doc.addPage();
  addWatermark();

  yPos = 20;

  // Header pagina 2
  doc.setFillColor(...remaxRed);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('IL TUO PROSSIMO PASSO', pageWidth / 2, 20, { align: 'center' });

  yPos = 45;

  // BOX CTA PRINCIPALE - CALCOLATORE TASSE (GRANDE E CENTRALE)
  doc.setFillColor(255, 250, 240);
  doc.setDrawColor(...orange);
  doc.setLineWidth(1);
  doc.roundedRect(20, yPos, pageWidth - 40, 50, 3, 3, 'FD');

  doc.setTextColor(...remaxRed);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('🧮 CALCOLA TASSE E ONERI', pageWidth / 2, yPos + 12, { align: 'center' });

  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const ctaText = 'Scopri quanto dovrai pagare in tasse, imposte e spese notarili. Calcolo gratuito e immediato.';
  const ctaLines = doc.splitTextToSize(ctaText, pageWidth - 60);
  doc.text(ctaLines, pageWidth / 2, yPos + 22, { align: 'center' });

  // Link cliccabile al calcolatore tasse
  doc.setTextColor(...remaxBlue);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const linkText = '👉 CLICCA QUI PER CALCOLARE';
  const linkWidth = doc.getTextWidth(linkText);
  const linkX = (pageWidth - linkWidth) / 2;
  doc.textWithLink(linkText, linkX, yPos + 38, {
    url: 'https://tasseimmob-ttn8lkb9.manus.space/'
  });
  
  // Sottolineatura link
  doc.setDrawColor(...remaxBlue);
  doc.setLineWidth(0.3);
  doc.line(linkX, yPos + 39, linkX + linkWidth, yPos + 39);

  yPos += 60;

  // Sezione "Perché RE/MAX" - BOX CON ICONE
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yPos, pageWidth - 30, 70, 2, 2, 'F');

  doc.setTextColor(...remaxRed);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERCHÉ SCEGLIERE RE/MAX?', pageWidth / 2, yPos + 10, { align: 'center' });

  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const vantaggi = [
    '🏆 Leader mondiale nel settore immobiliare',
    '🌍 Network internazionale per massima visibilità',
    '📸 Marketing professionale (foto, video, virtual tour)',
    '💰 Strategie di pricing basate su dati reali',
    '⚡ Vendita più veloce grazie a tecnologia avanzata',
    '🤝 Assistenza completa dalla stima alla firma',
  ];

  let vantY = yPos + 20;
  vantaggi.forEach((vantaggio) => {
    doc.text(vantaggio, 25, vantY);
    vantY += 8;
  });

  yPos += 80;

  // Box urgenza - ROSSO
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...remaxRed);
  doc.setLineWidth(1);
  doc.roundedRect(15, yPos, pageWidth - 30, 28, 2, 2, 'FD');

  doc.setTextColor(...remaxRed);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('⚡ MERCATO COMPETITIVO - AGISCI ORA', pageWidth / 2, yPos + 10, { align: 'center' });

  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const urgenzaText = `Con ${risultato.immobiliSimiliZona} immobili simili in zona, è fondamentale posizionarsi correttamente e agire velocemente per ottenere il miglior prezzo.`;
  const urgenzaLines = doc.splitTextToSize(urgenzaText, pageWidth - 40);
  doc.text(urgenzaLines, pageWidth / 2, yPos + 18, { align: 'center' });

  yPos += 38;

  // CTA Consulenza - BOX BLU GRANDE
  doc.setFillColor(...remaxBlue);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RICHIEDI CONSULENZA GRATUITA', pageWidth / 2, yPos + 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Contattami per una valutazione professionale completa', pageWidth / 2, yPos + 20, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('📱 WhatsApp: Clicca qui', pageWidth / 2, yPos + 28, { align: 'center' });
  
  // Link WhatsApp cliccabile
  const whatsappLinkWidth = doc.getTextWidth('📱 WhatsApp: Clicca qui');
  const whatsappX = (pageWidth - whatsappLinkWidth) / 2;
  doc.link(whatsappX, yPos + 24, whatsappLinkWidth, 6, {
    url: 'https://wa.me/message/4K6JSOQWVOTRL1'
  });

  // Footer Pagina 2
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2025 Francesco Principe - RE/MAX Mindset', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // ========== PAGINA 3: DISCLAIMER PROFESSIONALE COMPLETO ==========
  
  doc.addPage();
  addWatermark();

  yPos = 20;

  // Header pagina 3
  doc.setFillColor(...darkGray);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTE LEGALI E DISCLAIMER', pageWidth / 2, 20, { align: 'center' });

  yPos = 45;

  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NATURA DELLA STIMA', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const disclaimerNatura = 'Questa stima è generata automaticamente da un algoritmo basato su dati di mercato aggregati e caratteristiche dell\'immobile. Si tratta di una stima indicativa e non vincolante, che non sostituisce in alcun modo una valutazione professionale effettuata da un agente immobiliare abilitato o da un perito qualificato.';
  const naturaLines = doc.splitTextToSize(disclaimerNatura, pageWidth - 30);
  doc.text(naturaLines, 15, yPos);
  yPos += naturaLines.length * 5 + 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('LIMITAZIONI E PRECISAZIONI', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const limitazioni = [
    '• La stima si basa su dati di mercato aggregati e può non riflettere condizioni specifiche dell\'immobile',
    '• Fattori non considerati: stato interno dettagliato, conformità urbanistica, vincoli, situazione legale',
    '• Il valore reale può variare significativamente in base a condizioni di mercato, stagionalità e negoziazione',
    '• La stima non tiene conto di eventuali difetti strutturali, problemi legali o vincoli non dichiarati',
    '• I prezzi di mercato possono variare rapidamente in base a domanda, offerta e condizioni economiche',
  ];

  limitazioni.forEach((limitazione) => {
    const limLines = doc.splitTextToSize(limitazione, pageWidth - 30);
    doc.text(limLines, 15, yPos);
    yPos += limLines.length * 5 + 3;
  });

  yPos += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RACCOMANDAZIONI PROFESSIONALI', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const raccomandazioni = 'Prima di prendere qualsiasi decisione di vendita, acquisto o investimento immobiliare, è fortemente consigliato richiedere una valutazione professionale completa da parte di un agente immobiliare abilitato. Una valutazione professionale include: sopralluogo dettagliato, analisi comparativa di mercato aggiornata, verifica documentale, analisi urbanistica e catastale, strategia di pricing personalizzata.';
  const raccoLines = doc.splitTextToSize(raccomandazioni, pageWidth - 30);
  doc.text(raccoLines, 15, yPos);
  yPos += raccoLines.length * 5 + 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ESCLUSIONE DI RESPONSABILITÀ', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const responsabilita = 'Francesco Principe e RE/MAX Mindset non si assumono alcuna responsabilità per decisioni prese sulla base di questa stima automatica. L\'utilizzatore riconosce di aver compreso la natura indicativa della stima e di non poter avanzare pretese basate esclusivamente su questo documento. Per qualsiasi utilizzo professionale, legale o finanziario, è necessaria una valutazione professionale certificata.';
  const respLines = doc.splitTextToSize(responsabilita, pageWidth - 30);
  doc.text(respLines, 15, yPos);
  yPos += respLines.length * 5 + 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PRIVACY E DATI PERSONALI', 15, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const privacy = 'I dati forniti per la generazione di questa stima sono trattati in conformità al Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati esclusivamente per finalità di contatto commerciale e non saranno ceduti a terzi senza consenso esplicito. Per maggiori informazioni sul trattamento dei dati, contattare francesco.principe@remax.it';
  const privacyLines = doc.splitTextToSize(privacy, pageWidth - 30);
  doc.text(privacyLines, 15, yPos);
  yPos += privacyLines.length * 5 + 10;

  // Box contatti finale
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'F');

  doc.setTextColor(...remaxRed);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTATTI', pageWidth / 2, yPos + 8, { align: 'center' });

  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Francesco Principe - RE/MAX Mindset', pageWidth / 2, yPos + 14, { align: 'center' });
  doc.text('📧 francesco.principe@remax.it', pageWidth / 2, yPos + 19, { align: 'center' });

  // Footer Pagina 3
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('© 2025 Francesco Principe - RE/MAX Mindset', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Documento generato automaticamente - Non ha valore legale', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Salva PDF
  doc.save('stima-immobiliare-elba.pdf');
}
