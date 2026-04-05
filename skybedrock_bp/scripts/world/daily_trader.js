import { system, world } from "@minecraft/server";
import { nether, overworld, the_end } from "../startup";

let run_id = 0

export default function(enable) {
	world.setDynamicProperty('daily_trader', enable ? true : undefined)
	if (enable) { if (!run_id) run_id = system.runInterval(() => {
		if (world.getTimeOfDay() == 0) summon() // morning
		else if (world.getTimeOfDay() == 12000) leave() // sunset
	})}
	else {
		leave()
		system.clearRun(run_id)
		run_id = 0
	}
}

// remove residual daily traders
world.afterEvents.entityLoad.subscribe(({entity}) => {
	if (entity.typeId != 'minecraft:wandering_trader') return
	const departure = entity.getDynamicProperty('departure_time')
	if (!departure || departure < system.currentTick) return
	entity.remove()
})

// setup the trader penalty
world.afterEvents.entityDie.subscribe(({deadEntity: entity}) => {
	if (entity.typeId != 'minecraft:wandering_trader') return
	if (!entity.getDynamicProperty('departure_time')) return
	world.sendMessage({rawtext: [{text: '§c'}, {translate: `chat.daily_trader.you_murderer`}]})
	world.setDynamicProperty('trader_penalty', system.currentTick + 24000 * 3)
})

const prohibited_blocks = new Set([
	'minecraft:magma',
])

// generate the spawning spots array
const spawning_range = []
const spawning_range_indices = []
const min_range = 10, max_range = 20
const min_distance = min_range**2, max_distance = max_range**2
for (let x = -max_range, i = 0; x <= max_range; x++) for (let z = -max_range; z <= max_range; z++) {
	const distance = x**2 + z**2
	if (distance > max_distance || distance < min_distance) continue
	spawning_range.push({x, z})
	spawning_range_indices.push(i); i++
}

function get_spawning_block({x, z}, index) {
	const relative = spawning_range[index]
	const location = {x: x + relative.x, z: z + relative.z}
	const block = overworld.getTopmostBlock(location)
	if (!block) return
	if (block.y != block.dimension.heightRange.max - 1) {
		if (!block.above().isAir) return
		if (!block.offset({x: 0, y: 2, z: 0}).isAir) return
	}
	if (prohibited_blocks.has(block.typeId)) return
	return block
}

function spawn_entity(block) {
	const trader = block.dimension.spawnEntity('wandering_trader', {
		...block.center(),
		y: block.y + 1
	})
	// schedule a time to leave
	trader.setDynamicProperty('departure_time', system.currentTick + 12000)
	// remove the llamas
	system.run(() => trader.dimension.getEntities({type: 'trader_llama', location: trader.location}).forEach(llama => llama.remove()))
}

function summon() {
	// process the penalty
	const penalty = world.getDynamicProperty('trader_penalty')
	// skip if penalty still standing
	if (penalty) if (penalty > system.currentTick) return
		// else remove the penalty
		else world.setDynamicProperty('trader_penalty')
	// skip if a vanilla wandering trader is present
	if (overworld.getEntities({type: 'wandering_trader'}).length) return
	// get a random player from the overworld
	const players = overworld.getPlayers()
	const player = players[(Math.random() * players.length) | 0]
	// get all spawning spots
	const indices = [...spawning_range_indices]
	while (indices.length > 0) {
		// select a random spot
		const selected = (Math.random() * indices.length) | 0
		// remove it from the array
		indices[selected] = indices[indices.length - 1]; indices.pop()
		// check if the spot is valid
		const block = get_spawning_block(player.location, indices[selected])
		if (!block) continue
		// spawn a wandering trader
		spawn_entity(block); break
	}
}

function leave() {
	;[overworld, nether, the_end].forEach(dimension =>
		dimension.getEntities({type: 'wandering_trader'}).forEach(entity =>
			entity.getDynamicProperty('departure_time') ? entity.remove() : null
		)
	)
}