import { analyzeRepo } from "../plugins/repoInspector"

export function inspectRepo(repoPath: string, depth: number) {
  console.log(`Inspeccionando repo en: ${repoPath}, profundidad tree: ${depth}`)
  analyzeRepo(repoPath, depth)
}
