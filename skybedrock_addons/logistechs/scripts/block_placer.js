import { world, system } from "@minecraft/server"

const placeable_blocks = new Set([
	"minecraft:deepslate",
	"minecraft:dirt",
	"minecraft:coarse_dirt",
	"skybedrock:nether_gravel",
	"minecraft:white_concrete_powder",
	"minecraft:light_gray_concrete_powder",
	"minecraft:gray_concrete_powder",
	"minecraft:black_concrete_powder",
	"minecraft:brown_concrete_powder",
	"minecraft:red_concrete_powder",
	"minecraft:orange_concrete_powder",
	"minecraft:yellow_concrete_powder",
	"minecraft:lime_concrete_powder",
	"minecraft:green_concrete_powder",
	"minecraft:cyan_concrete_powder",
	"minecraft:light_blue_concrete_powder",
	"minecraft:blue_concrete_powder",
	"minecraft:purple_concrete_powder",
	"minecraft:magenta_concrete_powder",
	"minecraft:pink_concrete_powder",
])

const piston_directions = [ "below", "above", "south", "north", "east", "west" ]
const hopper_directions = [ "below", "above", "north", "south", "west", "east" ]
const get_hash = ({x, y, z}) => `${x} ${y} ${z}`

world.afterEvents.pistonActivate.subscribe(({piston, dimension, isExpanding}) => {
	if (piston.state != "Retracting") return // is retracting
	if (piston.getAttachedBlocks().length) return // is not pulling
	system.runTimeout(() =>{
		if (piston.isMoving) return // is not moving
		const typeId = piston.block.typeId
		if (typeId != "minecraft:piston" && typeId != "minecraft:sticky_piston") return // still a pison
		const direction = piston_directions[piston.block.permutation.getState("facing_direction")]
		const block = piston.block[direction]() // get the block infront
		if (!dimension.isChunkLoaded(block)) return // is loaded
		if (block.typeId != "minecraft:air") return // is empty space
		const piston_hash = get_hash(piston.block)
		const hoppers = piston_directions.map(direction => piston.block[direction]())
		.filter(hopper => {
			if (hopper.typeId != "minecraft:hopper") return // is a hopper
			if (hopper.permutation.getState("toggle_bit")) return // isn't powered
			const point = hopper_directions[hopper.permutation.getState("facing_direction")]
			const point_block = hopper[point]() // get the block infront
			if (!dimension.isChunkLoaded(point_block)) return // is loaded
			return get_hash(point_block) == piston_hash // is the piston
		}) // facing the piston
		for (const hopper of hoppers) {
			const container = hopper.getComponent('inventory').container
			for (let i = 0; i < container.size; i++) {
				let item = container.getItem(i) // get the item in each slot
				const id = item?.typeId // get the id of the item
				if (id == undefined || !placeable_blocks.has(id)) continue // is it placeable
				if (item.amount == 1) item = undefined // if one is remaining remove it
				else item.amount-- // or deduce the amount by 1
				container.setItem(i, item) // return the item to the hopper
				block.setType(id); return // place the block and finish
			}
		}
	}, 2)
})