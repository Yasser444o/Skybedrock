import { world, ItemStack } from "@minecraft/server"

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
	if (entity.typeId != "minecraft:enderman") return
	if (!world.getDynamicProperty("enderman_pickup")) return
	if (!entity.isValid) return
	entity.setProperty('skybedrock:plus', true)
	entity.triggerEvent('skybedrock:enderman+')
})

world.afterEvents.playerPlaceBlock.subscribe(({block, dimension, player}) => {
	if (block.typeId != "minecraft:frosted_ice") return
	if (dimension.id != "minecraft:nether") return
	if (player.getGameMode() == "Creative") return
	block.setType("air")
	dimension.spawnItem(new ItemStack("frosted_ice"), block.center())
})