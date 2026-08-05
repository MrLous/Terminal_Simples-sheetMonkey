import { DBFFile } from "dbffile";
import fs from "fs";
import path from "path";

// Script de sincronização de dados DBF para JSON.
// Ele lê arquivos DBF de origem e gera os arquivos JSON usados pela aplicação web.
// Fluxo: converter() lê um DBF e grava o JSON correspondente; o bloco principal
// chama converter() para cada item do mapa definido abaixo.

// Caminho do servidor onde estão os arquivos DBF originais.
// Ajuste este valor conforme o ambiente local ou de rede.
const SERVER_PATH = "C:\\Users\\User\\Documents\\Juh.Doc\\juh.lab\\Terminal_Simples-sheetMonkey\\public\\db"; // ajuste

// Pasta de saída local onde serão criados os arquivos JSON convertidos.
const OUT = path.resolve("public/db");

// Mapeamento dos arquivos DBF de origem para os nomes de arquivo JSON de destino.
const MAP = [
  { dbf: "FUNCI", json: "funcionarios.json" },
  { dbf: "GDESP", json: "setor.json" },
  { dbf: "USOCO", json: "estoque.json" }
];

/**
 * Converte um arquivo DBF em JSON e grava no destino.
 *
 * @param {{ dbf: string, json: string }} param0
 */
// Converte um arquivo DBF em um JSON de destino.
// Chamado por: bloco principal do script, que percorre o array MAP e executa converter()
// para cada arquivo listado.
async function converter({ dbf, json }) {
  try {
    // Monta o caminho completo do arquivo DBF de origem.
    const origem = path.join(SERVER_PATH, `${dbf}.DBF`);

    // Monta o caminho completo do arquivo JSON de destino.
    const destino = path.join(OUT, json);

    // Abre o arquivo DBF para leitura em modo tolerante.
    // Isso permite processar arquivos antigos sem memo file associado.
    const file = await DBFFile.open(origem, { readMode: "loose" });

    // Lê todos os registros do DBF.
    const data = await file.readRecords(file.recordCount);

    // Grava os dados lidos como JSON formatado no arquivo de destino.
    fs.writeFileSync(destino, JSON.stringify(data, null, 2));
    console.log(`✅ ${json} atualizado`);
  } catch (e) {
    // Se ocorrer erro, a rotina apenas registra uma falha e mantém qualquer cache
    // anterior sem interromper o processamento dos demais arquivos.
    console.log(`⚠️ Falha em ${dbf}, mantendo cache`);
  }
}

// Ponto principal de execução do script de conversão.
// Chamado automaticamente ao rodar o arquivo com Node.js.
(async () => {
  // Garante que a pasta de saída exista antes de escrever arquivos.
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  // Processa cada item do mapa de conversão em sequência.
  for (const item of MAP) {
    await converter(item);
  }
})();
