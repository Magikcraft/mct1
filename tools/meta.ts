const FixedMetadataValue = Java.type('org.bukkit.metadata.FixedMetadataValue')

export const meta = (metadatable): Metadatable => {
    return new Metadatable(metadatable)
}

class Metadatable {
    metadatable: any

    constructor(metadatable) {
        this.metadatable = metadatable
    }

    get(key: string) {
        if (!this.has(key)) return undefined
        return JSON.parse(
            this.metadatable
                .getMetadata(key)
                .get(0)
                .value()
        )
    }

    set(key: string, value: any) {
        this.metadatable.setMetadata(
            key,
            new FixedMetadataValue(__plugin, JSON.stringify(value))
        )
    }

    remove(key: string) {
        this.metadatable.removeMetadata(key, __plugin)
    }

    has(key: string) {
        return this.metadatable.hasMetadata(key)
    }
}
