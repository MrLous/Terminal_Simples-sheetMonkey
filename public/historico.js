// ============================================
// SCRIPT DE HISTÓRICO DE RETIRADAS
// Funções para gerenciar e renderizar o histórico
// ============================================

// Registra uma nova movimentação na retirada
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
            id: Date.now(),
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
        filtrarItens();
        limparCamposParciais();
        renderizarHistorico(novaMovimentacao.id);

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
        
        if (destacarId && mov.id === destacarId) {
            tr.className = "new-row";
        }

        const desc = mov.descricao ? mov.descricao.toString() : "";
        const descTruncada = desc.length > 50 ? desc.slice(0, 50) + "..." : desc;
        
        tr.innerHTML = `
            <td><strong>${mov.colaborador}</strong></td>
            <td>${mov.setor}</td>
            <td><code>${mov.os}</code></td>
            <td>${mov.codigo}</td>
            <td>${descTruncada}</td>
            <td style="text-align: center; font-weight: 600; color: var(--primary-color);">${mov.quantidade}</td>
        `;
        historicoBody.appendChild(tr);
    }
}

// Limpa o histórico com confirmação
function limparHistoricoComConfirmacao() {
    const confirmar = confirm("Atenção: Tem certeza de que deseja limpar TODO o histórico de retiradas atual?");
    if (confirmar) {
        localStorage.removeItem('danplas_movimentacoes');
        renderizarHistorico();
        alert("Histórico de retiradas limpo com sucesso!");
    }
}

// Limpa os campos do formulário relacionados ao item (mantém funcionário e setor)
function limparCamposParciais() {
    selectDescricao.value = "";
    inputPesquisaDescricao.value = "";
    inputUnidade.value = "";
    inputValor.value = "1.00";
    codigoItem.value = "0";
    qntda.value = "1";
}

// Filtra os itens do select de descrição com base no texto digitado
function filtrarItens() {
    const pesquisa = inputPesquisaDescricao.value.toLowerCase();
    const opcoes = selectDescricao.querySelectorAll("option");

    opcoes.forEach(opcao => {
        if (opcao.value === "") {
            opcao.style.display = "block";
            return;
        }

        const descricao = opcao.textContent.toLowerCase();
        if (pesquisa === "" || descricao.includes(pesquisa)) {
            opcao.style.display = "block";
        } else {
            opcao.style.display = "none";
        }
    });
}

// Atualiza os dados do item quando selecionado
function atualizaDados() {
    const itemDescricao = selectDescricao.value;
    if (!itemDescricao) {
        limparCamposParciais();
        return;
    }

    const item = estoqueItem.find(i => i.DESCRICAO === itemDescricao);
    if (!item) return;

    inputUnidade.value = item.UNIDADE || "PC";
    inputValor.value = (item.VALOR || "1.00").toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    codigoItem.value = item.CODIGO || "0";
    qntda.value = "1";
}

// Atualiza o código do setor quando selecionado
function atualizaSetor() {
    const setorSelecionado = selectSetor.value;
    const setor = dbSetor.find(s => s.DESCRICAO === setorSelecionado);
    codigoSetor.value = setor ? setor.CODIGO : "0";
}

// Limpa todos os campos do formulário
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
