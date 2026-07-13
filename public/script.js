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

// Inicialização
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

// Funções de Gerenciamento de Tema
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

// Carrega os dados dos arquivos ou do cache local
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

    // 3. Carrega Estoque (com prioridade para o cache local no localStorage)
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

// Carrega o estoque do arquivo JSON e salva no cache local
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

// Popula o select de Setor
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

// Popula o select de Funcionários
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

// Popula o select de Itens do Estoque (Completo Inicial)
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

// Filtra os itens do estoque de acordo com a pesquisa (Otimizado)
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

// Atualiza informações detalhadas do item selecionado
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

// Atualiza o código do setor selecionado
function atualizaSetor() {
    const selectedSetor = selectSetor.value;
    const setor = dbSetor.find(s => s.DESCRICAO === selectedSetor);
    if (setor) {
        codigoSetor.value = setor.CODIGO;
    } else {
        codigoSetor.value = "0";
    }
}

// Valida os dados do formulário e realiza o registro da retirada
function realizarBaixa() {
    if (!selectFuncionario.value) {
        alert("Selecione seu nome no Campo Funcionário!");
        selectFuncionario.focus();
        return;
    }
    if (!selectSetor.value) {
        alert("Especifique o SETOR de destino!");
        selectSetor.focus();
        return;
    }
    if (!selectDescricao.value) {
        alert("Selecione o Item a ser retirado!");
        selectDescricao.focus();
        return;
    }
    
    const qtdRetirada = parseInt(qntda.value);
    if (isNaN(qtdRetirada) || qtdRetirada <= 0) {
        alert("Digite uma quantidade válida (maior que zero)!");
        qntda.focus();
        return;
    }

    // Procura o item no estoque para atualizar
    const itemIndex = estoqueItem.findIndex(item => item.DESCRICAO === selectDescricao.value);
    if (itemIndex === -1) {
        alert("Item não encontrado no catálogo!");
        return;
    }

    const item = estoqueItem[itemIndex];
    
    // Alerta caso o saldo seja insuficiente, mas permite continuar caso o almoxarifado tenha estoque físico real não registrado
    if (item.SALDO < qtdRetirada) {
        const prosseguir = confirm(`Atenção: Saldo insuficiente no sistema!\nSaldo Atual: ${item.SALDO} ${item.UNIDADE}\nQuantidade Solicitada: ${qtdRetirada} ${item.UNIDADE}\nDeseja registrar a movimentação mesmo assim?`);
        if (!prosseguir) return;
    }

    // Confirmação final da retirada
    const confirmar = confirm(`Confirme a baixa do item:\n- Descrição: ${item.DESCRICAO}\n- Quantidade: ${qtdRetirada} ${item.UNIDADE}\n- Solicitante: ${selectFuncionario.value}\n- Setor: ${selectSetor.value}`);
    
    if (confirmar) {
        // 1. Atualiza o saldo do estoque localmente (permite saldo negativo caso confirmem acima)
        estoqueItem[itemIndex].SALDO -= qtdRetirada;
        localStorage.setItem('danplas_estoque', JSON.stringify(estoqueItem));

        // 2. Registra o Log da Movimentação
        const novaMovimentacao = {
            id: Date.now(), // ID único para controle
            dataHora: obterDataHoraFormatada(),
            colaborador: selectFuncionario.value,
            setor: selectSetor.value,
            codigoSetor: codigoSetor.value,
            finalidade: sectecFinalidade.options[sectecFinalidade.selectedIndex].text,
            finalidadeCodigo: sectecFinalidade.value,
            os: os.value.trim() || '-',
            codigo: item.CODIGO || '-',
            mascara: item.MASCARA || '-',
            descricao: item.DESCRICAO,
            quantidade: qtdRetirada
        };

        salvarMovimentacao(novaMovimentacao);

        // 3. Atualiza os campos na tela
        filtrarItens(); // Atualiza a lista do select com os saldos novos
        limparCamposParciais(); // Limpa dados do item, mantendo funcionário/setor
        renderizarHistorico(novaMovimentacao.id); // Renderiza a tabela destacando o novo item

        alert("Item retirado com sucesso!");
    }
}

