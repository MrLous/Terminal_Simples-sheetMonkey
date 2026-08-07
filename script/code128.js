// ============================================
// SCRIPT DE CÓDIGO DE BARRAS CODE 128
// Funções utilitárias para geração de strings de barras
// ============================================

// Gera uma representação de texto em Code 128 Subset C.
// Recebe uma string ou número e retorna o conteúdo codificado em formato legível
// para a fonte usada na impressão.
function toCode128(text) {
    text = text.toString();
    const caracteres = Array.from(text);
    let soma = 0;

    for (let i = 0; i < caracteres.length; i++) {
        const caractere = caracteres[i];
        const item = dbCod128.find(x => x.char === caractere);
        if (item) {
            soma += item.value * (i + 1);
        }
    }

    const checksum = soma - (Math.floor(soma / 103) * 103);
    const caractereChecksum = dbCod128.find(x => x.value === checksum)?.char || "";
    const start = "Ë";
    const stop = "Î";

    return start + text + caractereChecksum + stop;
}
