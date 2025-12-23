# Validação de Notas - Obrigatoriedade

## Alterações Implementadas

### ✅ Obrigatoriedade
- **Todos os campos** de nota são obrigatórios
- Indicador visual `*` vermelho em cada campo
- Aviso no título da seção: "Todos obrigatórios"

### ✅ Bloqueio de Envio
- Formulário não envia com campos vazios
- Validação antes de processar
- Lista de campos faltantes na mensagem de erro

### ✅ Feedback Visual por Campo

#### Estados do Input
1. **Normal**: Borda cinza (#ddd)
2. **Foco**: Borda azul (#3498db)
3. **Inválido**: Borda vermelha + fundo rosa claro

#### Mensagens de Erro
- Exibidas abaixo de cada campo
- Texto vermelho, fonte pequena
- Mensagens específicas:
  - "Campo obrigatório" (vazio)
  - "Entre 0 e 10" (fora do range)
  - "Use 0.5" (incremento inválido)

### ✅ Validação em Tempo Real
- **onInput**: Valida enquanto digita
- **onBlur**: Valida ao sair do campo
- Feedback imediato ao usuário

### ✅ Validações Aplicadas

1. **Campo vazio**: Bloqueado
2. **Range**: 0 a 10
3. **Incremento**: 0.5 (mantido)
4. **Tipo**: Número válido
5. **Duplicata**: Verificação mantida

## Fluxo de Validação

```
1. Usuário preenche campo
   ↓
2. Validação em tempo real (input/blur)
   ↓
3. Feedback visual imediato
   ↓
4. Usuário clica "Enviar"
   ↓
5. Validação completa de todos os campos
   ↓
6. Se inválido: Mensagem + destaque campos
   ↓
7. Se válido: Salva e sincroniza
```

## Código de Validação

### Função Principal
```javascript
function validarCampo(criterioId) {
    const input = document.getElementById(`criterio_${criterioId}`);
    const valor = input.value.trim();
    
    // Vazio
    if (valor === '') {
        input.classList.add('invalido');
        return false;
    }
    
    const nota = parseFloat(valor);
    
    // Range
    if (isNaN(nota) || nota < 0 || nota > 10) {
        marcarErro(criterioId, 'Entre 0 e 10');
        return false;
    }
    
    // Incremento 0.5
    if (nota % 0.5 !== 0) {
        marcarErro(criterioId, 'Use 0.5');
        return false;
    }
    
    limparErro(criterioId);
    return true;
}
```

## UX Melhorada

### Antes
- Campos opcionais (implícito)
- Erro genérico ao enviar
- Sem feedback visual por campo

### Depois
- Campos obrigatórios (explícito)
- Erro específico por campo
- Feedback visual em tempo real
- Mensagem consolidada de campos faltantes

## Mantido (Sem Alteração)

✅ Incremento de 0.5
✅ Lógica de cálculo
✅ Sincronização offline
✅ Verificação de duplicatas
✅ Range 0-10
