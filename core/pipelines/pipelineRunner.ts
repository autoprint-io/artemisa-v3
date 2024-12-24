export interface Pipeline {
  name: string
  description?: string
  steps: Step[]
}

export interface Step {
  name: string
  run: (ctx: any) => Promise<void> | void
}

interface PipelineContext {
  appDir: string
  config: any
}

import fs from "fs"
import path from "path"

export async function runPipeline(pipeline: Pipeline) {
  console.log(`=== Iniciando pipeline: ${pipeline.name} ===`)
  // Cargamos config
  const configPath = path.resolve(process.cwd(), "artemisa.config.json")
  let config: any = {}
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  } catch (err) {
    console.log("No se pudo leer artemisa.config.json, usando defaults.")
  }

  const ctx: PipelineContext = {
    appDir: config.appDirectory || "./myApp",
    config
  }

  for (const step of pipeline.steps) {
    console.log(`--- Step: ${step.name} ---`)
    try {
      await step.run(ctx)
      console.log(`✓ OK: ${step.name}`)
    } catch (err) {
      console.error(`✗ Falla en ${step.name}:`, err)
      console.log("Abortando pipeline.")
      return
    }
  }

  console.log(`=== Pipeline '${pipeline.name}' completado. ===`)
}
