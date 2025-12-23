import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Critérios Dinâmicos', () => {
  
  it('deve filtrar apenas critérios ativos', () => {
    const criterios = [
      { id: 1, nome: 'Conteúdo', ativo: true },
      { id: 2, nome: 'Clareza', ativo: false },
      { id: 3, nome: 'Dicção', ativo: true }
    ];
    
    const ativos = criterios.filter(c => c.ativo);
    
    assert.strictEqual(ativos.length, 2);
    assert.strictEqual(ativos[0].id, 1);
    assert.strictEqual(ativos[1].id, 3);
  });

  it('deve ordenar critérios por ordem', () => {
    const criterios = [
      { id: 1, nome: 'C', ordem: 2 },
      { id: 2, nome: 'A', ordem: 0 },
      { id: 3, nome: 'B', ordem: 1 }
    ];
    
    const ordenados = criterios.sort((a, b) => a.ordem - b.ordem);
    
    assert.strictEqual(ordenados[0].nome, 'A');
    assert.strictEqual(ordenados[1].nome, 'B');
    assert.strictEqual(ordenados[2].nome, 'C');
  });

  it('deve vincular critérios ao evento', () => {
    const eventoCriterios = new Map();
    const eventoId = 1;
    const criterioIds = [1, 3, 5];
    
    eventoCriterios.set(eventoId, criterioIds);
    
    assert.ok(eventoCriterios.has(eventoId));
    assert.deepStrictEqual(eventoCriterios.get(eventoId), [1, 3, 5]);
  });

  it('deve preservar critérios de eventos antigos', () => {
    const eventoCriterios = new Map();
    eventoCriterios.set(1, [1, 2, 3]);
    eventoCriterios.set(2, [1, 2, 4, 5]);
    
    const criteriosEvento1 = eventoCriterios.get(1);
    const criteriosEvento2 = eventoCriterios.get(2);
    
    assert.notDeepStrictEqual(criteriosEvento1, criteriosEvento2);
    assert.strictEqual(criteriosEvento1.length, 3);
    assert.strictEqual(criteriosEvento2.length, 4);
  });

  it('deve validar peso do critério', () => {
    const validarPeso = (peso) => peso >= 0 && peso <= 10;
    
    assert.strictEqual(validarPeso(1.0), true);
    assert.strictEqual(validarPeso(0), true);
    assert.strictEqual(validarPeso(2.5), true);
    assert.strictEqual(validarPeso(-1), false);
    assert.strictEqual(validarPeso(11), false);
  });
});
