# MCT1: Minecraft for Type 1 Diabetes

MCT1 simulates living with Type 1 Diabetes in Minecraft, with an epic quest and magic powers.

MCT1 is a Scriptcraft plugin using the [Scriptcraft Modular Architecture](https://github.com/Magikcraft/scriptcraft-modular-arch).

## To Run

### Prerequisites

-   Docker
-   A Minecraft Java Client

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
docker run -it -p 25565:25565 --name mct1 \
--mount type=bind,src=$(pwd)/mct1-worlds,dst=/server/worlds \
--mount source=scriptcraft-cache,target=/server/cache \
--mount type=bind,src=$(pwd)/mct1,dst=/server/scriptcraft-plugins/@magikcraft/mct1 \
magikcraft/scriptcraft
```

## Contributing

See CONTRIBUTING.md for details on development practices.
