# ADR-004: Use Vite as Build Tool

- **Status**: Accepted
- **Date**: 2025-12-30
- **Deciders**: Simon

## Context and Problem Statement

As the project moved from simple scripts to a structured application (Vue, TypeScript), a modern build tool was required for bundling assets, handling imports, and providing a fast developer experience.

## Decision Drivers

- **Speed**: Fast Hot Module Replacement (HMR) and cold starts.
- **Ease of Use**: Minimal configuration compared to Webpack or Parcel.
- **Ecosystem**: Strong integration with Vue and TypeScript.

## Considered Options

1. **Vite**: Next-generation frontend tooling.
2. **Webpack**: The industry-standard bundler, but potentially slower and more complex to configure.
3. **Parcel**: Zero-config bundler, but less specialized for Vue/TS compared to Vite.
4. **No bundler at all**: vanilla approach, but lacks support for minifaction, cache busting, npm packages without CDN

## Decision Outcome

Chosen option: **Vite** (implemented in commits `caa1a94` and `d50f3a1`), because it offers the fastest development environment and seamless integration with Vue 3 and TypeScript.

### Consequences

- **Positive**: Extremely fast development cycles and optimized production builds.
- **Negative**: Adds another tool and configuration file to the project.
