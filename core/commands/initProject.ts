import fs from "fs"
import fse from "fs-extra"
import path from "path"

export function initProject(projectName: string, configPath: string) {
  // Carga config si hace falta
  let appDirectory = "../myApp" // fallback
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    if (config.appDirectory) {
      appDirectory = config.appDirectory
    }
  } catch (err) {
    console.log("No se pudo leer artemisa.config.json, usando defaults.")
  }

  // Ruta donde se clonará la base
  const targetDir = path.join(process.cwd(), appDirectory)

  // Copiar la plantilla baseProject en targetDir
  const templateDir = path.join(__dirname, "../../..", "templates", "baseProject")
  if (!fs.existsSync(templateDir)) {
    console.error("No se encuentra la plantilla baseProject. Revisa la estructura.")
    process.exit(1)
  }

  const finalAppDir = path.join(targetDir, projectName)
  if (fs.existsSync(finalAppDir)) {
    console.error(`La carpeta ${finalAppDir} ya existe. Aborto.`)
    process.exit(1)
  }

  fse.copySync(templateDir, finalAppDir)

  // Actualizar package.json con el nombre de la app
  const pkgPath = path.join(finalAppDir, "package.json")
  const pkgData = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  pkgData.name = projectName
  fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2))

  console.log(`Proyecto base creado en: ${finalAppDir}`)
  console.log("Ejecuta:")
  console.log(`  cd ${appDirectory}/${projectName}`)
  console.log("  npm install")
  console.log("  npm run dev")
}
