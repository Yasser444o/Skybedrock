import { world } from "@minecraft/server"

world.afterEvents.playerPlaceBlock.subscribe(async ({player, block}) => {
	if (!world.getDynamicProperty("natural_shriekers")) return
  if (player.dimension.id != 'minecraft:overworld') return
  if (block.typeId != "minecraft:sculk_shrieker") return
  if (await block.dimension.getBiome(block.location) != "deep_dark") return
  block.setPermutation(block.permutation.withState("can_summon", true))
})