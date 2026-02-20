# ADR-017: Mermaid.js for Architecture Diagrams

- **Status**: Accepted
- **Date**: 2026-02-20
- **Deciders**: Simon

## Context and Problem Statement

Visual representations of our architecture (e.g., building block views, runtime sequences) are essential for understanding the system. We need a way to create and maintain these diagrams without relying on external design tools.

## Decision Drivers

- **Documentation-as-Code**: Easy to edit and version alongside the documentation.
- **Simplicity**: Markdown-based syntax for defining diagrams.
- **Integration**: Direct support in GitHub, GitLab, and many Markdown editors.

## Considered Options

1. **Static Images (PNG/SVG)**: Created with external tools and checked into the repository.
2. **Mermaid.js**: Text-based diagramming language rendered directly from Markdown.
3. **PlantUML**: More feature-rich but requires a separate server or JAR file for rendering.

## Decision Outcome

Chosen option: **Mermaid.js** (implemented in commit `9af6391`), because it offers the best balance of features, ease of use, and native integration with the project's documentation and hosting platforms.

### Consequences

- **Positive**: Easy to maintain and version, improved readability within the documentation files, and better support for collaboration.
- **Negative**: Limited styling options compared to dedicated design tools.
- **Integration**: Leveraged by the arc42 documentation (ADR-015).
