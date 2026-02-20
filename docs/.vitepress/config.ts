import { defineConfig } from "vitepress";

export default defineConfig({
  title: "CTFTNKS Architecture",
  description: "Architecture Documentation for CTFTNKS",
  base: "/docs/",
  outDir: "../dist/docs",
  srcDir: ".",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Architecture", link: "/architecture/index" },
      { text: "ADRs", link: "/architecture/decisions/index" },
      { text: "API", link: "/api/index", target: "_blank" },
    ],
    sidebar: [
      {
        text: "Architecture (arc42)",
        items: [
          { text: "01. Introduction and Goals", link: "/architecture/01_introduction_and_goals" },
          { text: "02. Architecture Constraints", link: "/architecture/02_architecture_constraints" },
          { text: "03. System Scope and Context", link: "/architecture/03_system_scope_and_context" },
          { text: "04. Solution Strategy", link: "/architecture/04_solution_strategy" },
          { text: "05. Building Block View", link: "/architecture/05_building_block_view" },
          { text: "06. Runtime View", link: "/architecture/06_runtime_view" },
          { text: "07. Deployment View", link: "/architecture/07_deployment_view" },
          { text: "08. Cross-cutting Concepts", link: "/architecture/08_concepts" },
          { text: "09. Design Decisions", link: "/architecture/09_design_decisions" },
          { text: "10. Quality Requirements", link: "/architecture/10_quality_requirements" },
          { text: "11. Risks and Technical Debt", link: "/architecture/11_risks_and_technical_debt" },
          { text: "12. Glossary", link: "/architecture/12_glossary" },
        ],
      },
      {
        text: "Architecture Decisions (ADRs)",
        collapsed: true,
        items: [
          { text: "Index", link: "/architecture/decisions/index" },
          { text: "ADR-001: Custom Physics", link: "/architecture/decisions/adr-001-custom-2d-physics" },
          { text: "ADR-002: Map Generation", link: "/architecture/decisions/adr-002-map-generation-strategy" },
          { text: "ADR-003: Reactive Store", link: "/architecture/decisions/adr-003-custom-reactive-store" },
          { text: "ADR-004: Vite Build Tool", link: "/architecture/decisions/adr-004-use-vite-as-build-tool" },
          { text: "ADR-005: Vitest Strategy", link: "/architecture/decisions/adr-005-testing-strategy-with-vitest" },
          { text: "ADR-006: Asset Management", link: "/architecture/decisions/adr-006-centralized-static-assets" },
          { text: "ADR-007: TypeScript Migration", link: "/architecture/decisions/adr-007-migration-to-typescript" },
          { text: "ADR-008: Vue 3 Migration", link: "/architecture/decisions/adr-008-migrate-to-vue3" },
          { text: "ADR-009: Entity Hierarchy", link: "/architecture/decisions/adr-009-inheritance-based-entities" },
          { text: "ADR-010: Decoupled AI", link: "/architecture/decisions/adr-010-decoupled-bot-ai" },
          { text: "ADR-011: Engine Updatables", link: "/architecture/decisions/adr-011-game-engine-updatable-hierarchy" },
          { text: "ADR-012: Dependency Injection", link: "/architecture/decisions/adr-012-dependency-injection-for-game-entities" },
          { text: "ADR-013: Canvas Rendering", link: "/architecture/decisions/adr-013-canvas-based-rendering" },
          { text: "ADR-014: Spatial Partitioning", link: "/architecture/decisions/adr-014-grid-based-spatial-partitioning" },
          { text: "ADR-015: arc42 Adoption", link: "/architecture/decisions/adr-015-adopt-arc42" },
          { text: "ADR-016: Automated API Docs", link: "/architecture/decisions/adr-016-automated-api-docs" },
          { text: "ADR-017: Mermaid Diagrams", link: "/architecture/decisions/adr-017-mermaid-diagrams" },
        ],
      },
      {
        text: "Development",
        items: [
          { text: "Adding Power-ups", link: "/development/adding-powerups" },
          { text: "Adding Weapons", link: "/development/adding-weapons" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/ctftnks/ctftnks.github.io" }],
  },
});
