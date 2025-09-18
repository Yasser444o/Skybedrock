import { Dimension, system, world } from "@minecraft/server"
import { biome_names } from "../data"

Dimension.prototype.getBiome = async function({x, y, z}) {
    const location = {x: x, y: Math.max(this.heightRange.min, Math.min(this.heightRange.max - 1, y)), z: z}
    try {
		const entity = this.spawnEntity("skybedrock:biome_detector", location)
		return new Promise((resolve) => {
			system.runTimeout(() => {
				if (!entity?.isValid) return
				const biome = entity.getTags()?.find(tag => Object.keys(biome_names).includes(tag))
				entity.remove()
				resolve(biome ?? undefined)
			}, 1)
		})
	} catch {null}
}

// this removes the biome detector entity on /reload
world.afterEvents.worldLoad.subscribe(() => {
	['overworld', 'nether', 'the_end'].forEach(dimension => 
		world.getDimension(dimension)
		.getEntities({type: "skybedrock:biome_detector"})
		.forEach(entity => entity.remove())
	)
})