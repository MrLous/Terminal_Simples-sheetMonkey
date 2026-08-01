// ============================================
// SCRIPT DE IMPRESSÃO PDF COM CÓDIGOS DE BARRAS
// Funções para gerar e imprimir o PDF
// ============================================

// Função auxiliar para codificação de Código de Barras (Code 128 Subset C)
function toCode128(text) {
    text = text.toString();
    const caracteres = Array.from(text);
    let soma = 0;

    // Percorre todos os caracteres
    for (let i = 0; i < caracteres.length; i++) {
        const caractere = caracteres[i];
        const item = dbCod128.find(x => x.char === caracteres[i]);
        if (item) {
            soma += item.value * (i + 1);
            console.log(`Caractere: ${caractere}, Valor: ${item.value}, Posição: ${i + 1}, Soma Parcial: ${soma}`);
        }
    }

    // Calcula o checksum
    const checksum = soma-(Math.floor(soma / 103) * 103);

    // Consultar JSON do cod128 para descobrir o valor do verificador
    const caractereChecksum = dbCod128.find(x => x.value === checksum)?.char || "";

    // Strings de início e fim do código de barras (Start C e Stop)
    const start = "Ë";
    const stop = "Î";

    const returnedString = start + text + caractereChecksum + stop;
    console.log(returnedString);

    // Retorna o texto codificado
    return (returnedString);
}

// Função auxiliar para preenchimento com zeros à esquerda
function padLeft(str, length) {
    str = str ? str.toString() : "";
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}

// Formata o código para leitura humana (ex: 182001 -> 182.001)
function formatarCodigoHumanReadable(codigo) {
    codigo = codigo ? codigo.toString().replace(/\D/g, '') : "";
    if (codigo.length === 6) {
        return codigo.slice(0, 3) + "." + codigo.slice(3);
    }
    return codigo;
}


// Função principal para iniciar o processo de impressão
function imprimirLista() {
    let movimentacoes = [];
    const localMov = localStorage.getItem('danplas_movimentacoes');
    
    if (localMov) {
        try {
            movimentacoes = JSON.parse(localMov);
        } catch (e) {
            console.error("Erro ao ler movimentações do localStorage para impressão:", e);
        }
    }

    if (movimentacoes.length === 0) {
        alert("Não há movimentações para exportar.");
        return;
    }

    imprimirViaIframe(movimentacoes);
}

// Nova função para imprimir usando iframe (mais confiável que pop-up)
function imprimirViaIframe(movimentacoes) {
    movimentacoes.sort((a, b) => {
        const nameA = a.colaborador ? a.colaborador.toString() : "";
        const nameB = b.colaborador ? b.colaborador.toString() : "";
        const lenA = nameA.length;
        const lenB = nameB.length;
        if (lenA !== lenB) {
            return lenA - lenB;
        }
        return nameA.localeCompare(nameB);
    });
    
    // Gerar o HTML
    const htmlContent = gerarHtmlImpressao(movimentacoes);
    
    // Criar um iframe invisível
    const iframe = document.createElement('iframe');
    iframe.id = 'iframe-impressao-' + Date.now();
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Escrever o HTML no iframe
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(htmlContent);
    iframe.contentWindow.document.close();
    
    // Disparar impressão quando o iframe carregar
    iframe.onload = function() {
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remover o iframe após a impressão
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500);
    };
    
    console.log("Impressão via iframe iniciada");
}

