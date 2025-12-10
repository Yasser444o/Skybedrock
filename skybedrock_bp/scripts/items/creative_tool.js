import { ActionFormData } from "@minecraft/server-ui"
import { world, system } from "@minecraft/server"

export default {
	onUse({ itemStack: stick, source: player }) {
		if (player.getBlockFromViewDirection()) return
		new ActionFormData()
		.title("Creative Tool")
		.button("Delete Mobs")
		.button("Delete Blocks")
		.show(player).then(({ canceled, selection }) => {
			if (canceled) return
			if (selection == 0) stick.setLore(["§r§ndelete mobs"])
			if (selection == 1) stick.setLore(["§r§ndelete blocks"])
			player.getComponent("equippable").setEquipment('Mainhand', stick)
		})
	}
}

world.beforeEvents.playerInteractWithEntity.subscribe(event => {
	const {itemStack, player, target:entity} = event
	if (itemStack?.typeId != "yasser444:creative_tool") return
	event.cancel = true
	
	const lore = itemStack.getLore()
	const mode = lore[0]?.replace('§r§n', '')
	
	system.run(() => {
		if (mode == "delete mobs") entity.remove()
	})
})

const offsets = []
    for (const x of [-1, 0, 1]) {
        for (const y of [-1, 0, 1]) {
            for (const z of [-1, 0, 1]) {
			if (`${x}${y}${z}` == '000') continue
			offsets.push({x, y, z})
		}
	}
}

function hash_to_location(hash) {
	return ((([x, y, z]) => ({x: +x, y: +y, z: +z})))(hash.split(' '))
}

function location_to_hash({x, y, z}) {
	return `${x} ${y} ${z}`
}

function find_connected_blocks(block, type) {
	const limit = 512
	const block_hash = location_to_hash(block)
	const connected_blocks = new Set()
	const check_list = [block]
	const searched = new Set([block_hash])
	while (check_list.length != 0) {
		const current_block = check_list.shift()
		const current_hash = location_to_hash(current_block)
		if (current_hash != block_hash) connected_blocks.add(current_hash)
		if (connected_blocks.size >= limit - 1) break
		for (const offset of offsets) {
			const found_block = current_block.offset(offset) 
			const found_hash = location_to_hash(found_block)
			if (searched.has(found_hash)) continue
			searched.add(found_hash)
			if (found_block.typeId != type) continue
			check_list.push(found_block)
		}
	}
	return Array.from(connected_blocks).map(hash => block.dimension.getBlock(hash_to_location(hash)))
}

world.afterEvents.playerBreakBlock.subscribe(({block, dimension, brokenBlockPermutation:permutation, itemStackBeforeBreak:item}) => {
	if (item?.typeId != "yasser444:creative_tool") return
	const mode = item.getLore()[0]?.replace('§r§n', '')
	const type = permutation.type.id
	if (mode == "delete blocks") {
		find_connected_blocks(block, type).forEach(block => block.setType('air'))
	}
}) 