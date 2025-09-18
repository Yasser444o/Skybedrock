import { world } from "@minecraft/server" ;

function isLoaded(dimension) {
	try {
		dimension.getBlock({x:0, y:64, z:0}).permutation
	} catch { return false }
	return true 
}

world.afterEvents.playerPlaceBlock.subscribe(({block, dimension, player}) => {
	if (!world.getDynamicProperty("dragon_eggs")) return
	if (!isLoaded(dimension)) return
	if (block.typeId != "minecraft:netherite_block") return
	if (dimension.id != "minecraft:the_end") return
	if (block.below().typeId != "minecraft:bedrock") return

	if (!dimension.getBlock({x:0, y:64, z:3}).permutation.matches("netherite_block")) return
	if (!dimension.getBlock({x:0, y:64, z:-3}).permutation.matches("netherite_block")) return
	if (!dimension.getBlock({x:3, y:64, z:0}).permutation.matches("netherite_block")) return
	if (!dimension.getBlock({x:-3, y:64, z:0}).permutation.matches("netherite_block")) return
	if (!dimension.getBlock({x:0, y:67, z:0}).permutation.matches("air")) return
	
  dimension.runCommand("setblock 0 64 3 air")
  dimension.runCommand("setblock 0 64 -3 air")
  dimension.runCommand("setblock 3 64 0 air")
  dimension.runCommand("setblock -3 64 0 air")
  dimension.runCommand("setblock 0 67 0 dragon_egg")
  dimension.spawnParticle("minecraft:dragon_death_explosion_emitter", {x:0.5, y:67.5, z:0.5})
  dimension.runCommand(`camerashake add ${player.nameTag} 0.5 1.5`)
  dimension.runCommand(`playsound mob.enderdragon.growl @a 0 67 0`)
})