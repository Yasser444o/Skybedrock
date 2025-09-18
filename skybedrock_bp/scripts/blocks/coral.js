import { world, system } from "@minecraft/server"

const coral_sizes = {
	tube: {r: 2, h: 6},
	brain: {r: 2, h: 6},
	bubble: {r: 2, h: 4},
	fire: {r: 2, h: 5},
	horn: {r: 3, h: 7},
}

const coral_replaceables = [
	'minecraft:seagrass',
	'minecraft:flowing_water',
	'minecraft:bubble_column',

	'minecraft:tube_coral',
	'minecraft:brain_coral',
	'minecraft:bubble_coral',
	'minecraft:fire_coral',
	'minecraft:horn_coral',

	'minecraft:dead_tube_coral',
	'minecraft:dead_brain_coral',
	'minecraft:dead_bubble_coral',
	'minecraft:dead_fire_coral',
	'minecraft:dead_horn_coral',

	'minecraft:tube_coral_fan',
	'minecraft:brain_coral_fan',
	'minecraft:bubble_coral_fan',
	'minecraft:fire_coral_fan',
	'minecraft:horn_coral_fan',

	'minecraft:tube_coral_wall_fan',
	'minecraft:brain_coral_wall_fan',
	'minecraft:bubble_coral_wall_fan',
	'minecraft:fire_coral_wall_fan',
	'minecraft:horn_coral_wall_fan',

	'minecraft:dead_tube_coral_fan',
	'minecraft:dead_brain_coral_fan',
	'minecraft:dead_bubble_coral_fan',
	'minecraft:dead_fire_coral_fan',
	'minecraft:dead_horn_coral_fan',

	'minecraft:dead_tube_coral_wall_fan',
	'minecraft:dead_brain_coral_wall_fan',
	'minecraft:dead_bubble_coral_wall_fan',
	'minecraft:dead_fire_coral_wall_fan',
	'minecraft:dead_horn_coral_wall_fan',
]

world.beforeEvents.playerInteractWithBlock.subscribe(({itemStack:item, player, block, isFirstEvent}) => {
	if (!isFirstEvent) return
	if (item?.typeId != 'minecraft:bone_meal') return
	if (!['minecraft:dirt', 'minecraft:sand', , 'minecraft:red_sand'].includes(block.below().typeId)) return
	const coral_type = block.typeId.replace('minecraft:', '').replace('_coral', '')
	if (!Object.keys(coral_sizes).includes(coral_type)) return
	system.run(() => {
		if (player.getGameMode() != 'Creative') player.runCommand('clear @s bone_meal 0 1')
		block.dimension.playSound("item.bone_meal.use", block.location)
		block.dimension.spawnParticle('minecraft:crop_growth_emitter', block.center())
		player.playAnimation('animation.player.swing')
		if (Math.random() >= 0.2 ) return
		const {x, y, z} = block.location
		const {r, h} = coral_sizes[coral_type]
		for (let j = 0; j < h; j++) {
			for (let i = -r; i <= r; i++) {
				for (let k = -r; k <= r; k++) {
					const id = block.offset({x: i, y: j, z: k})?.typeId
					if (id == "minecraft:water") continue
					if (!coral_replaceables.includes(id)) return
				}
			}
		}
		world.structureManager.place(
			`coral_reefs/${coral_type}_reef`, block.dimension,
			{x: x - r, y: y, z: z -r },
			{
				rotation: ['None', 'Rotate90', 'Rotate180', 'Rotate270'][Math.floor(Math.random() * 4)],
				mirror: ['None', 'X', 'Z', 'XZ'][Math.floor(Math.random() * 4)],
				waterlogged: true
			}
		)
	})
})