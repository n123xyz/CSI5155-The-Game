import { serve } from "bun";
import { join } from "path";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname === "/" || pathname === "") pathname = "/index.html";

    // Auto-build bundle.js on request
    if (pathname === "/bundle.js") {
      const buildResult = await Bun.build({
        entrypoints: ["./src/main.ts"],
        target: "browser",
        minify: false,
      });
      if (!buildResult.success) {
        console.error(buildResult.logs);
        return new Response("Build failed: " + JSON.stringify(buildResult.logs), { 
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
      return new Response(await buildResult.outputs[0].arrayBuffer(), {
        headers: { 
          "Content-Type": "application/javascript",
          "Cache-Control": "no-cache"
        },
      });
    }

    const filePath = join("./public", pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response("Not found: " + pathname, { status: 404 });
  },
});

console.log(`🎮 CSI 5155 ML Game Server running at http://localhost:${PORT}`);
