// ============================================
// SCRIPT PRINCIPAL - CORE DA APLICAÇÃO
// Gerenciamento de dados, tema e formulário
// ============================================

// Elementos do DOM
const selectSetor = document.getElementById("selectSetor");
const selectFuncionario = document.getElementById("selectFuncionario");
const selectDescricao = document.getElementById("selectDescricao");
const inputPesquisaDescricao = document.getElementById("inputPesquisaDescricao");
const inputUnidade = document.getElementById("inputUnidade");
const inputValor = document.getElementById("inputValor");
const codigoItem = document.getElementById("codigoItem");
const codigoSetor = document.getElementById("codigoSetor");
const sectecFinalidade = document.getElementById("sectecFinalidade");
const os = document.getElementById("os");
const qntda = document.getElementById("qntda");
const btnCancelar = document.getElementById("btnCancelar");
const btnAplicar = document.getElementById("btnAplicar");
const btnExportar = document.getElementById("btnExportar");
const historicoBody = document.getElementById("historicoBody");
const historicoVazio = document.getElementById("historicoVazio");
const themeToggle = document.getElementById("themeToggle");
const btnLimparHistorico = document.getElementById("btnLimparHistorico");

// Caminhos dos arquivos JSON de dados padrão
const fileEstoque = 'public/db/estoque.json';
const fileSetor = 'public/db/setor.json';
const fileFuncionario = 'public/db/funcionarios.json';
const fileCod128 = 'public/db/cod128.json';

// Variáveis de dados globais
let estoqueItem = [];
let dbSetor = [];
let dbFuncionario = [];
let dbCod128 = [];

// Função para desabilitar a tecla Enter em inputs de texto
function disableEnterKey(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
    }
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();
    carregarDados();
    renderizarHistorico();

    if (themeToggle) {
        themeToggle.addEventListener("click", alternarTema);
    }
    if (btnLimparHistorico) {
        btnLimparHistorico.addEventListener("click", limparHistoricoComConfirmacao);
    }
    inputPesquisaDescricao.addEventListener("input", filtrarItens);
    selectDescricao.addEventListener("change", atualizaDados);
    selectSetor.addEventListener("change", atualizaSetor);
    btnAplicar.addEventListener("click", realizarBaixa);
    btnCancelar.addEventListener("click", limparFormulario);
    btnExportar.addEventListener("click", imprimirLista);
});

// ============================================
// GERENCIAMENTO DE TEMA
// ============================================

function inicializarTema() {
    const temaSalvo = localStorage.getItem("danplas_tema") || "dark";
    if (temaSalvo === "light") {
        document.documentElement.classList.add("light-theme");
    } else {
        document.documentElement.classList.remove("light-theme");
    }
}

function alternarTema() {
    if (document.documentElement.classList.contains("light-theme")) {
        document.documentElement.classList.remove("light-theme");
        localStorage.setItem("danplas_tema", "dark");
    } else {
        document.documentElement.classList.add("light-theme");
        localStorage.setItem("danplas_tema", "light");
    }
}

// ============================================
// CARREGAMENTO E GERENCIAMENTO DE DADOS
// ============================================

function carregarDados() {
    // 1. Carrega Setores
    fetch(fileSetor)
        .then(res => res.json())
        .then(data => {
            dbSetor = data;
            popularSelectSetor();
        })
        .catch(err => console.error("Erro ao carregar setores:", err));

    // 2. Carrega Funcionários
    fetch(fileFuncionario)
        .then(res => res.json())
        .then(data => {
            dbFuncionario = data;
            popularSelectFuncionario();
        })
        .catch(err => console.error("Erro ao carregar funcionários:", err));

    // 3. Carrega Códigos de Barras (Code128)
    fetch(fileCod128)
        .then(res => res.json())
        .then(data => {
            dbCod128 = data;
        })
        .catch(err => console.error("Erro ao carregar códigos de barras:", err));

    // 4. Carrega Estoque (com prioridade para o cache local no localStorage)
    const estoqueLocal = localStorage.getItem('danplas_estoque');
    if (estoqueLocal) {
        try {
            estoqueItem = JSON.parse(estoqueLocal);
            popularSelectEstoque();
        } catch (e) {
            console.error("Erro ao ler estoque do localStorage, recarregando padrão:", e);
            carregarEstoquePadrao();
        }
    } else {
        carregarEstoquePadrao();
    }
}

