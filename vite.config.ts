import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig(() => {
  const basePath = process.env.VITE_BASE_PATH;

  return {
    root: ".",
    base: basePath ? `/${basePath}/` : "/",
    build: {
      outDir: "dist", // the directory where the built files will go
      emptyOutDir: true, // clear the output directory before building
    },
    server: {
      open: true, // open the browser automatically when the server starts
    },
    test: {
      environment: "jsdom",
      globals: true,
    },
    define: { "process.env": {} },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    },
  };
});
