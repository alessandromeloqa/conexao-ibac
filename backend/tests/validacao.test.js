import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Validações Obrigatórias', () => {
  
  it('deve validar nota entre 0 e 10', () => {
    const validarNota = (nota) => nota >= 0 && nota <= 10;
    
    assert.strictEqual(validarNota(5), true);
    assert.strictEqual(validarNota(0), true);
    assert.strictEqual(validarNota(10), true);
    assert.strictEqual(validarNota(-1), false);
    assert.strictEqual(validarNota(11), false);
  });

  it('deve validar incremento de 0.5', () => {
    const validarIncremento = (nota) => nota % 0.5 === 0;
    
    assert.strictEqual(validarIncremento(5.0), true);
    assert.strictEqual(validarIncremento(5.5), true);
    assert.strictEqual(validarIncremento(5.3), false);
    assert.strictEqual(validarIncremento(5.7), false);
  });

  it('deve validar campos obrigatórios', () => {
    const validarCampos = (data) => {
      return data.participacao_id && 
             data.criterio_id && 
             data.nota !== undefined && 
             data.avaliador_nome;
    };
    
    const valido = {
      participacao_id: 1,
      criterio_id: 2,
      nota: 8.5,
      avaliador_nome: 'João'
    };
    
    const invalido = {
      participacao_id: 1,
      criterio_id: 2,
      nota: 8.5
    };
    
    assert.strictEqual(validarCampos(valido), true);
    assert.strictEqual(validarCampos(invalido), false);
  });

  it('deve rejeitar campos vazios', () => {
    const validarVazio = (valor) => {
      if (typeof valor === 'string') {
        return valor.trim() !== '';
      }
      return valor !== null && valor !== undefined;
    };
    
    assert.strictEqual(validarVazio('João'), true);
    assert.strictEqual(validarVazio(''), false);
    assert.strictEqual(validarVazio('  '), false);
    assert.strictEqual(validarVazio(null), false);
  });
});
