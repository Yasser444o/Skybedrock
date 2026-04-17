import { world, BlockPermutation } from "@minecraft/server"

// deepslate
world.afterEvents.playerInteractWithBlock.subscribe(({block, itemStack, player}) => {
	const permutation = block.permutation;
	if (!block.matches("cauldron", {"cauldron_liquid":"lava"})) return
	if (itemStack?.typeId !== "minecraft:sculk") return
	
	if (player.getGameMode() != 'Creative') player.runCommand("clear @s sculk 0 1");
	
	world.gameRules.sendCommandFeedback = false
	player.runCommand("give @s deepslate");
	world.gameRules.sendCommandFeedback = true
	
	block.dimension.playSound("random.fizz", block.location);
	
	if (Math.random() >= 0.1) return
	
	const fill_level = permutation.getState("fill_level")
	block.setPermutation( fill_level > 1 ? 
		permutation.withState("fill_level", fill_level - 1) :
		BlockPermutation.resolve("cauldron")
	)
})

world.afterEvents.playerInteractWithBlock.subscribe(({block, itemStack}) => {
	if (itemStack?.typeId != "minecraft:bone_meal") return
	// spore blossom
	if (block.typeId == "minecraft:dirt_with_roots") {
		if (Math.random() >= 0.1) return
		block.below().setType("minecraft:spore_blossom")
	}
	// plant restoration
	if (Math.random() >= 0.0625) return // 1 / 16
	// warped nylium -> twisting vines
	if (block.typeId == "minecraft:warped_nylium") block.above().setType("minecraft:twisting_vines")
	// grass -> check the biome
	if (block.typeId == "minecraft:grass_block") switch (block.dimension.getBiome(block.location).id) {
		// taiga -> sweet berries
		case 'minecraft:taiga': block.above().setType("minecraft:sweet_berry_bush"); break
		// cherry grove -> pink petals
		case 'minecraft:cherry_grove': block.above().setPermutation(BlockPermutation.resolve('pink_petals', {
			"minecraft:cardinal_direction": ['north', 'east', 'south', 'west'][(Math.random() * 4) | 0],
			growth: (Math.random() * 4) | 0,
		})); break
	}
})