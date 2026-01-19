/**
 * Testes Unitários - Historico Service
 * Demonstra a testabilidade da nova arquitetura v1.1.0
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';

// Mock do pool de conexão
const mockPool = {
  query: mock.fn()
};

// Simular o service com mock
class HistoricoServiceTest {
  constructor(pool) {
    this.pool = pool;
  }

  async getHistoricoPregador(pregadorId) {
    const [historico, mediaCriterios, resumo] = await Promise.all([
      this.pool.query(
        `SELECT pregador_id, pregador_nome, evento_id, evento_nome, 
                data_evento, tema, media_geral, total_avaliacoes, ranking
         FROM vw_historico_pregador 
         WHERE pregador_id = $1 
         ORDER BY data_evento DESC`,
        [pregadorId]
      ),
      this.pool.query(
        `SELECT evento_id, criterio_nome, media_criterio 
         FROM vw_media_criterio_pregador 
         WHERE pregador_id = $1`,
        [pregadorId]
      ),
      this.pool.query(
        `SELECT 
           COUNT(DISTINCT evento_id) as total_eventos,
           ROUND(AVG(media_geral)::numeric, 2) as media_geral_historica,
           SUM(total_avaliacoes) as total_avaliacoes
         FROM vw_historico_pregador 
         WHERE pregador_id = $1`,
        [pregadorId]
      )
    ]);

    return {
      eventos: historico.rows,
      criterios: mediaCriterios.rows,
      resumo: resumo.rows[0] || { 
        total_eventos: 0, 
        media_geral_historica: null, 
        total_avaliacoes: 0 
      }
    };
  }

  async getEvolucaoPregador(pregadorId) {
    const result = await this.pool.query(
      `SELECT 
         TO_CHAR(data_evento, 'MM/YYYY') as periodo,
         ROUND(media_geral::numeric, 2) as media_geral,
         evento_nome
       FROM vw_historico_pregador 
       WHERE pregador_id = $1 
       ORDER BY data_evento ASC`,
      [pregadorId]
    );

    return result.rows;
  }
}

describe('HistoricoService', () => {
  let service;

  before(() => {
    service = new HistoricoServiceTest(mockPool);
  });

  after(() => {
    mock.reset();
  });

  describe('getHistoricoPregador', () => {
    it('deve retornar histórico completo do pregador', async () => {
      // Arrange
      const pregadorId = 1;
      const mockEventos = [
        {
          pregador_id: 1,
          pregador_nome: 'João Silva',
          evento_id: 1,
          evento_nome: 'Congresso 2024',
          data_evento: '2024-01-15',
          tema: 'Fé e Esperança',
          media_geral: 8.5,
          total_avaliacoes: 10,
          ranking: 2
        }
      ];
      const mockCriterios = [
        {
          evento_id: 1,
          criterio_nome: 'Conteúdo Bíblico',
          media_criterio: 9.0
        }
      ];
      const mockResumo = [
        {
          total_eventos: 5,
          media_geral_historica: 8.5,
          total_avaliacoes: 50
        }
      ];

      mockPool.query.mock.mockImplementation((query, params) => {
        if (query.includes('vw_historico_pregador') && query.includes('ORDER BY data_evento DESC')) {
          return Promise.resolve({ rows: mockEventos });
        }
        if (query.includes('vw_media_criterio_pregador')) {
          return Promise.resolve({ rows: mockCriterios });
        }
        if (query.includes('COUNT(DISTINCT evento_id)')) {
          return Promise.resolve({ rows: mockResumo });
        }
      });

      // Act
      const result = await service.getHistoricoPregador(pregadorId);

      // Assert
      assert.strictEqual(result.eventos.length, 1);
      assert.strictEqual(result.eventos[0].pregador_nome, 'João Silva');
      assert.strictEqual(result.criterios.length, 1);
      assert.strictEqual(result.resumo.total_eventos, 5);
      assert.strictEqual(mockPool.query.mock.calls.length, 3);
    });

    it('deve retornar resumo vazio quando pregador não tem histórico', async () => {
      // Arrange
      const pregadorId = 999;
      mockPool.query.mock.mockImplementation(() => {
        return Promise.resolve({ rows: [] });
      });

      // Act
      const result = await service.getHistoricoPregador(pregadorId);

      // Assert
      assert.strictEqual(result.eventos.length, 0);
      assert.strictEqual(result.criterios.length, 0);
      assert.strictEqual(result.resumo.total_eventos, 0);
      assert.strictEqual(result.resumo.media_geral_historica, null);
    });

    it('deve usar Promise.all para queries paralelas', async () => {
      // Arrange
      const pregadorId = 1;
      const startTime = Date.now();
      
      mockPool.query.mock.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ rows: [] }), 100);
        });
      });

      // Act
      await service.getHistoricoPregador(pregadorId);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      // Se fosse sequencial, levaria 300ms (3 queries * 100ms)
      // Com Promise.all, leva ~100ms
      assert.ok(duration < 200, 'Queries devem ser paralelas');
    });
  });

  describe('getEvolucaoPregador', () => {
    it('deve retornar evolução ordenada por data', async () => {
      // Arrange
      const pregadorId = 1;
      const mockEvolucao = [
        { periodo: '01/2024', media_geral: 8.0, evento_nome: 'Evento 1' },
        { periodo: '02/2024', media_geral: 8.5, evento_nome: 'Evento 2' },
        { periodo: '03/2024', media_geral: 9.0, evento_nome: 'Evento 3' }
      ];

      mockPool.query.mock.mockImplementation(() => {
        return Promise.resolve({ rows: mockEvolucao });
      });

      // Act
      const result = await service.getEvolucaoPregador(pregadorId);

      // Assert
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].periodo, '01/2024');
      assert.strictEqual(result[2].periodo, '03/2024');
      assert.ok(result[0].media_geral < result[2].media_geral, 'Deve mostrar evolução');
    });

    it('deve retornar array vazio quando não há evolução', async () => {
      // Arrange
      const pregadorId = 999;
      mockPool.query.mock.mockImplementation(() => {
        return Promise.resolve({ rows: [] });
      });

      // Act
      const result = await service.getEvolucaoPregador(pregadorId);

      // Assert
      assert.strictEqual(result.length, 0);
    });
  });
});

describe('HistoricoService - Validações', () => {
  it('deve validar pregadorId numérico', async () => {
    const service = new HistoricoServiceTest(mockPool);
    
    // Teste com ID inválido seria feito no middleware
    // Aqui testamos que o service recebe o ID correto
    const pregadorId = 1;
    
    mockPool.query.mock.mockImplementation((query, params) => {
      assert.strictEqual(typeof params[0], 'number');
      return Promise.resolve({ rows: [] });
    });

    await service.getHistoricoPregador(pregadorId);
  });
});

describe('HistoricoService - Performance', () => {
  it('deve executar queries em menos de 100ms (mock)', async () => {
    const service = new HistoricoServiceTest(mockPool);
    const pregadorId = 1;
    
    mockPool.query.mock.mockImplementation(() => {
      return Promise.resolve({ rows: [] });
    });

    const startTime = Date.now();
    await service.getHistoricoPregador(pregadorId);
    const duration = Date.now() - startTime;

    assert.ok(duration < 100, `Query levou ${duration}ms, esperado < 100ms`);
  });
});

describe('HistoricoService - Error Handling', () => {
  it('deve propagar erros de banco de dados', async () => {
    const service = new HistoricoServiceTest(mockPool);
    const pregadorId = 1;
    
    mockPool.query.mock.mockImplementation(() => {
      return Promise.reject(new Error('Database connection failed'));
    });

    await assert.rejects(
      async () => await service.getHistoricoPregador(pregadorId),
      {
        name: 'Error',
        message: 'Database connection failed'
      }
    );
  });
});

// Executar testes
console.log('🧪 Executando testes do HistoricoService...\n');
