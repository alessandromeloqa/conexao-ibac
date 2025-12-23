import { describe, it } from 'node:test';
import assert from 'node:assert';
import { gerarDadosCertificado } from '../src/services/pdfService.js';

describe('Certificados PDF', () => {
  
  it('deve gerar dados do certificado corretamente', () => {
    const participacao = {
      pregador_nome: 'João Silva',
      evento_nome: 'Congresso 2024',
      data_evento: '2024-01-15',
      media_geral: '9.50',
      ranking: 1
    };
    
    const dados = gerarDadosCertificado(participacao, 'test-uuid');
    
    assert.strictEqual(dados.pregador_nome, 'João Silva');
    assert.strictEqual(dados.evento_nome, 'Congresso 2024');
    assert.strictEqual(dados.media_final, '9.50');
    assert.strictEqual(dados.ranking, 1);
    assert.strictEqual(dados.codigo_validacao, 'test-uuid');
  });

  it('deve formatar data corretamente', () => {
    const participacao = {
      pregador_nome: 'João',
      evento_nome: 'Evento',
      data_evento: '2024-01-15',
      media_geral: '8.00',
      ranking: 2
    };
    
    const dados = gerarDadosCertificado(participacao);
    
    assert.ok(dados.data_evento.includes('/'));
    assert.match(dados.data_evento, /\d{2}\/\d{2}\/\d{4}/);
  });

  it('deve arredondar média para 2 casas', () => {
    const participacao = {
      pregador_nome: 'João',
      evento_nome: 'Evento',
      data_evento: '2024-01-15',
      media_geral: '8.567',
      ranking: 1
    };
    
    const dados = gerarDadosCertificado(participacao);
    
    assert.strictEqual(dados.media_final, '8.57');
  });

  it('deve gerar UUID se não fornecido', () => {
    const participacao = {
      pregador_nome: 'João',
      evento_nome: 'Evento',
      data_evento: '2024-01-15',
      media_geral: '8.00',
      ranking: 1
    };
    
    const dados = gerarDadosCertificado(participacao);
    
    assert.ok(dados.codigo_validacao);
    assert.strictEqual(typeof dados.codigo_validacao, 'string');
    assert.ok(dados.codigo_validacao.length > 0);
  });
});
