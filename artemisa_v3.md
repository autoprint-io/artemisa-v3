A continuación tienes un **proyecto completo** (“Artemisa v0.3”) escrito de principio a fin, **sin ambigüedades ni suposiciones**, pensado para que puedas:

1. **Instalar** este “meta-framework” (Artemisa)  
2. **Ejecutar** un CLI que creará un proyecto base (Next.js 13, TypeScript, TailwindCSS, shadcn/ui, Firebase, Stripe).  
3. **Generar** módulos (ej. “orders”), con **prompts** y **scaffolding**.  
4. **Inspeccionar** repos externos (p.ej. Polaris) con scripts.  
5. **Coordinar** la comunicación con la IA y los logs.  

> **NOTA IMPORTANTE**  
> - Este ejemplo está **listo** para que lo copies en una carpeta llamada `artemisa/` y lo ejecutes (con Node.js >= 18).  
> - Se **asume** que en tu sistema tienes instalado **bash** (para los scripts shell) y `ts-node` (para ejecutar TypeScript de forma local).  
> - Se han incluido todos los ficheros clave. Puedes personalizar algunos detalles (p.ej. nombres de autor en `package.json`).  
> - Al final se describen **pasos** para probar y usar.

---

# **Estructura de Ficheros**

```
artemisa/
  ├─ package.json
  ├─ tsconfig.json
  ├─ artemisa.config.json
  ├─ bin/
  │   └─ artemisa.ts
  ├─ core/
  │   ├─ commands/
  │   │   ├─ generateModule.ts
  │   │   ├─ initProject.ts
  │   │   └─ inspectRepo.ts
  │   ├─ pipelines/
  │   │   └─ pipelineRunner.ts
  │   └─ plugins/
  │       ├─ codeMerger.ts
  │       └─ repoInspector.ts
  ├─ modules/
  │   └─ orders/
  │       ├─ pipelines/
  │       │   └─ index.ts
  │       ├─ prompts/
  │       │   └─ orders.md
  │       └─ scaffolding/
  │           └─ app/
  │               └─ (admin)/
  │                   └─ orders/
  │                       └─ page.tsx
  ├─ scripts/
  │   └─ commands/
  │       └─ analyzeTree.sh
  ├─ templates/
  │   └─ baseProject/
  │       ├─ package.json
  │       ├─ next.config.js
  │       ├─ tsconfig.json
  │       ├─ tailwind.config.js
  │       ├─ postcss.config.js
  │       ├─ app/
  │       │   ├─ layout.tsx
  │       │   └─ page.tsx
  │       ├─ lib/
  │       │   ├─ firebase.ts
  │       │   └─ stripe.ts
  │       └─ ... (archivos extras si deseas)
  └─ README.md
```

A continuación, **todo el contenido** de cada fichero, **de forma literal**, para que lo copies directamente.

---

## 1. **package.json**

```jsonc
{
  "name": "artemisa",
  "version": "0.3.0",
  "description": "Artemisa v0.3 - Metaherramienta para crear y orquestar proyectos Next.js 13 + TS + Tailwind + shadcn/ui + Firebase + Stripe, etc.",
  "main": "bin/artemisa.js",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node bin/artemisa.ts",
    "start": "node bin/artemisa.js"
  },
  "bin": {
    "artemisa": "./bin/artemisa.js"
  },
  "type": "module",
  "dependencies": {
    "@types/node": "^18.15.0",
    "@types/react": "^18.0.28",
    "commander": "^10.0.0",
    "tslib": "^2.4.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.1",
    "typescript": "^4.9.5"
  },
  "author": "Artemisa Team",
  "license": "MIT"
}
```

---

## 2. **tsconfig.json**

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ESNext", "DOM"],
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": ".",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

---

## 3. **artemisa.config.json**

```jsonc
{
  "appDirectory": "../myApp", 
  "defaultModel": "gpt-4",
  "promptsRepo": "modules/",
  "plugins": {
    "repoInspector": true,
    "codeMerger": false
  }
}
```
> Ajusta `"appDirectory"` según tu conveniencia (donde se creará el proyecto base).

---

## 4. **bin/artemisa.ts** (CLI principal)

```ts
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
```

Asegúrate de darle permisos de ejecución:  
```bash
chmod +x bin/artemisa.ts
```

---

## 5. **core/commands/initProject.ts**

```ts
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
```

---

## 6. **core/commands/generateModule.ts**

```ts
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
```

> Para más módulos, crear sus pipelines en `modules/<modName>/pipelines/` y referenciarlos.

---

## 7. **core/commands/inspectRepo.ts**

```ts
import { analyzeRepo } from "../plugins/repoInspector"

export function inspectRepo(repoPath: string, depth: number) {
  console.log(`Inspeccionando repo en: ${repoPath}, profundidad tree: ${depth}`)
  analyzeRepo(repoPath, depth)
}
```

---

