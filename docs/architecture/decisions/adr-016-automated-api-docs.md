# ADR-016: Automated API Documentation with TypeDoc

- **Status**: Accepted
- **Date**: 2026-02-16
- **Deciders**: Simon

## Context and Problem Statement

As the project grew, maintaining manual API documentation for its complex classes (game, entities, weapons) became cumbersome. Automated documentation was needed to keep the docs in sync with the code.

## Decision Drivers

- **Accuracy**: Docs are always up-to-date with the latest code changes.
- **Efficiency**: No manual document writing for the API.
- **Accessibility**: Easy access to the API structure for developers.

## Considered Options

1. **Manual Documentation**: Writing API details in Markdown files.
2. **TypeDoc**: Automated documentation tool for TypeScript.
3. **JSDoc**: Traditional documentation tool for JavaScript.

## Decision Outcome

Chosen option: **TypeDoc** (automatic rendering in CI pipeline implemented in commit `c1a9ece`), because it's the standard tool for TypeScript-based projects and integrates well with the CI/CD pipeline.

### Consequences

- **Positive**: Consistently accurate and professional-looking API documentation.
- **Negative**: Requires maintenance of TypeDoc configuration and CI integration.
- **Integration**: Linked to the CI process for automatic rendering and hosting.
