import { DBFFile } from "dbffile";
import fs from "fs";
import path from "path";

const SERVER_PATH = "Z:/BANCO_DADOS"; // ajuste
const OUT = path.resolve("public/db");

const MAP = [
  { dbf: "FUNCI", json: "funcionarios.json" },
  { dbf: "GDESP", json: "setor.json" },
  { dbf: "USOCO", json: "usoco.json" }
];

async function converter({ dbf, json }) {
  try {
    const origem = path.join(SERVER_PATH, `${dbf}.DBF`);
    const destino = path.join(OUT, json);

    const file = await DBFFile.open(origem);
    const data = await file.readRecords(file.recordCount);

    fs.writeFileSync(destino, JSON.stringify(data, null, 2));
    console.log(`✅ ${json} atualizado`);
  } catch (e) {
    console.log(`⚠️ Falha em ${dbf}, mantendo cache`);
  }
}

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  for (const item of MAP) {
    await converter(item);
  }
})();
