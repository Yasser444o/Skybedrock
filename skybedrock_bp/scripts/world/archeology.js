import { world, system } from "@minecraft/server" ;
import { overworld } from "../startup";

function choose_randomly(pools) {
	const weights = []; let total = 0
	for (const pool of pools) weights.push(total += pool.weight)
	const choice = Math.random() * total
	const index = weights.findIndex(weight => weight >= choice)
	return pools[index].loot
}

const structures = {
	desert_pyramid: {
		cooldown: 1800,
		blocktype: 'sand',
		locations: [
			{x:-763, y:63, z:-262},
			{x:-766, y:63, z:-265},
			{x:-765, y:63, z:-263},
			{x:-764, y:64, z:-262},
			{x:-766, y:64, z:-264},
			{x:-760, y:63, z:-269},
			{x:-759, y:63, z:-271},
			{x:-758, y:64, z:-270},
			{x:-758, y:63, z:-268},
			{x:-759, y:63, z:-266},
		],
		bonus_blocks: {
			hardened_clay: 'sherds',
			emerald_block: 'emerald',
			diamond_block: 'diamond',
			red_wool: 'tnt',
		}
	},
	desert_well: {
		cooldown: 900,
		blocktype: 'sand',
		locations: [
			{x:-772, y:63, z:-279},
			{x:-773, y:63, z:-278},
			{x:-773, y:63, z:-280},
			{x:-774, y:63, z:-279},
			{x:-773, y:63, z:-279},
		],
		bonus_blocks: {
			hardened_clay: 'sherds',
			emerald_block: 'emerald',
			petrified_oak_double_slab: 'petrified_slabs',
		}
	},
	warm_ocean_ruins: {
		cooldown: 2100,
		blocktype: 'sand',
		locations: [
			{x:-650, y:42, z:252},
			{x:-654, y:41, z:250},
			{x:-647, y:41, z:248},
			{x:-651, y:41, z:244},
			{x:-646, y:41, z:245},
			{x:-644, y:41, z:241},
			{x:-645, y:41, z:254},
			{x:-644, y:41, z:251},
			{x:-651, y:42, z:247},
			{x:-642, y:42, z:248},
		],
		bonus_blocks: {
			hardened_clay: 'sherds',
			emerald_block: 'emerald',
			gold_block: 'gold',
			coal_block: 'coal',
			moss_block: 'sniffer_eggs',
		}
	},
	cold_ocean_ruins: {
		cooldown: 1500,
		blocktype: 'gravel',
		locations: [
			{x:-627, y:42, z:275},
			{x:-630, y:41, z:276},
			{x:-638, y:42, z:278},
			{x:-638, y:41, z:283},
			{x:-633, y:42, z:285},
			{x:-627, y:41, z:283},
			{x:-635, y:41, z:286},
			{x:-635, y:41, z:274},
		],
		bonus_blocks: {
			hardened_clay: 'sherds',
			emerald_block: 'emerald',
			gold_block: 'gold',
			coal_block: 'coal',
			waxed_copper: 'nautilus_armor',
		}
	},
	trail_ruins: {
		cooldown: 3900,
		blocktype: 'gravel',
		locations: [
			{x:131, y:45, z:-824},
			{x:135, y:45, z:-829},
			{x:128, y:40, z:-857},
			{x:131, y:40, z:-855},
			{x:134, y:41, z:-850},
			{x:137, y:42, z:-853},
			{x:126, y:43, z:-847},
			{x:137, y:45, z:-842},
			{x:136, y:43, z:-844},
			{x:129, y:43, z:-843},
			{x:127, y:44, z:-836},
			{x:123, y:47, z:-832},
			{x:125, y:45, z:-829},
			{x:131, y:51, z:-831},
			{x:139, y:46, z:-832},
			{x:140, y:46, z:-828},
			{x:129, y:50, z:-832},
			{x:134, y:48, z:-841},
			{x:121, y:46, z:-829},
			{x:130, y:45, z:-830},
		],
		pools: [
			{ loot: "common", weight: 80 },
			{ loot: "rare", weight: 20 },
		],
		bonus_blocks: {
			hardened_clay: 'sherds',
			emerald_block: 'emerald',
			gold_block: 'gold',
			coal_block: 'coal',
			honeycomb_block: 'candles',
			oak_wood: 'dead_bushes',
			clay: 'clay',
		}
	}
}

const timer = {
	scoreboard: undefined,
	queue: new Set()
}


// get the timer scoreboard and set random timeouts for each suspicious block location
world.afterEvents.worldLoad.subscribe(()=> {
	timer.scoreboard = world.scoreboard.getObjective('Timer') ?? world.scoreboard.addObjective('Timer')
	Object.values(structures).forEach(structure => {
		const parts = (structure.cooldown / structure.locations.length) | 0; let part = 0
		structure.locations.forEach(spot => { spot.timeout = part + (Math.random() * parts) | 0; part += parts })
	})
})

system.runInterval(() => {
	// check if this scoreboard is still valid
	if (!timer.scoreboard?.isValid) return
	Object.keys(structures).forEach(name => {
		const {locations, cooldown, blocktype} = structures[name]
		const exists = timer.scoreboard.hasParticipant(name)
		const time = exists ? timer.scoreboard.getScore(name) : 0
		// check every suspicious block
		locations.forEach(location => {
			const {x, y, z, timeout} = location
			// add the block to the queue once its timeout is reached
			if (time == timeout) { timer.queue.add(`${x} ${y} ${z} ${name}`); return }
			// check if the chunk is loaded
			if (!overworld.isChunkLoaded(location)) return
			const block = overworld.getBlock(location)
			// check if that location is empty
			if (block?.typeId != 'minecraft:air') return
			const particle = `minecraft:falling_dust_${blocktype}_particle`
			// spawn a dust particle
			overworld.spawnParticle(particle, {x: x + 0.49, y: y + 0.8, z: z + 0.49})
		})
		// set, reset, or tick the timer
		if (!exists || time >= cooldown) timer.scoreboard.setScore(name, 0)
		else timer.scoreboard.addScore(name, 1)
	})
	timer.queue.forEach(hash => {
		const [x, y, z, name] = hash.split(' ')
		const location = {x: +x, y: +y, z: +z}
		// wait for the chunk to become loaded
		if (!overworld.isChunkLoaded(location)) return
		timer.queue.delete(hash)
		const block = overworld.getBlock(location)
		const {blocktype, pools, bonus_blocks} = structures[name]
		// check the blocktype
		if (block?.typeId != `minecraft:${blocktype}`) return
		// check the block below
		const bonus_type = block.below().typeId.replace('minecraft:', '')
		const bonus = bonus_type in bonus_blocks ? bonus_blocks[bonus_type] : undefined
		// build the suspicious block
		const table = bonus ? bonus : pools ? choose_randomly(pools) : 'default'
		const sus_block = `sus_blocks:${name}/${table}`
		console.log(sus_block)
		world.structureManager.place(sus_block, overworld, location)
	})
}, 20)