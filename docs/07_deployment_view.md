# 7. Deployment View

The application is deployed as a static website.

## 7.1 Infrastructure

- **Build System:** `Vite` bundles the TypeScript and Vue files into static assets (`index.html`, `js/`, `css/`).
- **Environment:** Any HTTP server capable of serving static files.
- **Hosting:** GitHub Pages is the primary production environment.

## 7.2 Release Process

1.  Code is pushed to the `main` branch.
2.  GitHub Actions (`.github/workflows/ci.yml`) runs tests.
3.  (Hypothetically/Typically) A deployment workflow builds the project (`npm run build`) and pushes the `dist/` folder to the `gh-pages` branch.
