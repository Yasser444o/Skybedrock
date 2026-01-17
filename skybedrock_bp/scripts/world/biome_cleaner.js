import { system, BlockVolume } from "@minecraft/server"

export default {
    onTick({block: {location, dimension}}) {
        const [x, z] = [Math.floor(location.x / 16) * 16, Math.floor(location.z / 16) * 16]
        const first_corner = { x, y: 0, z }
        const other_corner = { x: x + 15, y: 126, z: z + 15 }
        dimension.setBlockType(location, "minecraft:air")
        if (dimension.id != "minecraft:the_end") return
		system.runTimeout(() => {
			if (dimension.getBlock(location)?.typeId != 'skybedrock:end_eater') return
            dimension.fillBlocks(new BlockVolume(first_corner, other_corner), 'air', {
                blockFilter: { includeTypes: ['end_stone', 'chorus_plant', 'chorus_flower'] }
            })
            const shulkers = dimension.getEntities({
                location: first_corner,
                volume: { x: 16, y: 210, z: 16 },
                type: "minecraft:shulker",
            })
            shulkers.forEach(shulker => shulker.remove())
		}, 2)
    }
}
