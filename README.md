# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Contact Form Setup

This portfolio uses [Web3Forms](https://web3forms.com/) for a completely secure, serverless contact form delivery system.

To configure the contact form:
1. Go to [Web3Forms](https://web3forms.com/) and enter your email address to get an Access Key.
2. Copy the `.env.example` file to a new file named `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` and add your access key:
   ```
   VITE_WEB3FORMS_ACCESS_KEY=your_key_here
   ```
4. Restart your development server.

> **Note on Deployment:** When deploying this site to Vercel, Netlify, or similar platforms, you must add `VITE_WEB3FORMS_ACCESS_KEY` to the environment variables section in your hosting dashboard.
