import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { world, system, BlockVolume } from "@minecraft/server"
import { hash_to_location, location_to_hash, offset_location } from "../utilities"

// assets
const modes = [
	["Selector", 'selector'],
	["Delete Mobs", 'delete mobs'],
	["Delete Blocks", 'delete blocks'],
	["Teleport", 'teleport'],
	["Ice Rod", 'ice rod'],
	["Count Items", 'count items'],
]

const offsets = [], BOA = [-1, 0, 1]
for (const x of BOA) { for (const y of BOA) { for (const z of BOA) {
	if (`${x}${y}${z}` == '000') continue
	offsets.push({x, y, z})
}}}

function lore_and_mode(item) {
	const lore = item.getLore()
	const mode = lore[0]?.replace('§r§n', '')
	return {lore, mode}
}

// logic functions
function highlight_selection(dimension, start, end) {
	if (!start || !end) return
	const min = {x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), z: Math.min(start.z, end.z)}
	const max = {x: Math.max(start.x, end.x) + 1, y: Math.max(start.y, end.y) + 1, z: Math.max(start.z, end.z) + 1}
	const particle = (location) => {if (dimension.isChunkLoaded(location)) dimension.spawnParticle("minecraft:villager_happy", location)}
	const edges = [min, max].flatMap(v => [min, max].map(u => [v, u]))
	for (const edge of edges) for (let x = min.x; x <= max.x; x++) particle({x, y: edge[0].y, z: edge[1].z})
	for (const edge of edges) for (let y = min.y +1; y < max.y; y++) particle({x: edge[0].x, y, z: edge[1].z})
	for (const edge of edges) for (let z = min.z +1; z < max.z; z++) particle({x: edge[0].x, y: edge[1].y, z})
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
			if (!found_block) continue
			const found_hash = location_to_hash(found_block)
			if (searched.has(found_hash)) continue
			searched.add(found_hash)
			if (found_block.typeId != type) continue
			check_list.push(found_block)
		}
	}
	return Array.from(connected_blocks).map(hash => block.dimension.getBlock(hash_to_location(hash)))
}

function fill_blocks(player, start, end) {
	new ModalFormData()
	.title('Enter a block id')
	.textField("", "")
	.show(player).then(({formValues, canceled}) => {
		if (canceled) return
		const type = formValues[0]
		if (!type) {player; return}
		fill(player.dimension, start, end, type)
	})
}

function fill(dimension, start, end, type) {
	if (!start || !end) return
	const min = {x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), z: Math.min(start.z, end.z)}
	const max = {x: Math.max(start.x, end.x) + 1, y: Math.max(start.y, end.y) + 1, z: Math.max(start.z, end.z) + 1}
	for (let x = min.x; x <= max.x; x += 32) for (let y = min.y; y <= max.y; y += 32) for (let z = min.z; z <= max.z; z += 32) {
		const volume = new BlockVolume({x, y, z}, {
			x: Math.min(x + 31, max.x - 1),
			y: Math.min(y + 31, max.y - 1),
			z: Math.min(z + 31, max.z - 1),
		})
		dimension.fillBlocks(volume, type, {ignoreChunkBoundErrors: true})
	}
}


// tool utilities
const selector = {
	hit_block(player, block, item, lore) { // select first block
		lore[1] = location_to_hash(block)
		item.setLore(lore)
		player.getComponent("equippable").setEquipment('Mainhand', item)
	},
	use_block(player, block, item, lore) { // select second block
		lore[2] = location_to_hash(block)
		item.setLore(lore)
		player.getComponent("equippable").setEquipment('Mainhand', item)
	},
	sneak_use(player, item, lore)  { // cancel selection
		item.setLore([lore[0]])
		player.getComponent("equippable").setEquipment('Mainhand', item)
	},
	use(player, lore) { // open action menu
		new ActionFormData()
		.title("Selector Tool")
		.button("Delete Blocks")
		.button("Fill Blocks")
		.show(player).then(({ canceled, selection }) => { if (canceled) return
			if (selection == 0) fill(player.dimension, hash_to_location(lore[1]), hash_to_location(lore[2]), 'air')
			if (selection == 1) fill_blocks(player, hash_to_location(lore[1]), hash_to_location(lore[2]))
		})
	},
	tick(player, lore) {
		if (!lore[1] || !lore[2]) return
		const from = hash_to_location(lore[1])
		const to = hash_to_location(lore[2])
		highlight_selection(player.dimension, from, to)
	}
}

const teleport = {
	sneak_use(player) {
		const location = offset_location(player.location, player.getViewDirection(), 16)
		player.tryTeleport(location)
		system.run (() => player.playSound('mob.endermen.portal', {location}))
	},
	sneak_use_block(player) {
		const location = offset_location(player.location, player.getViewDirection(), 16)
		player.tryTeleport(location)
		system.runTimeout(() => player.playSound('mob.endermen.portal', {location}), 2)
	}
}

