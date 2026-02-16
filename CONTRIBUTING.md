# Contributing to CTFTNKS

Thank you for your interest in contributing to CTFTNKS! This project is a community-driven effort, and we welcome all kinds of contributions.

## Getting Started

1. **Fork the Repository**: Create your own copy of the project.
2. **Clone Locally**: `git clone https://github.com/YOUR_USERNAME/ctftnks.github.io.git`
3. **Install Dependencies**: `npm install`
4. **Start Development Server**: `npm run dev`

## Development Workflow

- **Branching**: Create a new branch for every feature or bugfix (e.g., `feature/new-weapon-laser`).
- **Code Style**: We use Prettier and ESLint. You can run `npm run format` and `npm run lint` to ensure your code follows the project's standards.
- **Documentation**:
  - If you add new classes or methods, please use **JSDoc** comments.
  - You can preview the API documentation by running `npm run docs`.
  - If you add a new component or change the architecture, update the relevant files in `docs/`.

## Testing

We use **Vitest** for unit testing. Please ensure all tests pass before submitting a Pull Request.

- Run all tests: `npm test`
- Run tests in watch mode: `npm run test-live`
- Check coverage: `npm run coverage`

## Submitting Changes

1. **Conventional Commits**: We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. This helps us maintain a clear and automated changelog.
2. Commit your changes with clear, concise commit messages.
3. Push your branch to your fork.
4. Open a Pull Request (PR) against the `main` branch.
5. Ensure the CI pipeline passes.

Once submitted, your PR will be reviewed as soon as possible. Thank you for making CTFTNKS better!
