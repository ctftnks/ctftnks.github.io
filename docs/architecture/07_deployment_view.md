# Deployment View

The CTFTNKS game is a static client-side application that runs entirely in the user's browser.

## Infrastructure and Hosting

The application is hosted as a static site:

- **Production**: Hosted via **GitHub Pages** (using the `gh-pages` branch) or **GitLab Pages**.
- **Domain**: `https://ctftnks.github.io/`

## Build and Bundle Pipeline

We use **Vite** (ADR-004) to transform the source code and assets into an optimized production bundle:

1.  **Source**: TypeScript and Vue SFCs.
2.  **Transformation**: Vite transpiles TS to JS, bundles CSS, and processes assets.
3.  **Output**: A set of static `.js`, `.css`, and asset files (images/sounds).

## Continuous Integration and Deployment (CI/CD)

The project uses **GitHub Actions** (see `.github/workflows/ci.yml`) and **GitLab CI** (see `.gitlab-ci.yml`) for automated pipelines:

1.  **Linting**: Runs `eslint` to ensure code quality.
2.  **Testing**: Executes `vitest` (ADR-005) to verify the game engine and UI components.
3.  **Documentation**:
    - Generates API docs from TypeScript comments using **TypeDoc** (ADR-016).
    - Renders arc42 architecture documents with Mermaid diagrams.
4.  **Deployment**: Upon successful merge to the `main` branch, the production bundle is automatically pushed to the hosting environment.
