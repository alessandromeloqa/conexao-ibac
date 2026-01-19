import historicoService from '../services/historicoService.js';
import { gerarHistoricoPDF } from '../services/pdfService.js';

export const getHistoricoPregador = async (req, res) => {
  const { pregadorId } = req.params;

  try {
    const data = await historicoService.getHistoricoPregador(pregadorId);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico do pregador' 
    });
  }
};

export const getHistoricoDetalhado = async (req, res) => {
  const { pregadorId, eventoId } = req.params;

  try {
    const data = await historicoService.getHistoricoDetalhado(pregadorId, eventoId);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar histórico detalhado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar histórico detalhado' 
    });
  }
};

export const getHistoricoPDF = async (req, res) => {
  const { pregadorId } = req.params;

  try {
    const data = await historicoService.getHistoricoPregador(pregadorId);
    
    if (!data.eventos || data.eventos.length === 0) {
      return res.status(404).json({ error: 'Nenhum histórico encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=historico_${data.eventos[0].pregador_nome.replace(/\s+/g, '_')}.pdf`);

    gerarHistoricoPDF(data, res);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getEvolucaoPregador = async (req, res) => {
  const { pregadorId } = req.params;

  try {
    const data = await historicoService.getEvolucaoPregador(pregadorId);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar evolução:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar evolução do pregador' 
    });
  }
};

export const refreshHistorico = async (req, res) => {
  try {
    await historicoService.refreshMaterializedViews();
    res.json({ 
      success: true, 
      message: 'Histórico atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar histórico' 
    });
  }
};