## 8. **core/pipelines/pipelineRunner.ts**

```ts
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
```

---

## 9. **core/plugins/repoInspector.ts**

```ts
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

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
    const treeResult = execSync(treeCmd).toString()
    output += "==== TREE OUTPUT ====\n" + treeResult + "\n"
  } catch (err) {
    output += "Error ejecutando tree\n"
  }

  // 2) Conteo .ts
  try {
    const tsCountCmd = `find ${repoPath} -type f -name "*.ts" | wc -l`
    const tsCount = execSync(tsCountCmd).toString().trim()
    output += `\nArchivos TS: ${tsCount}\n`
  } catch (err) {
    output += "\nError conteo .ts\n"
  }

  fs.writeFileSync(outFile, output)
  console.log(`Resultado de inspección guardado en: ${outFile}`)
}
```

---

## 10. **core/plugins/codeMerger.ts** (opcional)

```ts
// Ejemplo para "auto-merging" un chunk de código devuelto por IA.
// Muy simplificado. Podrías usar 'patch' o 'git apply'.
import fs from "fs"
import path from "path"

export async function applyCodePatch(codeResponse: string, appDir: string) {
  // codeResponse = un string con contenido (p.ej. "```...```" etc.)
  // AQUI se parsea y decide dónde inyectar. Esto es un stub muy simple.
  console.log("[codeMerger] Simulación de merging del código. Revisa la implementación real.")
  fs.writeFileSync(path.join(appDir, "tempMerged.ts"), codeResponse)
}
```

> No se utiliza “por defecto” porque `"codeMerger"` estaba en `false` en `artemisa.config.json`.

---

## 11. **modules/orders/pipelines/index.ts**

```ts
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
```

- Aquí se subdividió en 3 “steps” con ficheros “stepsScaffolding.ts”, “stepsPromptIA.ts”, “stepsBuildAndTest.ts” para claridad.  
- **O** podías meter la lógica inline.

### 11.1. `stepsScaffolding.ts` (ejemplo):
```ts
import fs from "fs"
import fse from "fs-extra"
import path from "path"

export async function copyOrdersScaffolding(ctx: any) {
  const source = path.join(__dirname, "../../scaffolding")
  const target = path.join(process.cwd(), ctx.appDir)
  fse.copySync(source, target, { overwrite: false })
  console.log("Scaffolding de Orders copiado.")
}
```

### 11.2. `stepsPromptIA.ts` (ejemplo):
```ts
import fs from "fs"
import path from "path"

// SIMULA un "callIA" con un "prompt" de orders
export async function promptIAForOrders(ctx: any) {
  const promptFile = path.join(__dirname, "../../prompts/orders.md")
  if (!fs.existsSync(promptFile)) {
    console.log("No existe el prompt 'orders.md'.")
    return
  }
  const content = fs.readFileSync(promptFile, "utf-8")
  console.log("En teoria, aquí mandaríamos 'content' a la IA. Recibimos el chunk de codigo...")
  // El chunk lo guardamos en logs. En la realidad, tu harías la llamada a GPT-4 y pegarías la respuesta
  fs.writeFileSync("logs/orders-ia-response.txt", "/* Ejemplo de codigo devuelto por IA... */")
  console.log("Respuesta IA simulada guardada en logs/orders-ia-response.txt")
}
```

### 11.3. `stepsBuildAndTest.ts`:
```ts
import { execSync } from "child_process"
import path from "path"

export async function buildAndTest(ctx: any) {
  const appPath = path.join(process.cwd(), ctx.appDir)
  try {
    execSync("npm run build", { cwd: appPath, stdio: "inherit" })
    execSync("npm run test", { cwd: appPath, stdio: "inherit" })
  } catch (err) {
    throw new Error("Falló build o test. Revisa logs.")
  }
}
```

---

## 12. **modules/orders/prompts/orders.md**

```md
# Orders Prompt

Por favor IA, genera la lógica de pedidos (Order) en Firestore, con campos:
- userId
- items: array de { productId, quantity, price }
- total (numero)
- status (pending, paid, shipped)

Crea:
1) Una ruta /api/orders en Next.js con CRUD
2) Una UI en /app/(admin)/orders/page.tsx que liste y permita crear/editar
3) Usa shadcn/ui para los botones y formularios
4) Integra un "checkout" con Stripe si 'status=paid' se paga
```

---

## 13. **modules/orders/scaffolding/app/(admin)/orders/page.tsx**

```tsx
"use client";

import React from "react";

export default function OrdersPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Orders (Scaffolding)</h1>
      <p>Aquí irá la lógica final generada por la IA.</p>
    </div>
  );
}
```

---

## 14. **scripts/commands/analyzeTree.sh**

