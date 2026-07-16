# 🎯 Guia de Uso - Terminal Danplas (Refatorado)

## ✅ Status da Refatoração

```
✅ Todas as 12 funções-chave testadas e funcionando
✅ 3.306 itens de estoque carregados
✅ 104 setores cadastrados  
✅ 77 funcionários cadastrados
✅ 64 caracteres Code128 para barcodes disponíveis
✅ 100% compatível com versão anterior
```

---

## 📦 Estrutura de Arquivos

```
Terminal_Simples-sheetMonkey/
├── index.html                    # Página principal
├── package.json                  # Dependências
├── README.md                     # Documentação original
├── REFACTORING_SUMMARY.md        # Resumo da refatoração
├── public/
│   ├── script.js                 # ✅ REFATORADO - Core (180 linhas)
│   ├── historico.js              # ✅ NOVO - Gerenciamento histórico
│   ├── impressao.js              # ✅ NOVO - PDF com barcodes
│   ├── script-old.js             # 📦 BACKUP - Original
│   ├── style.css                 # Estilos
│   ├── db/
│   │   ├── estoque.json          # Inventário
│   │   ├── setor.json            # Setores
│   │   ├── funcionarios.json     # Colaboradores
│   │   ├── cod128.json           # Mapeamento barcodes
│   │   ├── FUNCI.DBF             # Original DBF
│   │   ├── GDESP.DBF             # Original DBF
│   │   └── USOCO.DBF             # Original DBF
│   └── img/                      # Logos e ícones
└── script/
    └── syncDbf.js                # Sincronização DBF
```

---

## 🚀 Como Usar

### 1. Abrir a Aplicação

**Opção A: Localmente (Desenvolvimento)**
```bash
# No VS Code, abra o arquivo:
file:///C:/Users/User/Documents/Juh.Doc/juh.lab/Terminal_Simples-sheetMonkey/index.html
```

**Opção B: Servidor Web (Recomendado para Produção)**
```bash
# Usar Python
python -m http.server 8000

# Ou Node.js (http-server)
npx http-server -p 8000
```

### 2. Registrar uma Retirada

**Passo a passo:**

1. **Identificação e Destino**
   - Selecione seu nome em "Colaborador"
   - Selecione o setor destino em "Setor"
   - Selecione a finalidade (CONSUMO ou SUBSTITUIÇÃO)
   - (Opcional) Digite número da OS/OP/HO

2. **Seleção do Item**
   - Digite parte da descrição no campo "Pesquisar Item"
   - Selecione o item desejado
   - Sistema preencherá Unidade, Valor e Código automaticamente

3. **Quantidade**
   - Digite a quantidade a retirar
   - Sistema calcula e valida

4. **Registrar**
   - Clique em "Aplicar (Registrar)"
   - Confirme no diálogo
   - Histórico será atualizado

### 3. Visualizar Histórico

- **Histórico Recente:** Exibe últimas 5 retiradas à direita
- **Cores:** Finalidade "CONSUMO" em verde, "SUBSTITUIÇÃO" em azul
- **Limpar Histórico:** Botão vermelho (com confirmação)

### 4. Imprimir PDF com Códigos de Barras

**Procedimento:**
1. Clique no botão verde "Imprimir Lista de Baixas (PDF)"
2. Um iframe invisível será criado com o HTML formatado
3. Janela de impressão abrirá automaticamente
4. Revise e clique em "Imprimir"
5. Selecione impressora (física ou "Salvar como PDF")

**Conteúdo do PDF:**
```
┌─────────────────────────────────────────────────┐
│ DANPLAS - LISTA DE RETIRADAS                    │
│                                                 │
│ [Início Baixa]  [Página Info]  [Fim Baixa]    │
│                                                 │
│ Nº │ Descrição │ ┌─ Código ─┬─ Qtd ─┐         │
│    │ (Item)    │ │ ║Code128║ │║S001║│         │
│    │           │ │ └───────┴─────┘  │         │
│    │           │ │ 000.001  │  1    │         │
│    │           │ │ Setor    │ OS    │         │
│    │           │ └──────────────────┘         │
│    │           │                              │
│ ═══╪═════════════════════════════════════════ │
│    └─ [32 itens por página] ─────────────────  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Funções Disponíveis

### 📋 Módulo Core (script.js)

```javascript
// Inicialização
carregarDados()               // Carrega JSONs (setor, funcionário, estoque, barcodes)
inicializarTema()             // Define tema (dark/light) do localStorage
popularSelectSetor()          // Popula dropdown de setores
popularSelectFuncionario()    // Popula dropdown de funcionários
popularSelectEstoque()        // Popula dropdown de itens

// Tema
alternarTema()                // Alterna entre dark/light

