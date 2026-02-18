import { world, system } from "@minecraft/server"
import { location_to_hash as hash } from "../utilities"

world.beforeEvents.playerBreakBlock.subscribe((event) => {
	const {block, dimension, player, itemStack: item} = event
	if (player.getGameMode() == "Creative") return
	if (!block.hasTag('skybedrock:unsafe')) return
	const enchantable = item?.getComponent('enchantable')
	const silk_touch = enchantable?.getEnchantment('silk_touch')
	if (!silk_touch) return

	event.cancel = true
	system.run(()=> dimension.runCommand(`/setblock ${hash(block)} air destroy`))
	
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