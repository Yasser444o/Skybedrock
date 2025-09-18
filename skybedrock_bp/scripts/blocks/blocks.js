import { world, BlockPermutation, system } from "@minecraft/server"

// budding amythyst
world.beforeEvents.playerInteractWithBlock.subscribe(({itemStack:item, player, block}) => {
	if (block.typeId != 'minecraft:amethyst_block') return
	if (item?.typeId != 'minecraft:nether_star') return
	const dimension = block.dimension
	if (dimension.id != 'minecraft:overworld') return
	system.run(() => {
		player.playAnimation('animation.player.swing')
		dimension.playSound("fall.amethyst_block", player.location, {volume: 100})
		block.setPermutation(BlockPermutation.resolve("budding_amethyst"))
		if (player.getGameMode() == 'Creative') return
		if (Math.random() >= 0.25 ) return
		player.runCommand("clear @s nether_star 0 1") 
		dimension.playSound("random.glass", player.location, {volume: 1})
	})
})

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

// spore blossom
world.afterEvents.playerInteractWithBlock.subscribe(({block, itemStack}) => {
	if (block.typeId != "minecraft:dirt_with_roots") return
	if (itemStack.typeId != "minecraft:bone_meal") return
	if (Math.random() >= 0.1) return
	block.below().setType("minecraft:spore_blossom")
})