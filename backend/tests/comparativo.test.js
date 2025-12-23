import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Comparativo Entre Eventos', () => {
  
  it('deve calcular média por evento', () => {
    const avaliacoes = [
      { evento_id: 1, nota: 8.0 },
      { evento_id: 1, nota: 9.0 },
      { evento_id: 1, nota: 7.5 }
    ];
    
    const soma = avaliacoes.reduce((acc, a) => acc + a.nota, 0);
    const media = soma / avaliacoes.length;
    
    assert.strictEqual(media, 8.166666666666666);
    assert.strictEqual(parseFloat(media.toFixed(2)), 8.17);
  });

  it('deve comparar médias de múltiplos eventos', () => {
    const eventos = [
      { id: 1, nome: 'Evento A', media: 8.5 },
      { id: 2, nome: 'Evento B', media: 9.0 },
      { id: 3, nome: 'Evento C', media: 7.8 }
    ];
    
    const ordenados = eventos.sort((a, b) => b.media - a.media);
    
    assert.strictEqual(ordenados[0].nome, 'Evento B');
    assert.strictEqual(ordenados[1].nome, 'Evento A');
    assert.strictEqual(ordenados[2].nome, 'Evento C');
  });

  it('deve calcular diferença entre eventos', () => {
    const evento1 = { media: 8.5 };
    const evento2 = { media: 9.0 };
    
    const diferenca = evento2.media - evento1.media;
    
    assert.strictEqual(diferenca, 0.5);
  });

  it('deve filtrar eventos por período', () => {
    const eventos = [
      { id: 1, data_evento: new Date('2024-01-15') },
      { id: 2, data_evento: new Date('2024-03-20') },
      { id: 3, data_evento: new Date('2024-06-10') }
    ];
    
    const dataInicio = new Date('2024-02-01');
    const dataFim = new Date('2024-05-31');
    
    const filtrados = eventos.filter(e => 
      e.data_evento >= dataInicio && e.data_evento <= dataFim
    );
    
    assert.strictEqual(filtrados.length, 1);
    assert.strictEqual(filtrados[0].id, 2);
  });

  it('deve agrupar médias por critério', () => {
    const avaliacoes = [
      { criterio_id: 1, nota: 8.0 },
      { criterio_id: 1, nota: 9.0 },
      { criterio_id: 2, nota: 7.5 },
      { criterio_id: 2, nota: 8.5 }
    ];
    
    const porCriterio = avaliacoes.reduce((acc, a) => {
      if (!acc[a.criterio_id]) acc[a.criterio_id] = [];
      acc[a.criterio_id].push(a.nota);
      return acc;
    }, {});
    
    assert.strictEqual(porCriterio[1].length, 2);
    assert.strictEqual(porCriterio[2].length, 2);
  });
});
