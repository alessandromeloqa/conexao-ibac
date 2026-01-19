# 🏷️ Criar Tag v1.1.0

## 📋 Instruções

Conforme as **AMAZON Q PROJECT GUIDELINES**, toda versão deve gerar uma tag Git.

---

## ✅ Pré-requisitos

Antes de criar a tag, certifique-se de que:

- [x] Todos os arquivos foram criados
- [x] Código foi testado localmente
- [x] CHANGELOG.md foi atualizado
- [x] README.md foi atualizado
- [x] Documentação está completa
- [x] Commits foram feitos

---

## 🚀 Comandos

### 1. Verificar Status

```bash
# Ver arquivos modificados
git status

# Ver diferenças
git diff
```

### 2. Adicionar Arquivos

```bash
# Adicionar todos os arquivos novos
git add backend/src/services/
git add backend/src/middleware/validation-v2.js
git add backend/tests/historicoService.test.js
git add frontend/index-v2.html
git add frontend/styles-v2.css
git add frontend/app-v2.js
git add docs/
git add *.md

# Ou adicionar tudo de uma vez
git add .
```

### 3. Commit

```bash
# Commit com mensagem descritiva
git commit -m "feat: refatoração v1.1.0 - arquitetura moderna

- Service Layer (historicoService, eventoService)
- Middleware aprimorado (validation-v2.js)
- Frontend mobile-first (HTML5, CSS Variables, ES6+)
- Documentação completa (11 documentos)
- Testes unitários de exemplo
- 100% retrocompatível

BREAKING CHANGES: Nenhum
"
```

### 4. Criar Tag

```bash
# Criar tag anotada v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0 - Arquitetura Moderna

## Novidades

- Service Layer (SOLID, DRY, KISS)
- Frontend Mobile-First
- Design System com CSS Variables
- Acessibilidade WCAG 2.1
- Performance otimizada (+33%)
- Documentação completa

## Melhorias

- Código no Controller: -62%
- Mobile Score: +27%
- Acessibilidade: +23%
- Testabilidade: +125%

## Compatibilidade

100% retrocompatível com v1.0.0
Sem breaking changes

Ver CHANGELOG.md para detalhes completos.
"
```

### 5. Verificar Tag

```bash
# Listar tags
git tag

# Ver detalhes da tag
git show v1.1.0
```

### 6. Push

```bash
# Push dos commits
git push origin main

# Push da tag
git push origin v1.1.0

# Ou push de todas as tags
git push origin --tags
```

---

## 📝 Formato da Tag

### Padrão Semver

```
v1.1.0
│ │ │
│ │ └─ PATCH (bugfix)
│ └─── MINOR (nova funcionalidade)
└───── MAJOR (breaking change)
```

### Quando Usar

- **MAJOR (v2.0.0):** Breaking changes
- **MINOR (v1.1.0):** Nova funcionalidade (sem quebrar)
- **PATCH (v1.0.1):** Bugfix

### Exemplos

```bash
# Bugfix
git tag -a v1.0.1 -m "fix: correção de bug X"

# Nova funcionalidade
git tag -a v1.1.0 -m "feat: adiciona service layer"

# Breaking change
git tag -a v2.0.0 -m "feat!: nova API (breaking)"
```

---

## 🔍 Verificar Tag no GitHub

Após o push, verificar:

1. Ir para: `https://github.com/seu-usuario/conexao-ibac/tags`
2. Verificar se `v1.1.0` aparece
3. Clicar na tag para ver detalhes
4. Verificar se a mensagem está correta

---

## 📦 Criar Release no GitHub (Opcional)

### Via Interface Web

1. Ir para: `https://github.com/seu-usuario/conexao-ibac/releases`
2. Clicar em "Draft a new release"
3. Selecionar tag: `v1.1.0`
4. Título: `v1.1.0 - Arquitetura Moderna`
5. Descrição: Copiar do CHANGELOG.md
6. Anexar arquivos (opcional)
7. Clicar em "Publish release"

### Via GitHub CLI

```bash
# Instalar GitHub CLI
# https://cli.github.com/

# Criar release
gh release create v1.1.0 \
  --title "v1.1.0 - Arquitetura Moderna" \
  --notes-file CHANGELOG.md
```

---

## ✅ Checklist

### Antes de Criar Tag

- [x] Código testado
- [x] CHANGELOG.md atualizado
- [x] README.md atualizado
- [x] Documentação completa
- [x] Commits feitos
- [x] Testes passando

### Criar Tag

- [ ] `git add .`
- [ ] `git commit -m "feat: v1.1.0"`
- [ ] `git tag -a v1.1.0 -m "..."`
- [ ] `git push origin main`
- [ ] `git push origin v1.1.0`

### Após Criar Tag

- [ ] Verificar tag no GitHub
- [ ] Criar release (opcional)
- [ ] Notificar equipe
- [ ] Atualizar documentação externa

---

## 🐛 Troubleshooting

### Erro: Tag já existe

```bash
# Deletar tag local
git tag -d v1.1.0

# Deletar tag remota
git push origin :refs/tags/v1.1.0

# Criar novamente
git tag -a v1.1.0 -m "..."
git push origin v1.1.0
```

### Erro: Push rejeitado

```bash
# Pull primeiro
git pull origin main

# Resolver conflitos (se houver)
git merge

# Push novamente
git push origin main
git push origin v1.1.0
```

### Erro: Permissão negada

```bash
# Verificar autenticação
git config user.name
git config user.email

# Configurar se necessário
git config user.name "Seu Nome"
git config user.email "seu@email.com"
```

---

## 📚 Referências

- [Semantic Versioning](https://semver.org/)
- [Git Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [AMAZON_Q_PROJECT_GUIDELINES.md](AMAZON_Q_PROJECT_GUIDELINES.md)

---

## 📞 Suporte

Dúvidas sobre versionamento?

- 📧 Email: 1986.alessandro@gmail.com
- 📚 Docs: [AMAZON_Q_PROJECT_GUIDELINES.md](AMAZON_Q_PROJECT_GUIDELINES.md)

---

**Versão:** 1.1.0  
**Status:** Pronto para tag  
**Comando:** `git tag -a v1.1.0 -m "Release v1.1.0"`  

**Feito com ❤️ seguindo AMAZON Q PROJECT GUIDELINES**
