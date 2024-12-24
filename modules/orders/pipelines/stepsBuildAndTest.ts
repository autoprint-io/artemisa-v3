import * as childProcess from 'child_process';
import * as path from 'path';

export async function buildAndTest(ctx: any) {
  const appPath = path.join(process.cwd(), ctx.appDir)
  try {
    childProcess.execSync("npm run build", { cwd: appPath, stdio: "inherit" })
    childProcess.execSync("npm run test", { cwd: appPath, stdio: "inherit" })
  } catch (err) {
    throw new Error("Falló build o test. Revisa logs.")
  }
}
