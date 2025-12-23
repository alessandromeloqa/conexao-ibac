# Checklist de Aceite - Conexão IBAC

## 1. Histórico Individual do Pregador

### Funcionalidades
- [ ] Listagem de todos os eventos do pregador
- [ ] Exibição da média final por evento
- [ ] Exibição da média por critério
- [ ] Exibição do ranking obtido em cada evento
- [ ] Exibição do total de avaliações recebidas
- [ ] Gráfico de evolução temporal funcionando
- [ ] Tabela detalhada por evento
- [ ] Dados em modo somente leitura

### Testes
- [ ] Selecionar pregador e visualizar histórico completo
- [ ] Verificar se médias estão corretas (comparar com banco)
- [ ] Verificar se ranking está correto
- [ ] Verificar se gráfico carrega e exibe dados
- [ ] Tentar editar dados (deve estar bloqueado)

### Critérios de Aceite
- ✅ Todas as médias calculadas corretamente
- ✅ Ranking ordenado por média decrescente
- ✅ Gráfico renderiza sem erros
- ✅ Dados históricos imutáveis

---

## 2. Comparativo Entre Eventos

### Funcionalidades
- [ ] Comparação evento x evento
- [ ] Comparação por critério específico
- [ ] Exibição de média geral
- [ ] Gráfico de barras funcionando
- [ ] Gráfico radar funcionando
- [ ] Tabela comparativa com diferenças
- [ ] Filtro por evento
- [ ] Filtro por período
- [ ] Filtro por pregador

### Testes
- [ ] Selecionar 2+ eventos e comparar
- [ ] Comparar por critério específico
- [ ] Aplicar filtro de período
- [ ] Verificar se gráficos renderizam
- [ ] Verificar cálculo de diferenças

### Critérios de Aceite
- ✅ Mínimo 2 eventos para comparação
- ✅ Gráficos renderizam corretamente
- ✅ Diferenças calculadas com precisão
- ✅ Filtros funcionam corretamente

---

## 3. Certificados Automáticos em PDF

### Funcionalidades
- [ ] Geração de certificado individual
- [ ] Geração de certificados em lote
- [ ] Código UUID único por certificado
- [ ] Validação de certificado por código
- [ ] Layout A4 paisagem
- [ ] Campos dinâmicos preenchidos
- [ ] Sem quebra de conteúdo
- [ ] Apenas eventos encerrados

### Testes
- [ ] Gerar certificado individual
- [ ] Gerar certificados em lote
- [ ] Validar código UUID
- [ ] Tentar gerar para evento ativo (deve bloquear)
- [ ] Verificar layout do PDF
- [ ] Verificar se todos os campos estão preenchidos

### Critérios de Aceite
- ✅ PDF gerado sem erros
- ✅ Layout sem quebras
- ✅ UUID único e validável
- ✅ Apenas eventos encerrados
- ✅ Todos os campos preenchidos

---

## 4. Modo Avaliação Offline

### Funcionalidades
- [ ] Avaliação funciona 100% offline
- [ ] Armazenamento em IndexedDB
- [ ] Fila de sincronização automática
- [ ] Indicador visual de status (online/offline)
- [ ] Contador de avaliações pendentes
- [ ] Sincronização ao recuperar conexão
- [ ] Detecção de duplicatas local
- [ ] Validação de integridade

### Testes
- [ ] Desconectar internet e avaliar
- [ ] Verificar se salva no IndexedDB
- [ ] Reconectar e verificar sincronização
- [ ] Tentar avaliar duplicado (deve bloquear)
- [ ] Verificar indicador de status
- [ ] Verificar contador de pendentes

### Critérios de Aceite
- ✅ Funciona 100% offline
- ✅ Sincroniza automaticamente
- ✅ Sem duplicatas
- ✅ Indicadores visuais claros
- ✅ Integridade garantida

---

## 5. Painel Público de Ranking

### Funcionalidades
- [ ] URL pública acessível sem autenticação
- [ ] Top 3 destacado (pódio visual)
- [ ] Ranking completo em tabela
- [ ] Atualização automática a cada 10s
- [ ] Layout otimizado para telão
- [ ] Tipografia grande e legível
- [ ] Alto contraste
- [ ] Sem dados sensíveis

### Testes
- [ ] Acessar URL pública
- [ ] Verificar pódio (1º, 2º, 3º)
- [ ] Verificar ranking completo
- [ ] Aguardar 10s e verificar atualização
- [ ] Testar em tela grande (projetor/TV)
- [ ] Verificar legibilidade

### Critérios de Aceite
- ✅ Acesso público sem login
- ✅ Pódio visualmente destacado
- ✅ Atualização automática funciona
- ✅ Legível em telão
- ✅ Sem dados sensíveis

---

## 6. Critérios Dinâmicos

### Funcionalidades
- [ ] Admin pode adicionar novos critérios
- [ ] Admin pode definir ordem
- [ ] Admin pode ativar/desativar critérios
- [ ] Versionamento por evento
- [ ] Eventos antigos mantêm critérios originais
- [ ] Critérios entram automaticamente no cálculo
- [ ] Médias históricas não recalculadas

