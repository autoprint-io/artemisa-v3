import { Pipeline } from "../../../core/pipelines/pipelineRunner"
import { copyOrdersScaffolding } from "./stepsScaffolding"
import { promptIAForOrders } from "./stepsPromptIA"
import { buildAndTest } from "./stepsBuildAndTest"

export const OrdersPipeline: Pipeline = {
  name: "Orders",
  steps: [
    {
      name: "Scaffolding Base Orders",
      run: async (ctx) => {
        await copyOrdersScaffolding(ctx)
      }
    },
    {
      name: "IA Prompt for Orders logic",
      run: async (ctx) => {
        await promptIAForOrders(ctx)
      }
    },
    {
      name: "Build and Test",
      run: async (ctx) => {
        await buildAndTest(ctx)
      }
    }
  ]
}
