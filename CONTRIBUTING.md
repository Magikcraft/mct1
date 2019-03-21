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

As you require Scriptcraft modules that have not been used before, TS will complain that they cannot be found.

Have a look in `__types__/typings` for examples of declarations that bring it in as `any` (like `items.d.ts`) and strongly typed (like `events.d.ts` or `utils.d.ts`).

Eventually will make refactor these out and make a `@types/scriptcraft` module that can be reused in any SMA plugin.

## Code Style

The project has prettier configured to automatically format code on commit.

Always use `import`, and only ever use `require` if it has a side-effect. This allows TypeScript to reason about the code.
