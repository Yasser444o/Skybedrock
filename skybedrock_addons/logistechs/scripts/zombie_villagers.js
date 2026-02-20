import { world, system, ItemStack, BlockPermutation } from "@minecraft/server"

const dimensions = []
system.run(() => {
	dimensions.push(world.getDimension('overworld'))
	dimensions.push(world.getDimension('nether'))
	dimensions.push(world.getDimension('the_end'))
})

const bucket_transformations = {
	water: { bucket: "water_bucket", sound: "cauldron.takewater" },
	lava: { bucket: "lava_bucket", sound: "bucket.fill_lava" },
	powder_snow: { bucket: "powder_snow_bucket", sound: "bucket.fill_powder_snow" },
}

const passable = [
	'air', 'water', 'lava'
]


const subtract_vectors = (a, b) => { return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z} }
const reflect_location = (from, to) => subtract_vectors({x: 2 * to.x, y: 2 * to.y, z: 2 * to.z}, from)
const check_hand = (entity, item) => entity.runCommand(`testfor @s[hasitem ={location=slot.weapon.mainhand, item=${item}}]`).successCount != 0
const find_item = (entity, map) => { for (const item of map.keys()) if (check_hand(entity, item)) return item }

const count_items = (entity, item, guess, high = 64) => {
	const command = (count) => `testfor @s[hasitem ={location=slot.weapon.mainhand, item=${item}, quantity=${count}}]`
	const check = (count) => entity.runCommand(command(count)).successCount
	if (guess && check(guess)) return guess
	let low = 1
	while (low != high) {
		let mid = (low + high) >>> 1
		if (check(`..${mid}`)) high = mid
		else low = mid + 1
	}; return low
}

const adjacent_blocks = (entity) => {
	const {dimension, location} = entity
	const range = dimension.heightRange
	if (location.y < range.min || location.y > range.max) return
	if (!dimension.isChunkLoaded(location)) return
	const block = dimension.getBlock(entity.location)
	const blocks = []
	for (const offset of [{x: -1, z: 0}, {x: 1, z: 0}, {x: 0, z: -1}, {x: 0, z: 1}]) {
		const location = {x: block.x + offset.x, y: block.y, z: block.z + offset.z}
		if (!dimension.isChunkLoaded(location)) continue
		blocks.push(dimension.getBlock(location))
	}; if (block.length != 0) return blocks
}

const hoes = new Map([
	["minecraft:wooden_hoe", 60],
	["minecraft:stone_hoe", 132],
	["minecraft:copper_hoe", 191],
	["minecraft:iron_hoe", 251],
	["minecraft:golden_hoe", 33],
	["minecraft:diamond_hoe", 1562],
	["minecraft:netherite_hoe", 2032],
])

const hoeable_blocks = new Map([
	['minecraft:coarse_dirt', 'minecraft:dirt'],
	['minecraft:dirt', 'minecraft:farmland'],
	['minecraft:grass_block', 'minecraft:farmland'],
	['minecraft:grass_path', 'minecraft:farmland'],
	['minecraft:dirt_with_roots', 'minecraft:dirt'],
])

function use_hoe(zombie) {
	const hoe = find_item(zombie, hoes); if (!hoe) return // has a hoe
	const adjacent = adjacent_blocks(zombie); if (!adjacent) return // there are blocks around it
	const block = adjacent.find(block => hoeable_blocks.has(block.typeId)); if (!block) return // one of the blocks is hoeable
	if (block.above().typeId != "minecraft:air") return // has air above
	const {dimension, location, typeId} = block // get the block properties
	block.setType(hoeable_blocks.get(typeId)) // change the block type
	dimension.playSound('use.gravel', location) // play a sound
	zombie.playAnimation('animation.player.swing') // play the swing animation
	zombie.lookAt(block.center()) // rotate the zombie's head
	const durability = zombie.getDynamicProperty('hoe_durability') ?? hoes.get(hoe) // get the durability
	if (durability > 1) { // damage the item
		zombie.setDynamicProperty('hoe_durability', durability - 1)
		zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${hoe} 1 ${hoes.get(hoe) - durability + 1}`)
	} else { // break the item
		zombie.setDynamicProperty('hoe_durability')
		zombie.dimension.playSound('random.break', zombie.location)
		zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 air`)
	}
	if (typeId != "minecraft:dirt_with_roots") return // it was a rooted dirt
	dimension.spawnItem(new ItemStack('hanging_roots'), block.above().bottomCenter()) // spawn hanging roots
}


