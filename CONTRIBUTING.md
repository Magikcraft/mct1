# MCT1 dev

-   Clone this repo:

```bash
git clone https://github.com/Magikcraft/mct1.git
```

-   Install the dependencies:

```bash
cd mct1
npm i
```

-   Start your TypeScript watch compile in the `mct1` directory:

```
tsc -w
```

## To start a development server:

-   Install the Scriptcraft Modular Architecture Controller (smac):

```bash
npm i -g smac
```

-   Start the controller in the `dev-server` directory. This directory contains a configuration for an MCT1 dev server.

```bash
cd dev-server
npm i
smac start
```

Now, as you make changes to the MCT1 source code, you can reload it in the dev server by typing the following in the smac console:

```
js refresh()
```

## Scriptcraft Typings

Scriptcraft typings are via the @scriptcraft/types package.

## Code Style

The project has prettier configured to automatically format code on commit.

Make sure that you run `npm i` to get these tools.

Also, if you use VS Code, we recommend adding this to your `settings.json`:

```json
"editor.codeActionsOnSave": {
    "source.organizeImports": true
}
```

### Guidelines

Always use `import`, and only ever use `require` if it has a side-effect. This allows TypeScript to reason about the code.
