import { world } from "@minecraft/server"

export function update_vision(player, dimension) {
    if (dimension.id == "minecraft:overworld" && !player.getDynamicProperty("free_vision")) {
        player.runCommand(`fog @s push skybedrock:vision_limit vision_limit`)
    } else player.runCommand(`fog @s remove vision_limit`)
}

world.afterEvents.playerSpawn.subscribe(({player, initialSpawn}) => {
	if (!initialSpawn) return
    update_vision(player, player.dimension)
})

world.afterEvents.playerDimensionChange.subscribe(({toDimension, player}) => {
    update_vision(player, toDimension)
})