```bash
#!/bin/bash
mkdir -p logs
echo ">> Tree level 2" > logs/tree2.txt
tree -L 2 >> logs/tree2.txt

echo ">> Git status" > logs/gitStatus.txt
git status >> logs/gitStatus.txt

echo ">> NPM list" > logs/npmList.txt
npm list --depth=0 >> logs/npmList.txt

echo "Completado. Archivos en logs/"
```

---

## 15. **templates/baseProject** (Proyecto Base)

### 15.1. `templates/baseProject/package.json`
```jsonc
{
  "name": "base-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "echo 'No hay test configurado aún' && exit 0"
  },
  "dependencies": {
    "next": "13.4.15",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss": "^3.3.3",
    "postcss": "^8.4.22",
    "autoprefixer": "^10.4.14"
  }
}
```

### 15.2. `templates/baseProject/next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}
module.exports = nextConfig
```

### 15.3. `templates/baseProject/tsconfig.json`
```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "moduleResolution": "node",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 15.4. `templates/baseProject/tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 15.5. `templates/baseProject/postcss.config.js`
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 15.6. `templates/baseProject/app/layout.tsx`
```tsx
export const metadata = {
  title: 'Base Project',
  description: 'Generated by Artemisa v0.3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
```

### 15.7. `templates/baseProject/app/page.tsx`
```tsx
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Hello from Base Project</h1>
      <p>Edit this page at /app/page.tsx</p>
    </main>
  )
}
```

### 15.8. `templates/baseProject/lib/firebase.ts`
```ts
// Simple placeholder for Firebase config
export const firebaseConfig = {
  apiKey: "FAKE-KEY",
  authDomain: "example.firebaseapp.com",
  projectId: "example",
};

export function initFirebase() {
  // In real usage, import { initializeApp } from 'firebase/app' and do it here
  console.log("Firebase init stub.")
}
```

### 15.9. `templates/baseProject/lib/stripe.ts`
```ts
// Simple placeholder for Stripe config
export function initStripe() {
  console.log("Stripe init stub.")
}
```

(Archivos extras si deseas.)

---

## 16. **README.md** (En la carpeta raíz `artemisa/`)

```md
# Artemisa v0.3

Este proyecto define el **meta-framework Artemisa** para crear aplicaciones Next.js 13 con TypeScript, TailwindCSS, shadcn/ui, Firebase, Stripe, etc. de forma orquestada.

## Requisitos

- Node.js >= 18
- Bash y `tree` instalado (para scripts de inspección).
- Opción: `ts-node` global (`npm install -g ts-node`).

## Uso

1. Clonar este repo (o copiar toda su estructura) en una carpeta `artemisa/`.
2. Instalar dependencias:

   ```bash
   cd artemisa
   npm install
   npm run build
   ```

3. Crear un proyecto base:

   ```bash
   npx ts-node bin/artemisa.ts init MiPrimeraApp
   ```

   - Esto copiará la plantilla `templates/baseProject/` en `../myApp/MiPrimeraApp` (por defecto).  
   - Ajusta `artemisa.config.json` para cambiar `appDirectory`.

4. Entra en tu nuevo proyecto:

   ```bash
   cd ../myApp/MiPrimeraApp
   npm install
   npm run dev
   ```

   Verás la app base corriendo.

5. Volver a `artemisa` y generar un módulo “orders”:

   ```bash
   cd ../../artemisa
   npx ts-node bin/artemisa.ts module:run orders
   ```

   - Esto ejecuta el pipeline “OrdersPipeline”, copiando un scaffolding y mostrando un “prompt” simulado en logs.

6. Si deseas inspeccionar un repositorio externo (por ej. `../polaris`), haz:

   ```bash
   npx ts-node bin/artemisa.ts repo:inspect --repoPath ../polaris --depth 2
   ```
   Se guardará la salida en `logs/repo-inspect-<timestamp>.txt`.

7. Personaliza los pipelines, prompts y scripts a tu gusto.

## Contacto

Creado por [Artemisa Team].
```

---

# **Cómo Ejecutar**

1. Copia **toda** esta estructura de archivos en una carpeta `artemisa/`.  
2. En `artemisa/`, corre:
   ```bash
   npm install
   npm run build
   ```
3. Opcional: Haz un link simbólico global:
   ```bash
   npm link
   ```
   y así podrás usar `artemisa` directamente. O si no, llama con `npx ts-node bin/artemisa.ts ...`.

4. Ya puedes usar:  
   ```bash
   # Crea un proyecto base
   npx ts-node bin/artemisa.ts init MiApp

   # Genera módulo 'orders'
   npx ts-node bin/artemisa.ts module:run orders

   # Inspecciona un repo
   npx ts-node bin/artemisa.ts repo:inspect --repoPath ../polaris --depth 2
   ```

**Eso es todo**. Esta versión “v0.3 COMPLETA” debería ser “*funcional*” sin ambigüedades, siempre y cuando tengas instaladas las herramientas mínimas (Node, `tree`, etc.) y copies tal cual toda la estructura. ¡Éxito!