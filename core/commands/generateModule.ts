import fs from "fs"
import path from "path"
import { runPipeline } from "../pipelines/pipelineRunner"
import { OrdersPipeline } from "../../modules/orders/pipelines"

export function generateModule(moduleName: string) {
  // En este ejemplo sólo tenemos "orders" hardcodeado. Podrías ampliar con un switch-case.
  if (moduleName === "orders") {
    console.log("Ejecutando pipeline 'Orders'...")
    runPipeline(OrdersPipeline)
  } else {
    console.log(`Módulo '${moduleName}' no definido. Implementa su pipeline.`)
  }
}
