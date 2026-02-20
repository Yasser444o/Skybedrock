import { world, system, ItemStack, BlockPermutation } from "@minecraft/server"

const dimensions = []
system.run(() => {
	dimensions.push(world.getDimension('overworld'))
	dimensions.push(world.getDimension('nether'))
	dimensions.push(world.getDimension('the_end'))
})

const hoes = [
	"minecraft:wooden_hoe",
	"minecraft:stone_hoe",
	"minecraft:copper_hoe",
	"minecraft:iron_hoe",
	"minecraft:golden_hoe",
	"minecraft:diamond_hoe",
	"minecraft:netherite_hoe",
]

const hoeable_blocks = new Map([
	['minecraft:coarse_dirt', 'minecraft:dirt'],
	['minecraft:dirt', 'minecraft:farmland'],
	['minecraft:grass_block', 'minecraft:farmland'],
	['minecraft:grass_path', 'minecraft:farmland'],
	['minecraft:dirt_with_roots', 'minecraft:dirt'],
])

const soakable_items = new Map([
	['minecraft:sculk', {
		condition: (block) => block.matches("cauldron", {"cauldron_liquid":"lava"}),
		action: (zombie, block) => {
			const count = count_items(zombie, 'sculk', zombie.last_item_count)
			const new_item = count == 1 ? 'air' : 'sculk ' + (count - 1)
			zombie.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${new_item}`)
			zombie.last_item_count = count == 1 ? undefined : count - 1
			block.dimension.playSound("random.fizz", block.location)
			const return_item = new ItemStack('deepslate')
			if (Math.random() >= 0.1) return return_item
			const permutation = block.permutation
			const fill_level = permutation.getState("fill_level")
			const new_permutation = fill_level > 1 ? permutation.withState("fill_level", fill_level - 1) : BlockPermutation.resolve("cauldron")
			block.setPermutation(new_permutation)
			return return_item
		}
	}]
])

const passable = [
	'air', 'water', 'lava'
]


const subtract_vectors = (a, b) => { return {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z} }
const reflect_location = (from, to) => subtract_vectors({x: 2 * to.x, y: 2 * to.y, z: 2 * to.z}, from)
const check_hand = (entity, item) => entity.runCommand(`testfor @s[hasitem ={location=slot.weapon.mainhand, item=${item}}]`).successCount != 0

const count_items = (entity, item, guess) => {
	const command = (count) => `testfor @s[hasitem ={location=slot.weapon.mainhand, item=${item}, quantity=${count}}]`
	const check = (count) => entity.runCommand(command(count)).successCount
	if (guess && check(guess)) return guess
	let low = 1, high = 64
	while (low != high) {
		let mid = (low + high) >>> 1
		if (check(`..${mid}`)) high = mid
		else low = mid + 1
	}; return low
}

// function raycast(entity, event) {
// 	for (let i = 0; i <= 5; i += 0.5) {
// 		const condition = passable.map(block => `unless block ^ ^ ^${i} ${block}`).join(' ')
// 		if (entity.runCommand(`execute anchored eyes ${condition}`).successCount != 0) break
// 	}
// }

function till_dirt(zombie) {
	if (!hoes.some(hoe => check_hand(zombie, hoe))) return // has a hoe
	// raycast(zombie)
	// no entity in the way
	// const block = block.getBlockFromViewDirection({maxDistance: 5, includePassableBlocks: false})?.block
	// const head = zombie.getHeadLocation()
	// const view = zombie.getViewDirection()
	// zombie.dimension.spawnParticle('minecraft:basic_smoke_particle', {x: head.x + view.x, y: head.y + view.y, z: head.z + view.z})
	// const block = zombie.dimension.getBlockFromRay(head, view, {maxDistance: 5, includePassableBlocks: false})?.block
	// console.log(`${Math.round(view.x)} ${Math.round(view.y)} ${Math.round(view.z)}`)
	// if (!block || !hoeable_blocks.has(block.typeId)) return
	// if (block.above()?.typeId != "minecraft:air") return
	// block.setType(hoeable_blocks.get(block.typeId))
	// if (block.typeId == "minecraft:dirt_with_roots") block.dimension.spawnItem(new itemStack('hanging_roots'), block.location)
	// zombie.playAnimation('animation.player.swing')
	// block.dimension.playSound('use.gravel', block.location)
}
function use_cauldron(zombie) {
	const range = zombie.dimension.heightRange
	if (zombie.location.y < range.min || zombie.location.y > range.max) return
	if (!zombie.dimension.isChunkLoaded(zombie.location)) return
	const block = zombie.dimension.getBlock(zombie.location)
	const cauldron = ["north", "east", "south", "west"]
	.map(direction => block[direction]())
	.find(cauldron => cauldron.typeId == "minecraft:cauldron")
	const item = Array.from(soakable_items.keys()).find(item => check_hand(zombie, item))
	const interaction = soakable_items.get(item)
	if (!interaction || !interaction.condition(cauldron)) return
	zombie.lookAt(cauldron.center())
	zombie.playAnimation('animation.player.swing')
	const new_item = interaction.action(zombie, cauldron)
	if (!new_item) return
	const location = reflect_location(block.bottomCenter(), cauldron.bottomCenter())
	cauldron.dimension.spawnItem(new_item, location).clearVelocity()
}

system.runInterval(() => {
	dimensions.forEach(dimension => 
		dimension.getEntities({type: "minecraft:zombie_villager_v2"}).forEach( zombie => {
			// if (zombie.getComponent("variant")?.value == 1) till_dirt(zombie) // farmer zombie villager
			if (zombie.getComponent("variant")?.value == 12) use_cauldron(zombie) // leather worker zombie villager
		})
	)
}, 16)