// Formata a data e hora atual no padrão brasileiro (DD/MM/AAAA HH:MM:SS)
function obterDataHoraFormatada() {
    const date = new Date();
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
}

// Salva a nova movimentação no localStorage
function salvarMovimentacao(movimentacao) {
    let movimentacoes = [];
    const localMov = localStorage.getItem('danplas_movimentacoes');
    if (localMov) {
        try {
            movimentacoes = JSON.parse(localMov);
        } catch (e) {
            console.error("Erro ao analisar movimentações salvas, iniciando novo array", e);
        }
    }
    movimentacoes.push(movimentacao);
    localStorage.setItem('danplas_movimentacoes', JSON.stringify(movimentacoes));
}

// Renderiza a tabela de histórico na parte inferior da tela
function renderizarHistorico(destacarId = null) {
    historicoBody.innerHTML = "";
    
    let movimentacoes = [];
    const localMov = localStorage.getItem('danplas_movimentacoes');
    
    if (localMov) {
        try {
            movimentacoes = JSON.parse(localMov);
        } catch (e) {
            console.error(e);
        }
    }

    if (movimentacoes.length === 0) {
        historicoVazio.style.display = "flex";
        btnExportar.disabled = true;
        if (btnLimparHistorico) btnLimparHistorico.disabled = true;
        return;
    }

    historicoVazio.style.display = "none";
    btnExportar.disabled = false;
    if (btnLimparHistorico) btnLimparHistorico.disabled = false;

    // Renderiza apenas os 5 registros mais recentes, em ordem reversa (mais recentes primeiro)
    const ultimasMovimentacoes = movimentacoes.slice(-5).reverse();
    for (let i = 0; i < ultimasMovimentacoes.length; i++) {
        const mov = ultimasMovimentacoes[i];
        const tr = document.createElement("tr");
        
        // Se for o item recém adicionado, aplica classe de animação
        if (destacarId && mov.id === destacarId) {
            tr.className = "new-row";
        }

        // Estiliza o badge de finalidade
        const badgeClass = mov.finalidade.toUpperCase().includes("CONSUMO") ? "badge-consumo" : "badge-substituicao";
        
        tr.innerHTML = `
            <td>${mov.dataHora}</td>
            <td><strong>${mov.colaborador}</strong></td>
            <td>${mov.setor}</td>
            <td><span class="badge ${badgeClass}">${mov.finalidade}</span></td>
            <td><code>${mov.os}</code></td>
            <td>${mov.codigo}</td>
            <td>${mov.mascara}</td>
            <td>${mov.descricao}</td>
            <td style="text-align: center; font-weight: 600; color: var(--primary-color);">${mov.quantidade}</td>
        `;
        historicoBody.appendChild(tr);
    }
}

// Função auxiliar para codificação de Código de Barras (Code 128 Subset C)
function toCode128(text) {

    text = text.toString();
    const caracteres = Array.from(text);
    let soma = 0;

    // Percorre todos os caracteres
    for (let i = 0; i < caracteres.length; i++) {
        const caractere = caracteres[i];
        const item = fileCod128.find(x => x.char === arrayTexto[i]);
        if (item) {
            soma += item.value * (i + 1);
        }
    }

    // Calcula o checksum
    const checksum = soma-(Math.floor(soma / 103) * 103);

    // Consultar JSON do cod128 para descobrir o valor do verificador
    const caractereChecksum = fileCod128.find(x => x.value === checksum)?.char || "";

    // Strings de início e fim do código de barras (Start C e Stop)
    const start = "Ë";
    const stop = "Î";

    // Retorna o texto codificado
    return (start + text + caractereChecksum + stop);

    //versão ant - bug
    /*
    const raw = text.toString().trim();
    const normalized = raw.replace(/\D/g, '');

    if (!normalized) {
        return "";
    }

    const encoded = normalized.length % 2 === 0 ? normalized : `0${normalized}`;
    let sum = 105; // Start C code value

    for (let i = 0; i < encoded.length; i += 2) {
        const pair = encoded.slice(i, i + 2);
        const value = parseInt(pair, 10);
        sum += value * (i / 2 + 1);
    }

    const checksum = sum % 103;
    const checksumChar = checksum < 95
        ? String.fromCharCode(checksum + 32)
        : String.fromCharCode(checksum + 100);

    const startChar = String.fromCharCode(205); // Í (Start C)
    const stopChar = String.fromCharCode(206);  // Î (Stop)

    return startChar + encoded + checksumChar + stopChar;*/

    
}

