import { world, system } from "@minecraft/server"
import { Vector } from "../utilities"

// This prevents unsafe blocks from dropping items when broken with silk touch
world.beforeEvents.playerBreakBlock.subscribe(event => {
	const {block, dimension, player, itemStack: item} = event
	if (player.getGameMode() == "Creative") return
	if (!block.hasTag('skybedrock:unsafe')) return
	const enchantable = item?.getComponent('enchantable')
	const silk_touch = enchantable?.getEnchantment('silk_touch')
	if (!silk_touch) return

	event.cancel = true
	system.run(()=> dimension.runCommand(`/setblock ${Vector.hash(block)} air destroy`))
	
	// update stats
	const broken_blocks = JSON.parse(player.getDynamicProperty('blocks_broken') || '{}')
	broken_blocks[block.typeId] = (broken_blocks[block.typeId] ?? 0) + 1
	player.setDynamicProperty('blocks_broken', JSON.stringify(broken_blocks))

	// damage the tool
	const unbreaking = item.getComponent('enchantable').getEnchantment('unbreaking')?.level ?? 0
	const durability = item.getComponent('durability')
	if (Math.random() * (unbreaking + 1) >= 1) return
	
	const breaks = durability.maxDurability == durability.damage
	system.run(()=> {
		if (breaks) item = undefined; else durability.damage++
		if (breaks) player.dimension.playSound('random.break', player.location)
		player.getComponent('equippable').setEquipment('Mainhand', item)
	})
})

// import { BlockPermutation, BlockTypes } from "@minecraft/server"

// This prevents Entities from picking up unsafe block (Disabled because they shouldn't exist in item form)
// world.beforeEvents.entityItemPickup.subscribe(event => {
// 	const entity = event.item
// 	if (entity?.typeId != "minecraft:item" || !entity.isValid) return
// 	const item = entity.getComponent("minecraft:item")?.itemStack
// 	if (!item) return
// 	const block_type = BlockTypes.get(item.typeId)
// 	if (!block_type) return
// 	const permutation = BlockPermutation.resolve(block_type.id)
// 	if (!permutation?.hasTag('skybedrock:unsafe')) return
// 	event.cancel = true
// 	system.run(() => entity.remove())
// })

// This deletes unsafe block item entities if they managed to spawn (Disabled because that shouldn't happen)
// world.afterEvents.entitySpawn.subscribe(({entity}) => {
// 	if (entity?.typeId != "minecraft:item" || !entity.isValid) return
// 	const item = entity.getComponent("minecraft:item")?.itemStack
// 	if (!item) return
// 	const block_type = BlockTypes.get(item.typeId)
// 	if (!block_type) return
// 	const permutation = BlockPermutation.resolve(block_type.id)
// 	if (!permutation?.hasTag('skybedrock:unsafe')) return
// 	entity.remove()
// })

// This prevents unsafe blocks from getting to the player inventory (Disabled because that shouldn't happen)
// world.afterEvents.playerInventoryItemChange.subscribe(({player, slot}) => {
// 	const inventory = player.getComponent('inventory').container
// 	const item = inventory.getItem(slot)
// 	if (!item) return
// 	const block_type = BlockTypes.get(item.typeId)
// 	if (!block_type) return
// 	const permutation = BlockPermutation.resolve(block_type.id)
// 	if (!permutation?.hasTag('skybedrock:unsafe')) return
// 	inventory.setItem(slot)
// })