// Função para gerar o HTML da impressão
function gerarHtmlImpressao(movimentacoes) {
    return `
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
            align-items: start;
            margin-top: 4px;
            margin-bottom: 4px;
        }

        .barcode-col {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .barcode-col.col-codigo, .barcode-col.col-quantidade {
            align-items: flex-start;
        }

        .barcode-col.col-combined {
            align-items: center;
        }

        .barcode-col.col-obs {
            align-items: flex-end;
            padding-right: 2%;
        }

        .barcode-legend {
            font-family: 'Inter', sans-serif;
            font-size: 8pt;
            font-weight: 600;
            color: #444;
            margin-top: 1px;
            letter-spacing: 0.05em;
        }

        .barcode-col.col-codigo .barcode-legend {
            padding-left: 10px;
        }

        .barcode-col.col-quantidade .barcode-legend {
            padding-left: 10px;
        }

        .barcode-col.col-obs .barcode-legend {
            padding-right: 10px;
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
            <div style="display: flex; flex-direction: column; align-items: center;">
                <span class="barcode-font">${toCode128("C")}</span>
                <span style="font-size: 8pt; font-weight: bold; margin-top: -4px;">C</span>
            </div>
        </div>
        
        <div class="header-box center">
            <div class="center-cell" style="font-weight: bold;">Pag</div>
            <div class="center-cell" style="font-weight: bold;">95</div>
            <div class="center-cell">1</div>
            <div class="center-cell">\${movimentacoes.length}</div>
        </div>

        <div class="header-box right">
            <div style="display: flex; flex-direction: column; align-items: center;">
                <span class="barcode-font">${toCode128("SC")}</span>
                <span style="font-size: 8pt; font-weight: bold; margin-top: -4px;">SC</span>
            </div>
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
        \${movimentacoes.map((mov, index) => {
            const codigoStr = mov.codigo ? mov.codigo.toString() : "";
            const cleanCodigo = codigoStr.replace(/\\D/g, '');
            const codSetor = padLeft(mov.codigoSetor || "0", 4);
            const codFinalidade = padLeft(mov.finalidadeCodigo || "28", 5);
            const colaboradorStr = mov.colaborador ? mov.colaborador.toString() : "";
            const colaboradorCode = colaboradorStr.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            const combinedCode = codSetor + codFinalidade + colaboradorCode;
            const colaboradorLen = colaboradorStr.length;
            
            const osStr = mov.os ? mov.os.toString() : "";
            let osCode = osStr.trim();
            if (!osCode || osCode === "-") {
                osCode = "0";
            }
            
            const hrCod = formatarCodigoHumanReadable(codigoStr);
            
            // Gerar strings codificadas para a fonte Code 128 (Start, checksum e Stop inclusos)
            const encodedCod = toCode128(cleanCodigo);
            const encodedQtd = toCode128("S" + mov.quantidade);
            const encodedCombined = toCode128(combinedCode);
            const encodedObs = toCode128(osCode);
            
            const descUpper = mov.descricao ? mov.descricao.toString().toUpperCase() : "";
            const setorUpper = mov.setor ? mov.setor.toString().toUpperCase() : "";
            const finalidadeUpper = mov.finalidade ? mov.finalidade.toString().toUpperCase() : "";
            const osDisplay = mov.os ? mov.os.toString() : "";
            
            return \`
            <div class="table-row">
                <div class="index-cell">\${index + 1}</div>
                <div class="content-cell">
                    <!-- Top header: Descrição + códigos -->
                    <div class="content-header">
                        <span class="desc-text">\${descUpper}</span>
                        <div class="header-codes">
                            <span class="setor-code">\${codSetor}</span>
                            <span class="finalidade-code">\${codFinalidade}</span>
                            <span class="colab-name">\${colaboradorCode}</span>
                            <span class="colab-len">\${colaboradorLen}</span>
                        </div>
                    </div>

                    <!-- Middle: Barcodes renderizados via Fonte -->
                    <div class="content-barcodes">
                        <div class="barcode-col col-codigo">
                            <span class="barcode-font">\${encodedCod}</span>
                            <span class="barcode-legend">\${cleanCodigo}</span>
                        </div>
                        <div class="barcode-col col-quantidade">
                            <span class="barcode-font">\${encodedQtd}</span>
                            <span class="barcode-legend">S\${mov.quantidade}</span>
                        </div>
                        <div class="barcode-col col-combined">
                            <span class="barcode-font">\${encodedCombined}</span>
                            <span class="barcode-legend">\${combinedCode}</span>
                        </div>
                        <div class="barcode-col col-obs">
                            <span class="barcode-font">\${encodedObs}</span>
                            <span class="barcode-legend">\${osCode}</span>
                        </div>
                    </div>

                    <!-- Bottom: Human Readable texts -->
                    <div class="content-texts">
                        <div class="text-col col-codigo">\${hrCod}</div>
                        <div class="text-col col-quantidade">\${mov.quantidade}</div>
                        <div class="text-col col-combined">
                            <span class="setor-name">\${setorUpper}</span>
                            <span class="finalidade-name">\${finalidadeUpper}</span>
                        </div>
                        <div class="text-col col-obs">\${osDisplay}</div>
                    </div>
                </div>
            </div>
            \`;
        }).join('')}
    </div>

    <!-- Script para aguardar o carregamento da fonte antes de disparar a impressão -->
    <script>
        function printWhenReady() {
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(function () {
                    // Pequeno delay de segurança para garantir a pintura dos glifos do código de barras
                    setTimeout(() => {
                        window.print();
                    }, 600);
                });
            } else {
                // Fallback: se não suportar fonts.ready, aguardar um tempo
                setTimeout(() => {
                    window.print();
                }, 1500);
            }
        }
        
        // Iniciar o processo de impressão quando a janela carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', printWhenReady);
        } else {
            printWhenReady();
        }
    </script>
</body>
</html>
    `;
}
