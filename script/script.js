// ============================================
// SCRIPT PRINCIPAL - CORE DA APLICAÇÃO
// Gerenciamento de dados, tema e formulário
// ============================================

// Este arquivo é o ponto central da aplicação.
// Ele carrega os dados, inicializa event listeners e conecta os botões da interface
// às funções dos demais scripts.

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
const btnExportarExcel = document.getElementById("btnExportarExcel");
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

// Impede que a tecla Enter envie o formulário ao digitar em campos de texto.
// Chamado por: eventos onkeydown nos campos do formulário definidos em index.html.
function disableEnterKey(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
    }
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
// Inicializa a aplicação quando a página terminar de carregar.
// Chamado automaticamente pelo navegador ao concluir o carregamento do DOM.
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
    if (btnExportarExcel) {
        btnExportarExcel.addEventListener("click", exportarListaExcel);
    }
});

// ============================================
// GERENCIAMENTO DE TEMA
// ============================================

// Aplica o tema salvo no localStorage ao carregar a página.
// Chamado por: listener do DOMContentLoaded em script.js.
function inicializarTema() {
    const temaSalvo = localStorage.getItem("danplas_tema") || "dark";
    if (temaSalvo === "light") {
        document.documentElement.classList.add("light-theme");
    } else {
        document.documentElement.classList.remove("light-theme");
    }
}

// Alterna entre os temas claro e escuro e grava a preferência no localStorage.
// Chamado por: evento de clique do botão themeToggle, registrado em script.js.
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

// Carrega os dados de setores, funcionários, códigos de barras e estoque.
// Chamado por: listener do DOMContentLoaded em script.js.
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

// Carrega o estoque padrão a partir do arquivo JSON público quando não há cache local.
// Chamado por: carregarDados() quando o localStorage não possui dados de estoque.
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

// Popula o select de setores com os dados carregados.
// Chamado por: carregarDados() após o fetch de setores.
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

// Popula o select de funcionários com os dados carregados.
// Chamado por: carregarDados() após o fetch de funcionários.
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

// Popula o select de itens do estoque com os dados disponíveis.
// Chamado por: carregarDados() e carregarEstoquePadrao() após obter o estoque.
function popularSelectEstoque() {
    selectDescricao.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.text = "Selecione o Item";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.value = "";
    selectDescricao.add(placeholder);

    for (let i = 0; i < estoqueItem.length; i++) {
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

// Filtra os itens do estoque conforme o texto digitado na pesquisa.
// Chamado por: evento input do campo inputPesquisaDescricao e também ao inicializar os dados.
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
        }
    }
    atualizaDados();
}

// Atualiza os campos de unidade, valor e código do item quando uma descrição é selecionada.
// Chamado por: evento change do selectDescricao e ao filtrar itens.
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

// Atualiza o código do setor com base na opção escolhida.
// Chamado por: evento change do selectSetor em script.js.
function atualizaSetor() {
    const selectedSetor = selectSetor.value;
    const setor = dbSetor.find(s => s.DESCRICAO === selectedSetor);
    if (setor) {
        codigoSetor.value = setor.CODIGO;
    } else {
        codigoSetor.value = "0";
    }
}

// Limpa os campos do item após a retirada, sem apagar o solicitante e o setor.
// Chamado por: realizarBaixa() em historico.js.
function limparCamposParciais() {
    selectDescricao.value = "";
    inputPesquisaDescricao.value = "";
    inputUnidade.value = "";
    inputValor.value = "1.00";
    codigoItem.value = "0";
    qntda.value = "1";
}

// Reseta o formulário completo para o estado inicial.
// Chamado por: evento de clique do botão btnCancelar, vinculado em script.js.
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
