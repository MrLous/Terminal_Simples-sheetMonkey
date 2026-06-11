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

// Caminhos dos arquivos JSON de dados padrão
const fileEstoque = 'public/db/estoque.json';
const fileSetor = 'public/db/setor.json';
const fileFuncionario = 'public/db/funcionarios.json';

// Variáveis de dados globais
let estoqueItem = [];
let dbSetor = [];
let dbFuncionario = [];

// Função para desabilitar a tecla Enter em inputs de texto
function disableEnterKey(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    renderizarHistorico();

    // Event Listeners
    inputPesquisaDescricao.addEventListener("input", filtrarItens);
    selectDescricao.addEventListener("change", atualizaDados);
    selectSetor.addEventListener("change", atualizaSetor);
    btnAplicar.addEventListener("click", realizarBaixa);
    btnCancelar.addEventListener("click", limparFormulario);
    btnExportar.addEventListener("click", exportarParaExcel);
});

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
            finalidade: sectecFinalidade.options[sectecFinalidade.selectedIndex].text,
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
        return;
    }

    historicoVazio.style.display = "none";
    btnExportar.disabled = false;

    // Renderiza em ordem reversa (mais recentes primeiro)
    for (let i = movimentacoes.length - 1; i >= 0; i--) {
        const mov = movimentacoes[i];
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

// Exporta o histórico salvo no localStorage para o formato do Excel (.xlsx)
function exportarParaExcel() {
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

    // Mapeia os dados salvos exatamente para as colunas solicitadas
    const excelData = movimentacoes.map(mov => ({
        "Data/Hora": mov.dataHora,
        "Colaborador": mov.colaborador,
        "Setor": mov.setor,
        "Finalidade": mov.finalidade,
        "OS / OP / HO": mov.os,
        "Código": mov.codigo,
        "Máscara": mov.mascara,
        "Descrição": mov.descricao,
        "Quantidade": mov.quantidade
    }));

    // Cria a planilha e adiciona os dados
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-ajuste de largura de coluna simples para visualização amigável
    const colWidths = [
        { wch: 20 }, // Data/Hora
        { wch: 18 }, // Colaborador
        { wch: 22 }, // Setor
        { wch: 15 }, // Finalidade
        { wch: 15 }, // OS / OP / HO
        { wch: 10 }, // Código
        { wch: 15 }, // Máscara
        { wch: 45 }, // Descrição
        { wch: 12 }  // Quantidade
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Retiradas");

    // Formata o nome do arquivo com a data de hoje: movimentacoes_danplas_AAAAMMDD.xlsx
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const filename = `movimentacoes_danplas_${yyyy}${mm}${dd}.xlsx`;

    // Dispara o download do arquivo
    XLSX.writeFile(workbook, filename);

    // Prompt integrado pós-exportação: pergunta se deseja limpar o histórico
    setTimeout(() => {
        const limpar = confirm("Exportação concluída com sucesso!\nDeseja limpar o histórico de retiradas atual da tela?");
        if (limpar) {
            localStorage.removeItem('danplas_movimentacoes');
            renderizarHistorico();
            alert("Histórico limpo!");
        }
    }, 500);
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
