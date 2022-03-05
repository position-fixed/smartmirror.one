# smartmirror.one Monorepo

## Project Goal

Create a smartmirror solution that:
- Is easy to setup and use
- Utilizes simple javascript
- Provides a plugin system to build with
- Has a single executionable binary that works on any platform

## Packages

| Folder | Function |
|-|-|
| backend  | The server that imports a config, serves the frontend in production and executes events for the frontend. |
| examples | Basic examples of plugins for users to generate their own extensions with. |
| frontend | The page and components used to display the smartmirror contents. It uses parcel in development, build artifacts are packaged with the server. |
| types | TypeScript definitions shared between packages. |

## Development

This monorepo uses npm workspaces.

All parts of the project live in the `packages` folder: Make sure to add any new dependencies in the local `package.json` files, and run `npm install` in the root.

### Commands

You can run the following commands in the root folder:
| Command       | Description                     | Available in    |
|---------------|---------------------------------|-----------------|
| `npm install` | Install dependencies            | Root            |
| `npm start`   | Shortcut for `npm dev`          | Package only    |
| `npm dev`     | Start a local development setup | Package only    |
| `npm test`    | Run tests for package           | Root / Package  |
| `npm lint`    | Check code for package          | Root / Package  |
| `npm build`   | Compiles for production         | Root / Package  |

You can append a flag like `--workspace=packages/frontend` to select a specific package.

### Git hooks

Your changes will be linted upon commit and tested before any push.