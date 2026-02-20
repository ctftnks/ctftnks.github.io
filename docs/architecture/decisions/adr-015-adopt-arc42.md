# ADR-015: Adopt arc42 for Architecture Documentation

- **Status**: Accepted
- **Date**: 2026-02-16
- **Deciders**: Simon

## Context and Problem Statement

The project's architectural decisions and structure were becoming increasingly complex, requiring clear and thorough documentation for future maintainability and knowledge sharing.

## Decision Drivers

- **Structure**: Consistent and well-defined template for architecture.
- **Documentation-as-Code**: Easy to maintain within the project's repository.
- **Clarity**: Better communication of design choices to team members.

## Considered Options

1. **Manual Markdown Files**: Ad-hoc documentation in separate files.
2. **arc42**: Comprehensive and industry-standard architecture documentation framework.
3. **C4 Model**: Visualization-centric architecture model.

## Decision Outcome

Chosen option: **arc42** (implemented in commit `7993fa8`), because it provides a structured and battle-tested framework for documenting all aspects of the software's architecture, from goals to cross-cutting concerns.

### Consequences

- **Positive**: Consistently structured and easy-to-read documentation, improved onboarding for new developers, and better support for long-term maintenance.
- **Negative**: Initial effort to populate the template and keep it up-to-date.
- **Integration**: Works alongside ADRs (this document) and Mermaid.js diagrams (ADR-017).