function padLeft(str, length) {
    str = str ? str.toString() : "";
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}

function formatarCodigoHumanReadable(codigo) {
    codigo = codigo ? codigo.toString().replace(/\D/g, '') : "";
    if (codigo.length === 6) {
        return codigo.slice(0, 3) + "." + codigo.slice(3);
    }
    return codigo;
}

// Gera e abre uma aba de impressão otimizada em PDF contendo cartões de códigos de barra renderizados via fonte nativa
function imprimirLista() {
    let movimentacoes = [];
    const localMov = localStorage.getItem('danplas_movimentacoes');
    
    if (localMov) {
        try {
            movimentacoes = JSON.parse(localMov);
        } catch (e) {
            console.error(e);
        }
    }

    if (movimentacoes.length === 0) {
        alert("Não há movimentações para exportar.");
        return;
    }

    // Ordenar as movimentações:
    // 1. Pelo comprimento do nome do colaborador (crescente)
    // 2. Alfabeticamente em caso de empate
    movimentacoes.sort((a, b) => {
        const lenA = a.colaborador ? a.colaborador.length : 0;
        const lenB = b.colaborador ? b.colaborador.length : 0;
        if (lenA !== lenB) {
            return lenA - lenB;
        }
        return a.colaborador.localeCompare(b.colaborador);
    });

    const printWindow = window.open("", "_blank");
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Lista de Baixas - Danplas</title>
    <!-- Google Fonts: Inter e Libre Barcode 128 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Barcode+128&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }
        
        body {
            background-color: #fff;
            color: #000;
            padding: 10mm;
            font-size: 10pt;
            line-height: 1.2;
        }

        .no-print-container {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
        }

        .btn-print {
            padding: 10px 20px;
            background-color: #2563eb;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .btn-print:hover {
            background-color: #1d4ed8;
        }

        /* Top Header Layout (Landscape Optimized) */
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .header-box {
            border: 1.5px solid #000;
            padding: 4px 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
        }

        .header-box.left {
            width: 35%;
        }

        .header-box.right {
            width: 35%;
        }

        .header-box.center {
            width: 15%;
            padding: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            text-align: center;
            font-size: 9pt;
        }

        .center-cell {
            border-right: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 30px;
        }

        .center-cell:nth-child(2n) {
            border-right: none;
        }

        .center-cell:nth-child(3), .center-cell:nth-child(4) {
            border-bottom: none;
        }

        .header-title-txt {
            font-weight: bold;
            font-size: 10pt;
            text-transform: uppercase;
        }

        /* Estilização da Fonte de Código de Barras (Libre Barcode 128) */
        .barcode-font {
            font-family: 'Libre Barcode 128', cursive;
            font-size: 40pt;
            line-height: 1;
            letter-spacing: 0;
            white-space: nowrap;
            display: inline-block;
            text-transform: none;
            padding: 0 10px; /* Margem de Quiet Zone nas laterais */
        }

        /* Table Structure */
        .barcodes-table {
            border: 2px solid #000;
            width: 100%;
            display: flex;
            flex-direction: column;
        }

        .table-row {
            display: grid;
            grid-template-columns: 32px 1fr;
            border-bottom: 1.5px solid #000;
            page-break-inside: avoid;
        }

        .table-row:last-child {
            border-bottom: none;
        }

        .index-cell {
            border-right: 1.5px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10pt;
            font-weight: bold;
            background-color: #fdfdfd;
        }

        .content-cell {
            padding: 8px 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 6px;
        }

        /* Column labels under the header box (Landscape Grid columns: 18% 12% 42% 28%) */
        .column-headers-row {
            display: grid;
            grid-template-columns: 32px 1fr;
            border-bottom: 2px solid #000;
            background-color: #f7f7f7;
            font-weight: bold;
            font-size: 9.5pt;
        }

        .column-headers {
            display: grid;
            grid-template-columns: 18% 12% 42% 28%;
            padding: 6px 12px;
        }

        .label-combined {
            display: grid;
            grid-template-columns: 20% 20% 60%;
        }

        .label-combined span:nth-child(2) {
            text-align: center;
        }

        .label-combined span:nth-child(3) {
            text-align: right;
            padding-right: 12%;
        }

        .label-col.col-obs {
            text-align: right;
            padding-right: 6%;
        }

        /* Content Rows Layout */
        .content-header {
            display: grid;
            grid-template-columns: 30% 42% 28%;
            width: 100%;
            font-size: 9.5pt;
            font-weight: bold;
            color: #111;
        }

        .desc-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 5px;
        }

        .header-codes {
            display: grid;
            grid-template-columns: 20% 20% 50% 10%;
            width: 100%;
        }

        .header-codes span {
            font-size: 9pt;
        }

        .header-codes span.colab-name {
            text-align: right;
            padding-right: 5px;
        }

        .header-codes span.colab-len {
            text-align: right;
            color: #666;
            font-weight: normal;
        }

        /* Barcodes Grid */
        .content-barcodes {
            display: grid;
            grid-template-columns: 18% 12% 42% 28%;
            width: 100%;
            align-items: center;
            height: 48px;
            overflow: hidden;
        }

        .barcode-col {
            display: flex;
            align-items: center;
        }

        .barcode-col.col-codigo, .barcode-col.col-quantidade {
            justify-content: flex-start;
        }

        .barcode-col.col-combined {
            justify-content: center;
        }

        .barcode-col.col-obs {
            justify-content: flex-end;
            padding-right: 2%;
        }

        /* Human Readable Text Grid */
        .content-texts {
            display: grid;
            grid-template-columns: 18% 12% 42% 28%;
            width: 100%;
            font-size: 9pt;
            font-weight: 500;
            color: #333;
        }

        .text-col.col-codigo {
            text-align: left;
            padding-left: 10px;
        }

        .text-col.col-quantidade {
            text-align: left;
            padding-left: 20px;
        }

        .text-col.col-combined {
            display: grid;
            grid-template-columns: 60% 40%;
            padding-left: 10px;
        }

        .setor-name {
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .finalidade-name {
            text-align: right;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-right: 8%;
        }

        .text-col.col-obs {
            text-align: right;
            padding-right: 6%;
        }

        /* Media queries for printing */
        @media print {
            .no-print {
                display: none !important;
            }
            body {
                padding: 0;
            }
            @page {
                size: A4 landscape;
                margin: 8mm;
            }
        }
    </style>
</head>
<body>
    <!-- Botão de impressão (ocultado na folha de impressão) -->
    <div class="no-print-container no-print">
        <button class="btn-print" onclick="window.print()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir PDF
        </button>
    </div>

    <!-- Cabeçalho Principal da Lista de Baixa -->
    <header class="page-header">
        <div class="header-box left">
            <span class="header-title-txt">Inicio Baixa</span>
            <span class="barcode-font">${toCode128("C")}</span>
        </div>
        
        <div class="header-box center">
            <div class="center-cell" style="font-weight: bold;">Pag</div>
            <div class="center-cell" style="font-weight: bold;">95</div>
            <div class="center-cell">1</div>
            <div class="center-cell">${movimentacoes.length}</div>
        </div>

        <div class="header-box right">
            <span class="barcode-font">${toCode128("SC")}</span>
            <span class="header-title-txt">Fim Baixa</span>
        </div>
    </header>

    <!-- Tabela principal -->
    <div class="barcodes-table">
        <!-- Linha de Título de Colunas -->
        <div class="column-headers-row">
            <div class="index-cell-header"></div>
            <div class="column-headers">
                <div class="label-col col-codigo">Codigo</div>
                <div class="label-col col-quantidade">Quantidade</div>
                <div class="label-col col-combined">
                    <span class="label-grupo">Grupo</span>
                    <span class="label-finalidade">Finalidade</span>
                    <span class="label-documento">Documento</span>
                </div>
                <div class="label-col col-obs">Obs.</div>
            </div>
        </div>

        <!-- Linhas de Itens -->
        ${movimentacoes.map((mov, index) => {
            const cleanCodigo = mov.codigo.toString().replace(/\D/g, '');
            const codSetor = padLeft(mov.codigoSetor || "0", 4);
            const codFinalidade = padLeft(mov.finalidadeCodigo || "28", 5);
            const colaboradorCode = mov.colaborador.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            const combinedCode = codSetor + codFinalidade + colaboradorCode;
            const colaboradorLen = mov.colaborador ? mov.colaborador.length : 0;
            
            let osCode = mov.os.trim();
            if (!osCode || osCode === "-") {
                osCode = "0";
            }
            
            const hrCod = formatarCodigoHumanReadable(mov.codigo);
            
            // Gerar strings codificadas para a fonte Code 128 (Start, checksum e Stop inclusos)
            const encodedCod = toCode128(cleanCodigo);
            const encodedQtd = toCode128("S" + mov.quantidade);
            const encodedCombined = toCode128(combinedCode);
            const encodedObs = toCode128(osCode);
            
            return `
            <div class="table-row">
                <div class="index-cell">${index + 1}</div>
                <div class="content-cell">
                    <!-- Top header: Descrição + códigos -->
                    <div class="content-header">
                        <span class="desc-text">${mov.descricao.toUpperCase()}</span>
                        <div class="header-codes">
                            <span class="setor-code">${codSetor}</span>
                            <span class="finalidade-code">${codFinalidade}</span>
                            <span class="colab-name">${colaboradorCode}</span>
                            <span class="colab-len">${colaboradorLen}</span>
                        </div>
                    </div>

                    <!-- Middle: Barcodes renderizados via Fonte -->
                    <div class="content-barcodes">
                        <div class="barcode-col col-codigo">
                            <span class="barcode-font">${encodedCod}</span>
                        </div>
                        <div class="barcode-col col-quantidade">
                            <span class="barcode-font">${encodedQtd}</span>
                        </div>
                        <div class="barcode-col col-combined">
                            <span class="barcode-font">${encodedCombined}</span>
                        </div>
                        <div class="barcode-col col-obs">
                            <span class="barcode-font">${encodedObs}</span>
                        </div>
                    </div>

                    <!-- Bottom: Human Readable texts -->
                    <div class="content-texts">
                        <div class="text-col col-codigo">${hrCod}</div>
                        <div class="text-col col-quantidade">${mov.quantidade}</div>
                        <div class="text-col col-combined">
                            <span class="setor-name">${mov.setor.toUpperCase()}</span>
                            <span class="finalidade-name">${mov.finalidade.toUpperCase()}</span>
                        </div>
                        <div class="text-col col-obs">${mov.os}</div>
                    </div>
                </div>
            </div>
            `;
        }).join('')}
    </div>

    <!-- Script para aguardar o carregamento da fonte antes de disparar a impressão -->
    <script>
        document.fonts.ready.then(function () {
            // Pequeno delay de segurança para garantir a pintura dos glifos do código de barras
            setTimeout(() => {
                window.print();
            }, 600);
        });
    </script>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
}

// Abre um prompt de confirmação para limpar todo o histórico de movimentações
function limparHistoricoComConfirmacao() {
    const confirmar = confirm("Atenção: Tem certeza de que deseja limpar TODO o histórico de retiradas atual?");
    if (confirmar) {
        localStorage.removeItem('danplas_movimentacoes');
        renderizarHistorico();
        alert("Histórico de retiradas limpo!");
    }
}

// Limpa apenas os campos do item retirado, mantendo Colaborador e Setor para facilitar retiradas subsequentes
function limparCamposParciais() {
    inputPesquisaDescricao.value = "";
    qntda.value = "1";
    filtrarItens();
    atualizaDados();
}

// Limpa todo o formulário (inclusive funcionário e setor)
function limparFormulario() {
    document.getElementById("formRetirada").reset();
    inputPesquisaDescricao.value = "";
    qntda.value = "1";
    
    // Restaura placeholders dos selects
    popularSelectFuncionario();
    popularSelectSetor();
    popularSelectEstoque();
    atualizaDados();
    
    if (window.lucide) {
        lucide.createIcons(); // Recria ícones se houver alteração
    }
}
