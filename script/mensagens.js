// ============================================
// SCRIPT DE MENSAGENS E CONFIRMAÇÕES
// Centraliza alertas e confirmações do projeto
// ============================================

// Este módulo fornece uma camada única para alertas e confirmações.
// Ele é usado por funções como realizarBaixa(), exportarListaExcel(),
// limparHistoricoComConfirmacao() e outras ações da interface.

(function () {
    const alertaOriginal = window.alert;
    const confirmacaoOriginal = window.confirm;

    // Exibe uma mensagem de alerta na interface.
    // Chamado por: realizarBaixa(), exportarListaExcel(), limparHistoricoComConfirmacao(),
    // imprimirLista() e demais fluxos que precisam informar o usuário.
    function mostrarAlerta(mensagem) {
        return alertaOriginal(mensagem);
    }

    // Solicita confirmação antes de executar uma ação destrutiva ou crítica.
    // Chamado por: realizarBaixa() e limparHistoricoComConfirmacao().
    function confirmarAcao(mensagem) {
        return confirmacaoOriginal(mensagem);
    }

    window.mostrarAlerta = mostrarAlerta;
    window.confirmarAcao = confirmarAcao;

    // Mantém compatibilidade com o código existente que usa alert/confirm diretamente
    window.alert = mostrarAlerta;
    window.confirm = confirmarAcao;
})();
