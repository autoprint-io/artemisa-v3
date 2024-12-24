import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function analyzeRepo(repoPath: string, depth: number) {
  // Creamos logs/ si no existe
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs")
  }
  const outFile = path.join("logs", `repo-inspect-${Date.now()}.txt`)

  let output = `Repo: ${repoPath}\nDepth: ${depth}\n\n`

  // 1) Tree
  try {
    const treeCmd = `tree -L ${depth} ${repoPath}`
    const treeResult = childProcess.execSync(treeCmd).toString()
    output += "==== TREE OUTPUT ====\n" + treeResult + "\n"
  } catch (err) {
    output += "Error ejecutando tree\n"
  }

  // 2) Conteo .ts
  try {
    const tsCountCmd = `find ${repoPath} -type f -name "*.ts" | wc -l`
    const tsCount = childProcess.execSync(tsCountCmd).toString().trim()
    output += `\nArchivos TS: ${tsCount}\n`
  } catch (err) {
    output += "\nError conteo .ts\n"
  }

  fs.writeFileSync(outFile, output)
  console.log(`Resultado de inspección guardado en: ${outFile}`)
}
