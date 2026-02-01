import { world, system, ItemStack } from "@minecraft/server"

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
const passable = [
	'air', 'water', 'lava'
]

const check_hand = (entity, item) => entity.runCommand(`testfor @s[hasitem ={location=slot.weapon.mainhand, item=${item}}]`).successCount != 0

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

system.runInterval(() => {
	dimensions.forEach(dimension => 
		dimension.getEntities({type: "minecraft:zombie_villager_v2"}).forEach( zombie => {
			if (zombie.getComponent("variant")?.value == 1) till_dirt(zombie) // farmer zombie villager
		})
	)
}, 16)