// Formulário
filtrarItens()                // Filtra itens por descrição/código/máscara
atualizaDados()               // Carrega unidade/valor do item
atualizaSetor()               // Carrega código do setor
limparCamposParciais()        // Limpa campos do item (mantém funcionário/setor)
limparFormulario()            // Limpa tudo
```

### 📊 Módulo Histórico (historico.js)

```javascript
realizarBaixa()               // Valida e registra a retirada
salvarMovimentacao(mov)       // Persiste movimento em localStorage
renderizarHistorico(id)       // Renderiza últimas 5 movimentações
limparHistoricoComConfirmacao() // Limpa com confirmação
obterDataHoraFormatada()      // Retorna DD/MM/YYYY HH:MM:SS
```

### 🖨️ Módulo Impressão (impressao.js)

```javascript
imprimirLista()               // Entrada para impressão
imprimirViaIframe(mov)        // Cria iframe e imprime
gerarHtmlImpressao(mov)       // Gera HTML completo
toCode128(text)               // Codifica em Code128
padLeft(str, len)             // Preenche com zeros
formatarCodigoHumanReadable(cod) // Formata XXX.XXX
```

---

## 💾 Dados em localStorage

### Chaves Disponíveis

```javascript
// Estoque atual (atualizado em cada retirada)
localStorage.getItem('danplas_estoque')
// [{CODIGO: "001", DESCRICAO: "...", SALDO: 100, UNIDADE: "PC", ...}, ...]

// Histórico de movimentações
localStorage.getItem('danplas_movimentacoes')
// [{id: 1234567890, dataHora: "14/07/2026 20:05:02", colaborador: "ADRE-W", 
//   setor: "MANUT EXTRUSORAS", codigo: "000001", quantidade: 1, ...}, ...]

// Preferência de tema
localStorage.getItem('danplas_tema')
// "dark" ou "light"
```

### Manipular localStorage

```javascript
// Limpar tudo
localStorage.clear()

// Exportar dados
const dados = JSON.parse(localStorage.getItem('danplas_movimentacoes'))
console.table(dados)

// Restaurar backup
localStorage.setItem('danplas_movimentacoes', JSON.stringify(backup))
```

---

## 🎨 Recursos de Interface

### Tema Claro/Escuro
- **Botão:** Ícone de sol/lua (canto superior direito)
- **Padrão:** Dark mode
- **Persistente:** Salva em localStorage

### Badges de Finalidade
- 🟢 **CONSUMO** - Verde (uso/gasto)
- 🔵 **SUBSTITUIÇÃO** - Azul (troca de peça)

### Validações
- ✅ Funcionário obrigatório
- ✅ Setor obrigatório
- ✅ Item obrigatório
- ✅ Quantidade > 0
- ⚠️ Aviso se saldo negativo (mas permite confirmar)

---

## 📱 Responsividade

- **Desktop:** Otimizado para 1920x1080+
- **Tablet:** Interface adaptada
- **Impressão:** Formato A4 landscape com 32 itens por página

---

## 🔍 Troubleshooting

### Problema: Dados não carregam
```javascript
// Verificar no console
console.log({ estoqueItem, dbSetor, dbFuncionario, dbCod128 })

// Se vazios, tente recarregar manualmente
carregarDados()
```

### Problema: PDF não abre
```javascript
// Verificar funções
console.log(typeof imprimirLista, typeof toCode128)

// Tentar manualmente
imprimirLista() // Deve abrir janela de impressão
```

### Problema: Histórico não salva
```javascript
// Verificar localStorage
localStorage.getItem('danplas_movimentacoes')

// Limpar e recriar
localStorage.removeItem('danplas_movimentacoes')
renderizarHistorico()
```

---

## 🚨 Importante

### Backup de Dados
```javascript
// Antes de limpar tudo, fazer backup
const backup = {
  estoque: JSON.parse(localStorage.getItem('danplas_estoque')),
  movimentacoes: JSON.parse(localStorage.getItem('danplas_movimentacoes')),
  data: new Date().toISOString()
}

console.log(JSON.stringify(backup))
// Copiar e salvar em arquivo seguro
```

### Performance
- Estoque com 3.306 itens pode ser lento em computadores antigos
- Impressão com muitos itens (>100) pode demorar
- Use filtro de pesquisa para encontrar itens rapidamente

---

## 📞 Suporte

### Verificar Versão
- Abra Console (F12 → Console)
- Examine arquivo `index.html` para versão em comentários

### Limpar Cache
```
Ctrl+Shift+Delete → Limpar dados de navegação
Ou
Ctrl+F5 → Recarga com bypass de cache
```

### Restaurar Estado Inicial
```javascript
localStorage.clear()
location.reload()
```

---

## ✨ Melhorias Implementadas na Refatoração

1. **Modularização** - Código separado em 3 responsabilidades
2. **Manutenibilidade** - Mais fácil encontrar e corrigir bugs
3. **Performance** - Cada módulo carrega apenas o necessário
4. **Reutilização** - Funções podem ser usadas em outros projetos
5. **Testabilidade** - Cada módulo pode ser testado independentemente

---

## 📅 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0 | Jul 2024 | Inicial - Monolítica |
| 1.1 | 14/Jul/2026 | **Refatoração com modularização** |
| | | ✅ script.js reduzido em 82% |
| | | ✅ historico.js criado (382 linhas) |
| | | ✅ impressao.js criado (460+ linhas) |
| | | ✅ 100% compatível com versão anterior |

---

**Última atualização:** 14/07/2026 20:05:02  
**Status:** ✅ PRONTO PARA PRODUÇÃO