const soakable_items = new Map([
	['minecraft:sculk', {
		condition: (block) => block.matches("cauldron", {"cauldron_liquid":"lava"}),
		action: (zombie, block) => {
			const count = count_items(zombie, 'sculk', zombie.last_item_count)
			const new_item = count == 1 ? 'air' : 'sculk ' + (count - 1)
			zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${new_item}`)
			zombie.last_item_count = count == 1 ? undefined : count - 1
			const { permutation, dimension, location } = block
			dimension.playSound("random.fizz", location)
			const return_item = new ItemStack('deepslate')
			if (Math.random() >= 0.1) return return_item
			const fill_level = permutation.getState("fill_level")
			const new_permutation = fill_level > 1 ? permutation.withState("fill_level", fill_level - 1) : BlockPermutation.resolve("cauldron")
			block.setPermutation(new_permutation)
			return return_item
		}
	}],
	['minecraft:bucket', {
		condition: (block) => block.matches("cauldron", {"fill_level": 6}) && block.getComponent('fluid_container').getFluidType() != 'Potion',
		action: (zombie, block) => {
			const { permutation, dimension, location } = block
			const liquid = bucket_transformations[permutation.getState("cauldron_liquid")]
			if (!liquid) return
			const count = count_items(zombie, 'bucket', zombie.last_item_count, 16)
			const new_item = count == 1 ? 'air' : 'bucket ' + (count - 1)
			zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${new_item}`)
			zombie.last_item_count = count == 1 ? undefined : count - 1
			dimension.playSound(liquid.sound, location)
			block.setPermutation(BlockPermutation.resolve("cauldron"))
			return new ItemStack(liquid.bucket)
		}
	}],
	['minecraft:water_bucket', {
		condition: (block) => block.matches("cauldron", {"fill_level":0}),
		action: (zombie, block) => {
			const { permutation, dimension, location } = block
			zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 air`)
			dimension.playSound("cauldron.fillwater", location, { volume: 2 })
			block.setPermutation(permutation.withState('fill_level', 6).withState('cauldron_liquid', 'water'))
			return new ItemStack('bucket')
		}
	}],
	['minecraft:lava_bucket', {
		condition: (block) => block.matches("cauldron", {"fill_level":0}),
		action: (zombie, block) => {
			const { permutation, dimension, location } = block
			zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 air`)
			dimension.playSound("bucket.empty_lava", location, { volume: 2 })
			block.setPermutation(permutation.withState('fill_level', 6).withState('cauldron_liquid', 'lava'))
			return new ItemStack('bucket')
		}
	}],
	['minecraft:powder_snow_bucket', {
		condition: (block) => block.matches("cauldron", {"fill_level":0}),
		action: (zombie, block) => {
			const { permutation, dimension, location } = block
			zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 air`)
			dimension.playSound("bucket.empty_powder_snow", location, { volume: 2 })
			block.setPermutation(permutation.withState('fill_level', 6).withState('cauldron_liquid', 'powder_snow'))
			return new ItemStack('bucket')
		}
	}]
])

function use_cauldron(zombie) {
	const {dimension, location} = zombie
	const adjacent = adjacent_blocks(zombie); if (!adjacent) return
	const item = find_item(zombie, soakable_items)
	const interaction = soakable_items.get(item); if (!interaction) return
	const cauldron = adjacent.find(cauldron => {
		if (cauldron.typeId != "minecraft:cauldron") return
		return interaction.condition(cauldron)
	}); if (!cauldron) return
	zombie.lookAt(cauldron.center())
	zombie.playAnimation('animation.player.swing')
	const new_item = interaction.action(zombie, cauldron); if (!new_item) return
	const block = dimension.getBlock(location)
	const item_location = reflect_location(block.bottomCenter(), cauldron.bottomCenter())
	cauldron.dimension.spawnItem(new_item, item_location).clearVelocity()
}

system.runInterval(() => {
	dimensions.forEach(dimension => 
		dimension.getEntities({type: "minecraft:zombie_villager_v2"}).forEach( zombie => {
			if (zombie.getComponent("variant")?.value == 1) use_hoe(zombie) // farmer zombie villager
			if (zombie.getComponent("variant")?.value == 12) use_cauldron(zombie) // leather worker zombie villager
		})
	)
}, 16)