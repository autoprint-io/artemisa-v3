#!/usr/bin/env ts-node

import { Command } from "commander"
import path from "path"
import { initProject } from "../core/commands/initProject"
import { generateModule } from "../core/commands/generateModule"
import { inspectRepo } from "../core/commands/inspectRepo"

const program = new Command()

program
  .name("artemisa")
  .description("Artemisa v0.3 - CLI para crear y orquestar proyectos Next.js + TS + Tailwind + shadcn/ui + Firebase + Stripe")
  .version("0.3.0")

program
  .command("init")
  .argument("<projectName>", "Nombre de la app a crear")
  .description("Crea un proyecto base con Next.js + TS + Tailwind + shadcn/ui + Firebase + Stripe")
  .action((projectName) => {
    const configPath = path.resolve(process.cwd(), "artemisa.config.json")
    initProject(projectName, configPath)
  })

program
  .command("module:run")
  .argument("<moduleName>", "Nombre del módulo (ej: orders)")
  .description("Ejecuta el pipeline para un módulo de la app")
  .action((moduleName) => {
    generateModule(moduleName)
  })

program
  .command("repo:inspect")
  .description("Ejecuta comandos de análisis para un repositorio externo")
  .option("--repoPath <path>", "Ruta al repo que deseas inspeccionar", ".")
  .option("--depth <num>", "Profundidad de tree", "2")
  .action((opts) => {
    inspectRepo(opts.repoPath, parseInt(opts.depth, 10))
  })

program.parse(process.argv)
