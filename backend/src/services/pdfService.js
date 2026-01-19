import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.join(__dirname, 'assets', 'logo.png');

async function adicionarCabecalho(doc, titulo, subtitulo = null) {
  const pageWidth = doc.page.width;
  
  console.log('Logo path:', LOGO_PATH);
  console.log('Logo exists:', fs.existsSync(LOGO_PATH));
  
  try {
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, (pageWidth - 80) / 2, 40, { width: 80 });
      console.log('Logo adicionado com sucesso');
    } else {
      console.error('Logo não encontrado em:', LOGO_PATH);
    }
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }

  doc.fontSize(20).font('Helvetica-Bold')
     .text(titulo, 0, 140, { align: 'center', width: pageWidth });

  if (subtitulo) {
    doc.fontSize(14).font('Helvetica-Bold')
       .text(subtitulo, 0, 170, { align: 'center', width: pageWidth });
  }
}

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

  doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();
  doc.rect(35, 35, pageWidth - 70, pageHeight - 70).stroke();

  doc.fontSize(32).font('Helvetica-Bold')
     .text('CERTIFICADO', 0, 100, { align: 'center', width: pageWidth });

  doc.fontSize(16).font('Helvetica')
     .text('Certificamos que', 0, 180, { align: 'center', width: pageWidth });

  doc.fontSize(24).font('Helvetica-Bold')
     .text(dados.pregador_nome, 0, 220, { align: 'center', width: pageWidth });

  doc.fontSize(14).font('Helvetica')
     .text(`participou do evento "${dados.evento_nome}"`, 0, 270, { align: 'center', width: pageWidth })
     .text(`realizado em ${dados.data_evento}`, 0, 295, { align: 'center', width: pageWidth });

  doc.fontSize(16).font('Helvetica-Bold')
     .text('Desempenho', 0, 350, { align: 'center', width: pageWidth });

  doc.fontSize(14).font('Helvetica')
     .text(`Média Final: ${dados.media_final}`, 0, 380, { align: 'center', width: pageWidth })
     .text(`Classificação: ${dados.ranking}º lugar`, 0, 405, { align: 'center', width: pageWidth });

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

export async function gerarRankingPDF(dados, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  doc.pipe(stream);

  await adicionarCabecalho(doc, '🏆 Ranking - Conexão IBAC', dados.evento.nome);

  const pageWidth = doc.page.width;
  
  doc.fontSize(12).font('Helvetica')
     .text(new Date(dados.evento.data_evento).toLocaleDateString('pt-BR', {
       day: '2-digit',
       month: 'long',
       year: 'numeric'
     }), 0, 195, { align: 'center', width: pageWidth });

  const tableTop = 230;
  const colWidths = [60, 300, 80];
  const rowHeight = 25;

  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Posição', 50, tableTop);
  doc.text('Pregador', 50 + colWidths[0], tableTop);
  doc.text('Média', 50 + colWidths[0] + colWidths[1], tableTop);

  doc.moveTo(50, tableTop + 18).lineTo(pageWidth - 50, tableTop + 18).stroke();

  let yPosition = tableTop + 25;

  dados.ranking.forEach((item, index) => {
    if (yPosition > doc.page.height - 80) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(11).font('Helvetica');
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
    doc.text(`${emoji} ${item.posicao}º`, 50, yPosition);
    doc.text(item.pregador, 50 + colWidths[0], yPosition, { width: colWidths[1] - 10 });
    doc.text(parseFloat(item.media).toFixed(2), 50 + colWidths[0] + colWidths[1], yPosition);

    yPosition += rowHeight;
  });

  doc.end();
}

export async function gerarHistoricoPDF(dados, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  doc.pipe(stream);

  await adicionarCabecalho(doc, 'Histórico Individual do Pregador', dados.eventos[0].pregador_nome);

  const pageWidth = doc.page.width;
  const resumo = dados.resumo;
  
  doc.fontSize(11).font('Helvetica')
     .text(`Total de Eventos: ${resumo.total_eventos}`, 50, 200)
     .text(`Média Geral: ${parseFloat(resumo.media_geral_historica || 0).toFixed(2)}`, 250, 200)
     .text(`Total de Avaliações: ${resumo.total_avaliacoes}`, 400, 200);

  let yPosition = 240;

  dados.eventos.forEach((evento, index) => {
    if (yPosition > doc.page.height - 120) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(12).font('Helvetica-Bold')
       .text(`${index + 1}. ${evento.evento_nome}`, 50, yPosition);
    
    yPosition += 20;

    doc.fontSize(10).font('Helvetica')
       .text(`Data: ${new Date(evento.data_evento).toLocaleDateString('pt-BR')}`, 60, yPosition)
       .text(`Tema: ${evento.tema || 'N/A'}`, 60, yPosition + 15)
       .text(`Média: ${parseFloat(evento.media_geral).toFixed(2)}`, 60, yPosition + 30)
       .text(`Ranking: ${evento.ranking}º lugar`, 250, yPosition + 30)
       .text(`Avaliações: ${evento.total_avaliacoes}`, 400, yPosition + 30);

    yPosition += 60;

    const criteriosEvento = dados.criterios.filter(c => c.evento_id === evento.evento_id);
    if (criteriosEvento.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold')
         .text('Médias por Critério:', 60, yPosition);
      yPosition += 15;

      criteriosEvento.forEach(c => {
        if (yPosition > doc.page.height - 80) {
          doc.addPage();
          yPosition = 50;
        }
        doc.fontSize(9).font('Helvetica')
           .text(`• ${c.criterio_nome}: ${parseFloat(c.media_criterio).toFixed(2)}`, 70, yPosition);
        yPosition += 12;
      });
    }

    yPosition += 10;
    if (yPosition < doc.page.height - 80) {
      doc.moveTo(50, yPosition).lineTo(pageWidth - 50, yPosition).stroke();
      yPosition += 15;
    }
  });

  doc.end();
}

