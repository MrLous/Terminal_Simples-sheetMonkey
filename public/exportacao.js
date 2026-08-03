// ============================================
// SCRIPT DE EXPORTAÇÃO PARA EXCEL
// Funções para exportar a lista de baixas
// ============================================

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

function exportarListaExcel() {
    const movimentacoes = ordenarMovimentacoesParaRelatorio(carregarMovimentacoesParaProcessamento());

    if (movimentacoes.length === 0) {
        alert("Não há movimentações para exportar.");
        return;
    }

    if (typeof XLSX === "undefined") {
        alert("A biblioteca de exportação para Excel não está disponível no momento.");
        return;
    }

    const dadosPlanilha = movimentacoes.map((mov) => ({
        "Data/Hora": mov.dataHora || "-",
        "Colaborador": mov.colaborador || "-",
        "Setor": mov.setor || "-",
        "Código do Setor": mov.codigoSetor || "-",
        "Finalidade": mov.finalidade || "-",
        "OS / OP / HO": mov.os || "-",
        "Código": mov.codigo || "-",
        "Máscara": mov.mascara || "-",
        "Descrição": mov.descricao || "-",
        "Quantidade": mov.quantidade || 0
    }));

    const planilha = XLSX.utils.json_to_sheet(dadosPlanilha);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, planilha, "Lista de Baixas");

    planilha['!cols'] = [
        { wch: 16 },
        { wch: 24 },
        { wch: 22 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 40 },
        { wch: 12 }
    ];

    const nomeArquivo = `lista-baixas-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
}