const ice_rod = {
	use(player) { // place
		const location = offset_location(player.getHeadLocation(), player.getViewDirection(), 5)
		const block = player.dimension.getBlock(location)
		if (!block || !block.isValid) return
		if (!block.isAir && !block.isLiquid) return
		block.setType('blue_ice')
		system.runTimeout(() => {
			if (block.typeId != "minecraft:blue_ice") return
			block.setType('air')
		}, 100)
	},
	sneak_use(player, item) { // cancel
		item.setLore([])
		player.getComponent("equippable").setEquipment('Mainhand', item)
	},
	use_block(against, blockFace) {
		const block_faces = {Up: 'above', Down: 'below', North: 'north', East: 'east', South: 'south', West: 'west'}
		const block = against[block_faces[blockFace]]()
		if (!block || !block.isValid) return
		if (!block.isAir && !block.isLiquid) return
		block.setType('blue_ice')
		system.runTimeout(() => {
			if (block.typeId != "minecraft:blue_ice") return
			block.setType('air')
		}, 100)
	}
}

const count_items = {
	before_use_block(player, block, item) {
		if (!block.getComponent('inventory')) return
		const container = block.getComponent('inventory').container
		let total = 0
		for (let i = 0; i < container.size; i++) {
			const item = container.getItem(i)
			if (!item) continue
			total += item.amount
		}
		player.sendMessage(`Contains ${total} item${total > 1 ? 's' : ''}`)
	}
}

// event directors
function on_use(player, item) {
	const {lore, mode} = lore_and_mode(item)
	if (mode == "selector" && lore[1] && lore[2]) selector.use(player, lore)
	else if (mode == 'ice rod') ice_rod.use(player)
	else {
		const form = new ActionFormData() .title("Creative Tool")
		for (const mode of modes) form.button(mode[0])
		form.show(player).then(({ canceled, selection }) => {
			if (canceled) return
			item.setLore([`§r§n${modes[selection][1]}`])
			player.getComponent("equippable").setEquipment('Mainhand', item)
		})
	}
}

function on_sneak_use(player, item) {
	const {lore, mode} = lore_and_mode(item)
	if (mode == "teleport") teleport.sneak_use(player)
	if (mode == "selector") selector.sneak_use(player, item, lore)
	if (mode == 'ice rod') ice_rod.sneak_use(player, item)
}
function on_sneak_use_block(player, block, item, blockFace) {
	const {mode} = lore_and_mode(item)
	if (mode == "teleport") teleport.sneak_use_block(player)
}

function on_use_block(player, block, item, blockFace) {
	const {lore, mode} = lore_and_mode(item)
	if (mode == "selector") selector.use_block(player, block, item, lore)
	if (mode == "ice rod") ice_rod.use_block(block, blockFace)
}

function before_hit_block(event, player, block, item) {
	const {lore, mode} = lore_and_mode(item)
	if (mode == "selector") {
		event.cancel = true
		system.run(() => selector.hit_block(player, block, item, lore))
	}
}

function after_hit_block(player, block, permutation, item) {
	const {mode} = lore_and_mode(item)
	if (mode == "delete blocks") {
		const blocks = find_connected_blocks(block, permutation.type.id)
		for (let i = 0; i < blocks.length; i++) blocks[i].setType('air')
	}
}

function before_click_entity(player, entity, item) {
	const {mode} = lore_and_mode(item)
	if (mode == "delete mobs") entity.remove()
}

function before_click_block(player, block, item) {
	const {mode} = lore_and_mode(item)
	if (mode == "count items") count_items.before_use_block(player, block, item)
}

function on_tick(player, item) {
	const {lore, mode} = lore_and_mode(item)
	if (mode == "selector") selector.tick(player, lore)
}

// events detectors
export default {
	onUse({ itemStack: item, source: player }) {
		system.run(() => { if (!player.is_using_creative_tool_on) {
			if (player.inputInfo.getButtonState("Sneak") == "Pressed") on_sneak_use(player, item)
			else on_use(player, item)
		}; delete player.is_using_creative_tool_on})
	},
	onUseOn({source: player, itemStack:item, block, blockFace}) {
		player.is_using_creative_tool_on = true
		if (player.inputInfo.getButtonState("Sneak") == "Pressed") on_sneak_use_block(player, block, item, blockFace)
		else on_use_block(player, block, item, blockFace)
	}
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
	const {player, block, brokenBlockPermutation:permutation, itemStackBeforeBreak:item} = event
	if (item?.typeId != "yasser444:creative_tool") return
	after_hit_block(player, block, permutation, item)
}) 

world.beforeEvents.playerBreakBlock.subscribe((event) => {
	const {player, block, itemStack:item} = event
	if (item?.typeId != "yasser444:creative_tool") return
	before_hit_block(event, player, block, item)
})
world.beforeEvents.playerInteractWithEntity.subscribe(event => {
	const {itemStack: item, player, target:entity} = event
	if (item?.typeId != "yasser444:creative_tool") return
	player.is_using_creative_tool_on = true
	event.cancel = true
	system.run(() => before_click_entity(player, entity, item))
})
world.beforeEvents.playerInteractWithBlock.subscribe(event => {
	const {itemStack: item, player, block} = event
	if (item?.typeId != "yasser444:creative_tool") return
	player.is_using_creative_tool_on = true
	event.cancel = true
	system.run(() => before_click_block(player, block, item))
})

system.runInterval(() => {
	world.getPlayers({gameMode: "Creative"}).forEach(player => {
		const equipment = player.getComponent("equippable")
		const item = equipment.getEquipment("Mainhand")
		if (!item || item.typeId != "yasser444:creative_tool") return
		on_tick(player, item)
	})
}, 20)