import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
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
  };
});
