// ============================================
// SCRIPT DE MENSAGENS E CONFIRMAÇÕES
// Centraliza alertas e confirmações do projeto
// ============================================

(function () {
    const alertaOriginal = window.alert;
    const confirmacaoOriginal = window.confirm;

    function mostrarAlerta(mensagem) {
        return alertaOriginal(mensagem);
    }

    function confirmarAcao(mensagem) {
        return confirmacaoOriginal(mensagem);
    }

    window.mostrarAlerta = mostrarAlerta;
    window.confirmarAcao = confirmarAcao;

    // Mantém compatibilidade com o código existente que usa alert/confirm diretamente
    window.alert = mostrarAlerta;
    window.confirm = confirmarAcao;
})();
