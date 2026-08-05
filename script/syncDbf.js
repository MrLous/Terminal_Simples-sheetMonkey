import { DBFFile } from "dbffile";
import fs from "fs";
import path from "path";

// Caminho do servidor onde estão os arquivos DBF originais.
// Ajuste este valor conforme o ambiente local ou de rede.
const SERVER_PATH = "Z:/BANCO_DADOS"; // ajuste

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
async function converter({ dbf, json }) {
  try {
    // Monta o caminho completo do arquivo DBF de origem.
    const origem = path.join(SERVER_PATH, `${dbf}.DBF`);

    // Monta o caminho completo do arquivo JSON de destino.
    const destino = path.join(OUT, json);

    // Abre o arquivo DBF para leitura.
    const file = await DBFFile.open(origem);

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

(async () => {
  // Garante que a pasta de saída exista antes de escrever arquivos.
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  // Processa cada item do mapa de conversão em sequência.
  for (const item of MAP) {
    await converter(item);
  }
})();
