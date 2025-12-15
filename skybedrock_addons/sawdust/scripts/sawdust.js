import { world, system } from "@minecraft/server"

const logs = {
	'minecraft:oak_log': ['minecraft:oak_leaves', 'minecraft:azalea_leaves', 'minecraft:azalea_leaves_flowered', ],
	'minecraft:spruce_log' : 'minecraft:spruce_leaves',
	'minecraft:birch_log': 'minecraft:birch_leaves',
	'minecraft:jungle_log': 'minecraft:jungle_leaves',
	'minecraft:dark_oak_log': 'minecraft:dark_oak_leaves',
	'minecraft:acacia_log': 'minecraft:acacia_leaves',
	'minecraft:mangrove_log': 'minecraft:mangrove_leaves',
	'minecraft:cherry_log': 'minecraft:cherry_leaves',
	'minecraft:pale_oak_log': 'minecraft:pale_oak_leaves',
	'minecraft:crimson_stem': 'minecraft:nether_wart_block',
	'minecraft:warped_stem': 'minecraft:warped_wart_block',
}
const offsets = []
for (let y = 0; y <= 1; y++) {
	for (let x = -1; x <= 1; x++) {
		for (let z = -1; z <= 1; z++) {
			if (`${x}${y}${z}` == '000') continue
			offsets.push({x, y, z})
		}
	}
}

// function search_for_leaves(block, type) {
// 	const leaf_types = typeof logs[type] == 'string' ? [logs[type]] : logs[type]
//     for (const x of [-1, 0, 1]) {
//         for (const y of [-1, 0, 1]) {
//             for (const z of [-1, 0, 1]) {
//                 if (leaf_types.includes(block.offset({x, y, z}).typeId)) return true
//             }
//         }
//     }
// 	const log = search_for_log(block, type, new Set())
// 	if (log.x == block.x && log.y == block.y && log.z == block.z) return
// 	return search_for_leaves(log, type)
// }

function search_for_log(block, type) {
	const limit = 1024
    const stack = [block]
    const start_hash = `${block.x} ${block.y} ${block.z}`;
    const visited = new Set([start_hash])

    let current_block
    while (stack.length > 0) {
        current_block = stack.pop(); let new_branch
		for (const offset of offsets) {
			const found_block = current_block.offset(offset)
			if (found_block.typeId != type) continue
			const found_hash = `${found_block.x} ${found_block.y} ${found_block.z}`
			if (visited.has(found_hash)) continue
			visited.add(found_hash)
			stack.push(current_block)
			stack.push(found_block)
			new_branch = true
			break
		}
		if (stack.length >= limit) return current_block
		if (!new_branch) return current_block
	};
	return current_block
}

world.afterEvents.playerBreakBlock.subscribe(({block, player, brokenBlockPermutation:permutation, itemStackBeforeBreak:item}) => {
	if (!item?.getTags().includes('minecraft:is_axe')) return // using axe
	const type = permutation.type.id
	if (!Object.keys(logs).includes(type)) return // breaking logs
	if (player.inputInfo.getButtonState("Sneak") == "Pressed") return // not sneaking
	// if(!search_for_leaves(block, type)) return  // make sure it's a tree, not functional
	const last_log = search_for_log(block, type) // find the farthest log
	if (last_log.x == block.x && last_log.y == block.y && last_log.z == block.z) return  // not the same block
	last_log.setPermutation(block.permutation)  // remove the last log
	block.setPermutation(permutation)  // replace the broken log
}) 