function carregarEstoquePadrao() {
    fetch(fileEstoque)
        .then(res => res.json())
        .then(data => {
            estoqueItem = data;
            localStorage.setItem('danplas_estoque', JSON.stringify(estoqueItem));
            popularSelectEstoque();
        })
        .catch(err => console.error("Erro ao carregar estoque:", err));
}

// ============================================
// POPULAÇÃO DE SELECTS
// ============================================

function popularSelectSetor() {
    selectSetor.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.text = "Selecione o Setor";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = "";
    selectSetor.add(placeholder);

    dbSetor.forEach(setor => {
        const option = document.createElement("option");
        option.text = setor.DESCRICAO;
        option.value = setor.DESCRICAO;
        selectSetor.add(option);
    });
}

function popularSelectFuncionario() {
    selectFuncionario.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.text = "Selecione o Funcionário";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = "";
    selectFuncionario.add(placeholder);

    dbFuncionario.forEach(funci => {
        const option = document.createElement("option");
        option.text = funci.COLABORADOR + " (" + funci.DESCRICAO + ")";
        option.value = funci.COLABORADOR;
        selectFuncionario.add(option);
    });
}

function popularSelectEstoque() {
    selectDescricao.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.text = "Selecione o Item";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = "";
    selectDescricao.add(placeholder);

    // Mostra no máximo 100 itens inicialmente para evitar lentidão
    const limiteInicial = Math.min(estoqueItem.length, 100);
    for (let i = 0; i < limiteInicial; i++) {
        const item = estoqueItem[i];
        const option = document.createElement("option");
        option.text = `${item.DESCRICAO} [Saldo: ${item.SALDO} ${item.UNIDADE}]`;
        option.value = item.DESCRICAO;
        selectDescricao.add(option);
    }
}

// ============================================
// FILTRO E MANIPULAÇÃO DE FORMULÁRIO
// ============================================

function filtrarItens() {
    const textoPesquisa = inputPesquisaDescricao.value.toLowerCase().trim();
    
    selectDescricao.innerHTML = "";
    
    const placeholder = document.createElement("option");
    placeholder.text = "Selecione o Item";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = "";
    selectDescricao.add(placeholder);

    let matches = 0;
    for (let i = 0; i < estoqueItem.length; i++) {
        const item = estoqueItem[i];
        const descricaoItem = item.DESCRICAO.toLowerCase();
        const mascaraItem = item.MASCARA ? item.MASCARA.toLowerCase() : "";
        const codigoItem = item.CODIGO ? item.CODIGO.toString().toLowerCase() : "";

        // Pesquisa por Descrição, Máscara ou Código
        if (descricaoItem.includes(textoPesquisa) || mascaraItem.includes(textoPesquisa) || codigoItem.includes(textoPesquisa)) {
            const option = document.createElement("option");
            option.text = `${item.DESCRICAO} [Saldo: ${item.SALDO} ${item.UNIDADE}]`;
            option.value = item.DESCRICAO;
            selectDescricao.add(option);
            matches++;

            // Limita a exibição a no máximo 100 itens para garantir alta performance
            if (matches >= 100) {
                break;
            }
        }
    }
    atualizaDados();
}

function atualizaDados() {
    const selectedDesc = selectDescricao.value;
    if (!selectedDesc) {
        inputUnidade.value = "PC";
        inputValor.value = "0.00";
        codigoItem.value = "0";
        return;
    }

    const item = estoqueItem.find(item => item.DESCRICAO === selectedDesc);
    if (item) {
        inputUnidade.value = item.UNIDADE || "PC";
        inputValor.value = parseFloat(item.VALOR || 0).toFixed(2);
        codigoItem.value = item.CODIGO || "0";
    }
}

function atualizaSetor() {
    const selectedSetor = selectSetor.value;
    const setor = dbSetor.find(s => s.DESCRICAO === selectedSetor);
    if (setor) {
        codigoSetor.value = setor.CODIGO;
    } else {
        codigoSetor.value = "0";
    }
}

function limparCamposParciais() {
    selectDescricao.value = "";
    inputPesquisaDescricao.value = "";
    inputUnidade.value = "";
    inputValor.value = "1.00";
    codigoItem.value = "0";
    qntda.value = "1";
}

function limparFormulario() {
    selectFuncionario.value = "";
    selectSetor.value = "";
    sectecFinalidade.value = "28";
    os.value = "";
    selectDescricao.value = "";
    inputPesquisaDescricao.value = "";
    inputUnidade.value = "";
    inputValor.value = "1.00";
    codigoItem.value = "0";
    codigoSetor.value = "0";
    qntda.value = "1";
    selectFuncionario.focus();
}
