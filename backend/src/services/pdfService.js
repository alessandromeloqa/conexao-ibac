import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

export function gerarCertificado(dados, stream) {
  const doc = new PDFDocument({ 
    size: 'A4', 
    layout: 'landscape', 
    margin: 50,
    bufferPages: true,
    autoFirstPage: true
  });
  
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const centerX = pageWidth / 2;

  // Borda
  doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();
  doc.rect(35, 35, pageWidth - 70, pageHeight - 70).stroke();

  // Título
  doc.fontSize(32).font('Helvetica-Bold')
     .text('CERTIFICADO', 0, 100, { align: 'center', width: pageWidth });

  // Texto principal
  doc.fontSize(16).font('Helvetica')
     .text('Certificamos que', 0, 180, { align: 'center', width: pageWidth });

  doc.fontSize(24).font('Helvetica-Bold')
     .text(dados.pregador_nome, 0, 220, { align: 'center', width: pageWidth });

  doc.fontSize(14).font('Helvetica')
     .text(`participou do evento "${dados.evento_nome}"`, 0, 270, { align: 'center', width: pageWidth })
     .text(`realizado em ${dados.data_evento}`, 0, 295, { align: 'center', width: pageWidth });

  // Desempenho
  doc.fontSize(16).font('Helvetica-Bold')
     .text('Desempenho', 0, 350, { align: 'center', width: pageWidth });

  doc.fontSize(14).font('Helvetica')
     .text(`Média Final: ${dados.media_final}`, 0, 380, { align: 'center', width: pageWidth })
     .text(`Classificação: ${dados.ranking}º lugar`, 0, 405, { align: 'center', width: pageWidth });

  // Código de validação
  doc.fontSize(10).font('Helvetica')
     .text(`Código de Validação: ${dados.codigo_validacao}`, 0, pageHeight - 80, { align: 'center', width: pageWidth });

  doc.end();
}

export function gerarDadosCertificado(participacao, codigo = null) {
  return {
    pregador_nome: participacao.pregador_nome,
    evento_nome: participacao.evento_nome,
    data_evento: new Date(participacao.data_evento).toLocaleDateString('pt-BR'),
    media_final: parseFloat(participacao.media_geral).toFixed(2),
    ranking: participacao.ranking,
    codigo_validacao: codigo || uuidv4()
  };
}
