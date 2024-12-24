import fs from "fs"
import fse from "fs-extra"
import path from "path"

export async function copyOrdersScaffolding(ctx: any) {
  const source = path.join(__dirname, "../../scaffolding")
  const target = path.join(process.cwd(), ctx.appDir)
  fse.copySync(source, target, { overwrite: false })
  console.log("Scaffolding de Orders copiado.")
}
