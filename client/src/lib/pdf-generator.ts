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

  // ========== PAGINA 1: STIMA E DATI IMMOBILE (ULTRA-MINIMALISTA) ==========
  
  let y = 20;
  
  // Titolo
  doc.text('STIMA AUTOMATICA DI MERCATO - ISOLA D\'ELBA', 20, y);
  y += 10;
  
  doc.text('Report Valutazione Immobiliare', 20, y);
  y += 15;
  
  // DATI IMMOBILE
  doc.text('DATI IMMOBILE', 20, y);
  y += 8;
  
  doc.text(`Comune: ${datiImmobile.comune || '-'}`, 25, y);
  y += 6;
  doc.text(`Localita: ${datiImmobile.localita || '-'}`, 25, y);
  y += 6;
  doc.text(`Tipologia: ${datiImmobile.tipologia || '-'}`, 25, y);
  y += 6;
  doc.text(`Superficie: ${datiImmobile.superficieAbitabile || 0} mq`, 25, y);
  y += 6;
  doc.text(`Piano: ${datiImmobile.piano || '-'}`, 25, y);
  y += 6;
  doc.text(`Stato: ${datiImmobile.statoManutenzione || '-'}`, 25, y);
  y += 6;
  doc.text(`Vista Mare: ${datiImmobile.vistaMare || 'No'}`, 25, y);
  y += 6;
  doc.text(`Distanza Mare: ${datiImmobile.distanzaMare || '-'} m`, 25, y);
  y += 12;
  
  // VALORI STIMATI
  doc.text('VALORI STIMATI', 20, y);
  y += 8;
  
  doc.text(`Valore Minimo: EUR ${risultato.valoreMin.toLocaleString('it-IT')}`, 25, y);
  y += 6;
  doc.text(`Valore Medio: EUR ${risultato.valoreTotale.toLocaleString('it-IT')}`, 25, y);
  y += 6;
  doc.text(`Valore Massimo: EUR ${risultato.valoreMax.toLocaleString('it-IT')}`, 25, y);
  y += 12;
  
  // DISCLAIMER
  doc.text('DISCLAIMER', 20, y);
  y += 8;
  doc.text('Questa e una stima automatica indicativa basata su dati di mercato', 25, y);
  y += 6;
  doc.text('aggregati. Non sostituisce una valutazione professionale effettuata', 25, y);
  y += 6;
  doc.text('da un agente immobiliare abilitato.', 25, y);
  y += 12;
  
  // COMPOSIZIONE VALORE
  doc.text('COMPOSIZIONE VALORE', 20, y);
  y += 8;
  doc.text(`Valore Base: EUR ${risultato.valoreBase.toLocaleString('it-IT')}`, 25, y);
  y += 6;
  doc.text(`Pertinenze: EUR ${risultato.valorePertinenze.toLocaleString('it-IT')}`, 25, y);
  y += 6;
  doc.text(`Valorizzazioni: EUR ${risultato.valoreValorizzazioni.toLocaleString('it-IT')}`, 25, y);
  y += 6;
  doc.text(`Totale: EUR ${risultato.valoreTotale.toLocaleString('it-IT')}`, 25, y);
  y += 12;
  
  // Rimossa sezione COMPETITIVITA (campi non disponibili in RisultatoValutazione)
  
  // PUNTI DI FORZA
  if (risultato.consigli.puntiForza && risultato.consigli.puntiForza.length > 0) {
    doc.text('PUNTI DI FORZA', 20, y);
    y += 8;
    risultato.consigli.puntiForza.forEach((punto: string) => {
      doc.text(`* ${punto}`, 25, y);
      y += 6;
    });
  }

  // ========== PAGINA 2: FUNNEL CTA ==========
  doc.addPage();
  y = 20;
  
  doc.text('IL TUO PROSSIMO PASSO', pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // CTA CALCOLATORE TASSE
  doc.text('>> CALCOLA TASSE E ONERI', 20, y);
  y += 8;
  doc.text('Scopri quanto dovrai pagare in tasse, imposte e spese notarili.', 20, y);
  y += 6;
  doc.text('Calcolo gratuito e immediato.', 20, y);
  y += 10;
  doc.textWithLink('>> CLICCA QUI PER CALCOLARE', 20, y, { url: 'https://tasseimmob-ttn8lkb9.manus.space/' });
  y += 15;
  
  // PERCHE RE/MAX
  doc.text('PERCHE SCEGLIERE RE/MAX?', 20, y);
  y += 8;
  doc.text('* Leader mondiale nel settore immobiliare', 25, y);
  y += 6;
  doc.text('* Network internazionale per massima visibilita', 25, y);
  y += 6;
  doc.text('* Marketing professionale (foto, video, virtual tour)', 25, y);
  y += 6;
  doc.text('* Strategie di pricing basate su dati reali', 25, y);
  y += 6;
  doc.text('* Vendita piu veloce grazie a tecnologia avanzata', 25, y);
  y += 6;
  doc.text('* Assistenza completa dalla stima alla firma', 25, y);
  y += 15;
  
  // URGENZA MERCATO
  doc.text('MERCATO COMPETITIVO - AGISCI ORA', 20, y);
  y += 8;
  doc.text('Attenzione: Diversi immobili simili sono attualmente in vendita', 20, y);
  y += 6;
  doc.text('nella stessa zona. Un prezzo competitivo e una strategia di marketing', 20, y);
  y += 6;
  doc.text('efficace sono fondamentali per vendere velocemente al miglior prezzo.', 20, y);
  y += 15;
  
  // CTA CONSULENZA
  doc.text('RICHIEDI CONSULENZA GRATUITA', 20, y);
  y += 8;
  doc.text('Contattami per una valutazione professionale completa', 20, y);
  y += 10;
  doc.textWithLink('WhatsApp: Clicca qui', 20, y, { url: 'https://wa.me/message/4K6JSOQWVOTRL1' });
  
  // ========== PAGINA 3: DISCLAIMER PROFESSIONALE ==========
  doc.addPage();
  y = 20;
  
  doc.text('NOTE LEGALI E DISCLAIMER', pageWidth / 2, y, { align: 'center' });
  y += 15;
  
  // NATURA DELLA STIMA
  doc.text('NATURA DELLA STIMA', 20, y);
  y += 8;
  doc.text('Questa stima e generata automaticamente da un algoritmo basato su dati', 20, y);
  y += 6;
  doc.text('di mercato aggregati e caratteristiche dell\'immobile. Si tratta di una', 20, y);
  y += 6;
  doc.text('stima indicativa e non vincolante, che non sostituisce in alcun modo una', 20, y);
  y += 6;
  doc.text('valutazione professionale effettuata da un agente immobiliare abilitato', 20, y);
  y += 6;
  doc.text('o da un perito qualificato.', 20, y);
  y += 12;
  
  // LIMITAZIONI E PRECISAZIONI
  doc.text('LIMITAZIONI E PRECISAZIONI', 20, y);
  y += 8;
  doc.text('* La stima si basa su dati di mercato aggregati e puo non riflettere', 20, y);
  y += 6;
  doc.text('  condizioni specifiche dell\'immobile', 20, y);
  y += 6;
  doc.text('* Fattori non considerati: stato interno dettagliato, conformita', 20, y);
  y += 6;
  doc.text('  urbanistica, vincoli, situazione legale', 20, y);
  y += 6;
  doc.text('* Il valore reale puo variare significativamente in base a condizioni', 20, y);
  y += 6;
  doc.text('  di mercato, stagionalita e negoziazione', 20, y);
  y += 6;
  doc.text('* La stima non tiene conto di eventuali difetti strutturali, problemi', 20, y);
  y += 6;
  doc.text('  legali o vincoli non dichiarati', 20, y);
  y += 6;
  doc.text('* I prezzi di mercato possono variare rapidamente in base a domanda,', 20, y);
  y += 6;
  doc.text('  offerta e condizioni economiche', 20, y);
  y += 12;
  
  // RACCOMANDAZIONI PROFESSIONALI
  doc.text('RACCOMANDAZIONI PROFESSIONALI', 20, y);
  y += 8;
  doc.text('Prima di prendere qualsiasi decisione di vendita, acquisto o investimento', 20, y);
  y += 6;
  doc.text('immobiliare, e fortemente consigliato richiedere una valutazione', 20, y);
  y += 6;
  doc.text('professionale completa da parte di un agente immobiliare abilitato. La', 20, y);
  y += 6;
  doc.text('valutazione professionale include: sopralluogo dettagliato, analisi', 20, y);
  y += 6;
  doc.text('comparativa di mercato aggiornata, verifica documentale, analisi', 20, y);
  y += 6;
  doc.text('urbanistica e catastale, strategia di pricing personalizzata.', 20, y);
  y += 12;
  
  // ESCLUSIONE DI RESPONSABILITA
  doc.text('ESCLUSIONE DI RESPONSABILITA', 20, y);
  y += 8;
  doc.text('Francesco Principe e RE/MAX Mindset non si assumono alcuna responsabilita', 20, y);
  y += 6;
  doc.text('per decisioni prese sulla base di questa stima automatica. L\'utilizzatore', 20, y);
  y += 6;
  doc.text('riconosce di aver compreso la natura indicativa della stima e di non', 20, y);
  y += 6;
  doc.text('poter avanzare pretese basate esclusivamente su questo documento. Per', 20, y);
  y += 6;
  doc.text('qualsiasi utilizzo professionale, legale o finanziario, e necessaria una', 20, y);
  y += 6;
  doc.text('valutazione professionale certificata.', 20, y);
  y += 12;
  
  // PRIVACY E DATI PERSONALI
  doc.text('PRIVACY E DATI PERSONALI', 20, y);
  y += 8;
  doc.text('I dati forniti per la generazione di questa stima sono trattati in', 20, y);
  y += 6;
  doc.text('conformita al Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati', 20, y);
  y += 6;
  doc.text('esclusivamente per finalita di contatto commerciale e non saranno ceduti', 20, y);
  y += 6;
  doc.text('a terzi senza consenso esplicito. Per maggiori informazioni sul', 20, y);
  y += 6;
  doc.text('trattamento dei dati, contattare francesco.principe@remax.it', 20, y);
  y += 15;
  
  // CONTATTI FINALI
  doc.text('CONTATTI', 20, y);
  y += 8;
  doc.text('Francesco Principe - RE/MAX Mindset', 20, y);
  y += 6;
  doc.text('Email: francesco.principe@remax.it', 20, y);
  
  // Footer
  doc.text('(c) 2025 Francesco Principe - RE/MAX Mindset', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text('Documento generato automaticamente - Non ha valore legale', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Salva PDF
  doc.save('stima-immobiliare-elba.pdf');
}
