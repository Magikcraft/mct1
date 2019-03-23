## MCT1 dev

1. Clone this repo:

```bash
git clone https://github.com/Magikcraft/mct1.git
```

1. Install the dependencies:

```bash
npm i
```

-   Authenticate to Docker to be able to pull the base image. To avoid having to do this, you could alternatively build the image locally, after checking out its repo in the next step.

-   Check out the image repo in case you need to do something in the base image:

[Magikcraft/scriptcraft-modular-arch](https://github.com/Magikcraft/scriptcraft-modular-arch)

-   Clone the MCT1 Worlds repo:

[Magikcraft/mct1-worlds](https://github.com/Magikcraft/mct1-worlds)

-   Clone the MCT1 SMA repo:

[Magikcraft/mct1](https://github.com/Magikcraft/mct1)

Start your TypeScript watch compile in the `mct1` directory:

    tsc -w

Now compose the worlds and the MCT1 SMA plugin using docker:

    docker run -it -p 25565:25565 \
        --mount type=bind,src=$(pwd)/mct1-worlds,dst=/server/worlds \
        --mount source=scriptcraft-cache,target=/server/cache \
        --mount type=bind,src=$(pwd)/mct1,dst=/server/scriptcraft-plugins/@magikcraft/mct1 \
        magikcraft/scriptcraft

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
