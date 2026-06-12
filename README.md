# yt-lint

An ESLint plugin with custom rules for JS/React monorepos.

## Installation

```sh
npm install --save-dev yt-lint eslint
```

Requires ESLint 9+ (flat config).

## Usage

```js
// eslint.config.js
import ytLint from 'yt-lint';

export default [
  ytLint.configs.recommended,
];
```

Or enable individual rules:

```js
import ytLint from 'yt-lint';

export default [
  {
    plugins: { 'yt-lint': ytLint },
    rules: {
      'yt-lint/no-unused': 'error',
      'yt-lint/two-blank-lines-after-imports': 'warn',
    },
  },
];
```

## Rules

### Formatting

| Rule | Description |
|------|-------------|
| `object-curly-spacing` | Spaced object braces with nested-close exception |
| `two-blank-lines-after-imports` | Exactly two blank lines after the final top-level import |
| `no-blank-lines-between-declarations` | No blank lines between consecutive variable declarations |
| `blank-line-after-if` | Blank line after an `if` statement before the next statement |
| `blank-line-after-unpacking` | Blank lines between leading declaration preparation phases |

### Imports

| Rule | Description | Options |
|------|-------------|---------|
| `import-general-to-specific` | Import ordering by source category with alphabetical fallback | `internalAliases`, `packageRootPattern` |
| `no-relative-cross-package-imports` | Disallow relative imports that cross package boundaries | `packageRootPattern` |

### Variables & exports

| Rule | Description |
|------|-------------|
| `no-unused` | Report and autofix unused imports, destructured properties, and caught errors |
| `no-renamed-unused-destructure` | Disallow destructuring renames to underscore-prefixed names |

### Documentation

| Rule | Description |
|------|-------------|
| `require-jsdoc` | Require JSDoc for named/exported functions, class methods, and object methods |

### Environment boundaries

| Rule | Description | Options |
|------|-------------|---------|
| `no-process-exit-outside-cli` | Disallow `process.exit` outside CLI files | `allowedProcessExitGlobs` |
| `no-nodejs-builtins-in-webapp` | Disallow Node.js built-ins in browser code | `browserCodeGlobs` |

## Configurable options

Rules that encode path or alias assumptions accept options so they work outside any specific monorepo:

- `packageRootPattern` — glob identifying package roots (default: `packages/*`).
- `internalAliases` — list of bare import aliases treated as internal (e.g. `["backend", "shared"]`).
- `allowedProcessExitGlobs` — globs where `process.exit` is permitted.
- `browserCodeGlobs` — globs that define browser-only code boundaries.

## Configs

| Config | Description |
|--------|-------------|
| `configs.recommended` | All rules at `warn` level, no project-specific paths |

## License

MIT