### Testes
- [ ] Criar novo critério
- [ ] Alterar ordem de critérios
- [ ] Desativar critério
- [ ] Vincular critérios a evento
- [ ] Verificar que evento antigo mantém critérios
- [ ] Avaliar com novos critérios
- [ ] Verificar cálculo de média

### Critérios de Aceite
- ✅ CRUD de critérios funciona
- ✅ Versionamento preserva histórico
- ✅ Cálculo automático correto
- ✅ Médias antigas inalteradas

---

## 7. Validações Obrigatórias

### Funcionalidades
- [ ] Todas as notas são obrigatórias
- [ ] Bloqueio de envio com campos vazios
- [ ] Feedback visual por campo
- [ ] Indicador de obrigatoriedade (*)
- [ ] Validação em tempo real
- [ ] Mensagens de erro específicas
- [ ] Incremento de 0.5 mantido
- [ ] Range 0-10 mantido

### Testes
- [ ] Tentar enviar com campo vazio (deve bloquear)
- [ ] Digitar nota inválida (ver feedback)
- [ ] Digitar nota com incremento errado (ver erro)
- [ ] Preencher todos os campos (deve permitir)
- [ ] Verificar indicador * em todos os campos

### Critérios de Aceite
- ✅ Envio bloqueado se vazio
- ✅ Feedback visual claro
- ✅ Validação em tempo real
- ✅ Mensagens específicas
- ✅ Incremento 0.5 validado

---

## 8. Arquitetura e Performance

### Código Modular
- [ ] Controllers separados
- [ ] Routes organizadas
- [ ] Services isolados
- [ ] Middleware de validação

### Queries Eficientes
- [ ] Materialized views criadas
- [ ] Queries < 50ms
- [ ] JOINs otimizados

### Índices
- [ ] 11 índices criados
- [ ] Índices em FKs
- [ ] Índices em campos filtrados

### Proteção Duplicidade
- [ ] Constraint no banco
- [ ] Validação no backend
- [ ] Validação no frontend

### PDFs
- [ ] Sem quebra de conteúdo
- [ ] Layout consistente

### Responsividade
- [ ] Mobile (< 768px)
- [ ] Tablet (768-1200px)
- [ ] Desktop (> 1200px)

### Testes
- [ ] Executar `npm test`
- [ ] Verificar 34 testes passam
- [ ] Verificar queries no banco
- [ ] Testar em mobile
- [ ] Testar em tablet
- [ ] Testar em desktop

### Critérios de Aceite
- ✅ Código modular
- ✅ Queries < 50ms
- ✅ 11 índices ativos
- ✅ Duplicatas bloqueadas
- ✅ PDFs perfeitos
- ✅ 100% responsivo

---

## 9. Segurança

### Implementado
- [ ] SQL Injection protection
- [ ] Constraint de duplicidade
- [ ] Validação de entrada
- [ ] Sanitização de strings
- [ ] CORS configurado
- [ ] Validação de tipos

### Testes
- [ ] Tentar SQL injection
- [ ] Tentar duplicar avaliação
- [ ] Enviar dados inválidos
- [ ] Testar CORS

### Critérios de Aceite
- ✅ SQL injection bloqueado
- ✅ Duplicatas impossíveis
- ✅ Validações funcionam
- ✅ CORS correto

---

## 10. Deploy e Documentação

### Documentação
- [ ] ESPECIFICACAO_TECNICA.md completo
- [ ] MIGRACOES.sql executável
- [ ] DIAGRAMAS.md legível
- [ ] DEPLOY.md com instruções claras
- [ ] README.md atualizado

### Deploy Docker
- [ ] docker-compose.yml funciona
- [ ] Containers sobem sem erro
- [ ] Banco inicializa
- [ ] Backend conecta
- [ ] Frontend acessível

### Testes
- [ ] Executar `docker-compose up -d`
- [ ] Verificar containers rodando
- [ ] Acessar http://localhost:8080
- [ ] Acessar http://localhost:3000/api
- [ ] Executar migrações

### Critérios de Aceite
- ✅ Documentação completa
- ✅ Deploy com 1 comando
- ✅ Sistema funcional
- ✅ Sem erros

---

## Resumo de Aceite

### Funcionalidades (7 módulos)
- [ ] Histórico Individual
- [ ] Comparativo Entre Eventos
- [ ] Certificados PDF
- [ ] Modo Offline
- [ ] Painel Ranking
- [ ] Critérios Dinâmicos
- [ ] Validações Obrigatórias

### Qualidade
- [ ] 34 testes passando
- [ ] Código modular
- [ ] Performance < 50ms
- [ ] 100% responsivo

### Segurança
- [ ] SQL Injection protegido
- [ ] Duplicatas bloqueadas
- [ ] Validações completas

### Deploy
- [ ] Docker funcional
- [ ] Documentação completa
- [ ] Migrações executáveis

---

## Assinaturas

**Desenvolvedor**: _________________ Data: ___/___/___

**QA**: _________________ Data: ___/___/___

**Product Owner**: _________________ Data: ___/___/___

**Cliente**: _________________ Data: ___/___/___

---

## Observações

_Espaço para anotações durante aceite:_

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
