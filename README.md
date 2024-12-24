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

5. Volver a `artemisa` y generar un módulo "orders":

   ```bash
   cd ../../artemisa
   npx ts-node bin/artemisa.ts module:run orders
   ```

   - Esto ejecuta el pipeline "OrdersPipeline", copiando un scaffolding y mostrando un "prompt" simulado en logs.

6. Si deseas inspeccionar un repositorio externo (por ej. `../polaris`), haz:

   ```bash
   npx ts-node bin/artemisa.ts repo:inspect --repoPath ../polaris --depth 2
   ```
   Se guardará la salida en `logs/repo-inspect-<timestamp>.txt`.

7. Personaliza los pipelines, prompts y scripts a tu gusto.

## Contacto

Creado por [Artemisa Team].
