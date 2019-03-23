# MCT1: Minecraft for Type 1 Diabetes

MCT1 simulates living with Type 1 Diabetes in Minecraft, with an epic quest and magic powers.

MCT1 is a Scriptcraft plugin using the [Scriptcraft Modular Architecture](https://github.com/Magikcraft/scriptcraft-modular-arch).

## To Run

### Prerequisites

-   [Docker](https://www.docker.com/)
-   [Node](https://nodejs.org/en/)
-   [Minecraft Java Edition](https://minecraft.net)

### The Easiest Way

The easiest way to run this - if you just want to try it out - is to just connect to our hosted server. In your Java Minecraft client just connect to the server mc.mct1.io.

### The Easy Way

The easiest way to run this locally is to use the pre-built [MCT1 Server](https://github.com/Magikcraft/mct1-server):

```bash
npm i -g mct1-server
mct1-server
```

### The Hard Way

If you want to dev on this plugin, then you can run from source like this:

1. Git clone this repo:

```bash
git clone https://github.com/Magikcraft/mct1.git
```

1. Git clone the MCT1 worlds:

```bash
git clone https://github.com/Magikcraft/mct1-worlds.git
```

1. Start them in docker:

```bash
docker run -it -p 25565:25565 \
--mount type=bind,src=$(pwd)/mct1-worlds,dst=/server/worlds \
--mount source=scriptcraft-cache,target=/server/cache \
--mount type=bind,src=$(pwd)/mct1,dst=/server/scriptcraft-plugins/@magikcraft/mct1 \
magikcraft/scriptcraft
```

## Contributing

See CONTRIBUTING.md for details on development practices.
