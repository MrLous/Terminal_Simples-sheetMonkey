// ============================================
// SCRIPT DE EXPORTAÇÃO PARA EXCEL
// Funções para exportar a lista de baixas
// ============================================

// Fluxo da exportação:
// 1. carregarMovimentacoesParaProcessamento() lê as movimentações salvas no localStorage.
// 2. ordenarMovimentacoesParaRelatorio() organiza os dados para o relatório.
// 3. exportarListaExcel() gera a planilha e é acionado pelo botão do histórico.
//
// Observação: exportarListaExcel() é chamada no evento de clique do botão "Exportar Excel"
// registrado em script.js durante o DOMContentLoaded.
function carregarMovimentacoesParaProcessamento() {
    let movimentacoes = [];
    const localMov = localStorage.getItem('danplas_movimentacoes');

    if (localMov) {
        try {
            movimentacoes = JSON.parse(localMov);
        } catch (e) {
            console.error("Erro ao ler movimentações do localStorage:", e);
        }
    }

    return movimentacoes;
}

// Organiza as movimentações para o relatório e para a exportação.
// Chamado por: exportarListaExcel() em exportacao.js.
function ordenarMovimentacoesParaRelatorio(movimentacoes) {
    return [...movimentacoes].sort((a, b) => {
        const nameA = a.colaborador ? a.colaborador.toString() : "";
        const nameB = b.colaborador ? b.colaborador.toString() : "";
        const lenA = nameA.length;
        const lenB = nameB.length;
        if (lenA !== lenB) {
            return lenA - lenB;
        }
        return nameA.localeCompare(nameB);
    });
}

// Gera e baixa a planilha Excel com as movimentações registradas.
// Chamado por: evento de clique do botão btnExportarExcel, vinculado em script.js.
function exportarListaExcel() {
    const movimentacoes = ordenarMovimentacoesParaRelatorio(carregarMovimentacoesParaProcessamento());

    if (movimentacoes.length === 0) {
        mostrarAlerta("Não há movimentações para exportar.");
        return;
    }

    if (typeof XLSX === "undefined") {
        mostrarAlerta("A biblioteca de exportação para Excel não está disponível no momento.");
        return;
    }

    const dadosPlanilha = movimentacoes.map((mov) => ({
        "Código": mov.codigo || "-",
        "Descrição": mov.descricao || "-",
        "Quantidade": mov.quantidade || 0,
        "Código do Grupo (Setor)": mov.codigoSetor || "-",
        "Código Finalidade": mov.finalidadeCodigo || "-",
        "Funcionário": mov.colaborador || "-",
        "OP/OM/OH": mov.os || "-"
    }));

    const planilha = XLSX.utils.json_to_sheet(dadosPlanilha);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, planilha, "Lista de Baixas");

    planilha['!cols'] = [
        { wch: 16 },
        { wch: 40 },
        { wch: 12 },
        { wch: 18 },
        { wch: 18 },
        { wch: 24 },
        { wch: 20 }
    ];

    const nomeArquivo = `lista-baixas-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
}
