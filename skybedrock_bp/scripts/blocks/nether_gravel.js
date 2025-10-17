import { system, world, BlockPermutation } from "@minecraft/server" ;

const no_support = [
	"minecraft:air",
	"minecraft:lava",
	"minecraft:water"
]

export default {
	onTick({block}) {
		if (!no_support.includes(block.below().typeId)) return
		block.setType("minecraft:gravel")
	}
}