export async function gerarRelatorioGeralPDF(dados, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  doc.pipe(stream);

  const eventoNome = dados.length > 0 ? dados[0].evento_nome : 'Todos os Eventos';
  await adicionarCabecalho(doc, 'Relatório Geral de Avaliações', eventoNome);

  const pageWidth = doc.page.width;
  let yPosition = 210;

  dados.forEach((pregador, index) => {
    if (yPosition > doc.page.height - 180) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(14).font('Helvetica-Bold')
       .text(`${index + 1}. ${pregador.pregador_nome}`, 50, yPosition);
    
    yPosition += 25;

    doc.fontSize(10).font('Helvetica')
       .text(`Data: ${new Date(pregador.data_evento).toLocaleDateString('pt-BR')}`, 60, yPosition)
       .text(`Média Final: ${parseFloat(pregador.media_geral).toFixed(2)}`, 60, yPosition + 15)
       .text(`Ranking: ${pregador.ranking}º lugar`, 250, yPosition + 15)
       .text(`Avaliações: ${pregador.total_avaliacoes}`, 400, yPosition + 15);

    yPosition += 45;

    if (pregador.detalhes && pregador.detalhes.length > 0) {
      doc.fontSize(9).font('Helvetica-Bold')
         .text('Detalhes por Critério:', 60, yPosition);
      yPosition += 15;

      const criteriosAgrupados = {};
      pregador.detalhes.forEach(d => {
        if (!criteriosAgrupados[d.criterio_nome]) {
          criteriosAgrupados[d.criterio_nome] = [];
        }
        criteriosAgrupados[d.criterio_nome].push(d);
      });

      Object.keys(criteriosAgrupados).forEach(criterio => {
        if (yPosition > doc.page.height - 80) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(9).font('Helvetica-Bold')
           .text(`${criterio}:`, 70, yPosition);
        yPosition += 12;

        criteriosAgrupados[criterio].forEach(avaliacao => {
          if (yPosition > doc.page.height - 80) {
            doc.addPage();
            yPosition = 50;
          }
          doc.fontSize(8).font('Helvetica')
             .text(`  • ${avaliacao.avaliador_nome}: ${parseFloat(avaliacao.nota).toFixed(2)}`, 75, yPosition);
          yPosition += 10;
        });

        const media = criteriosAgrupados[criterio].reduce((sum, a) => sum + parseFloat(a.nota), 0) / criteriosAgrupados[criterio].length;
        doc.fontSize(8).font('Helvetica-Bold')
           .text(`  Média: ${media.toFixed(2)}`, 75, yPosition);
        yPosition += 15;
      });
    }

    yPosition += 5;
    if (yPosition < doc.page.height - 80) {
      doc.moveTo(50, yPosition).lineTo(pageWidth - 50, yPosition).stroke();
      yPosition += 15;
    }
  });

  doc.end();
}

export async function gerarRelatorioCandidatoPDF(dados, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
  doc.pipe(stream);

  await adicionarCabecalho(doc, 'Relatório Detalhado do Candidato', dados.pregador_nome);

  const pageWidth = doc.page.width;
  
  doc.fontSize(12).font('Helvetica')
     .text(dados.evento_nome, 0, 195, { align: 'center', width: pageWidth })
     .text(new Date(dados.data_evento).toLocaleDateString('pt-BR'), 0, 215, { align: 'center', width: pageWidth });

  doc.fontSize(11).font('Helvetica')
     .text(`Média Final: ${parseFloat(dados.media_geral).toFixed(2)}`, 50, 250)
     .text(`Ranking: ${dados.ranking}º lugar`, 250, 250)
     .text(`Total de Avaliações: ${dados.total_avaliacoes}`, 400, 250);

  let yPosition = 290;

  doc.fontSize(14).font('Helvetica-Bold')
     .text('Detalhes por Critério', 50, yPosition);
  
  yPosition += 25;

  const criteriosAgrupados = {};
  dados.detalhes.forEach(d => {
    if (!criteriosAgrupados[d.criterio_nome]) {
      criteriosAgrupados[d.criterio_nome] = [];
    }
    criteriosAgrupados[d.criterio_nome].push(d);
  });

  Object.keys(criteriosAgrupados).forEach(criterio => {
    if (yPosition > doc.page.height - 120) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(12).font('Helvetica-Bold')
       .text(criterio, 50, yPosition);
    yPosition += 20;

    criteriosAgrupados[criterio].forEach(avaliacao => {
      if (yPosition > doc.page.height - 80) {
        doc.addPage();
        yPosition = 50;
      }
      doc.fontSize(10).font('Helvetica')
         .text(`• ${avaliacao.avaliador_nome}: ${parseFloat(avaliacao.nota).toFixed(2)}`, 60, yPosition);
      yPosition += 15;
    });

    const media = criteriosAgrupados[criterio].reduce((sum, a) => sum + parseFloat(a.nota), 0) / criteriosAgrupados[criterio].length;
    doc.fontSize(10).font('Helvetica-Bold')
       .text(`Média: ${media.toFixed(2)}`, 60, yPosition);
    yPosition += 25;
  });

  doc.end();
}
