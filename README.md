# TypeScript Coding Agent Starter

A small, strict TypeScript foundation for building a command-line coding agent.
It intentionally does not include an LLM provider, tool execution, or agent
loop; those can be added as the project takes shape.

## Requirements

- Node.js 22 or newer
- npm

## Getting started

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` — run the app and restart on changes
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled app
- `npm test` — run tests
- `npm run typecheck` — check TypeScript without emitting files
- `npm run lint` — check code with ESLint
- `npm run format` — format supported files with Prettier
- `npm run format:check` — verify formatting

## Project layout

```text
src/       Application source
tests/     Tests
dist/      Compiled output (generated)
```

Keep provider integrations, agent orchestration, and tools in separate modules
as they are added. Keep secrets in environment variables and out of source
control.
