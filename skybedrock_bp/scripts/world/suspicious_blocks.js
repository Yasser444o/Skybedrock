import { world, system } from "@minecraft/server" ;

const structures = [
	{
		delay: 1800,
		type: "sand_pyramid",
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
		]
	},
	{
		delay: 900,
		type: "sand_well",
		locations: [
			{x:-772, y:63, z:-279},
			{x:-773, y:63, z:-278},
			{x:-773, y:63, z:-280},
			{x:-774, y:63, z:-279},
			{x:-773, y:63, z:-279},
		]
	},
	{ 
		delay: 2100,
		type: "sand_warm",
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
		]
	},
	{
		delay: 1500,
		type: "gravel_cold",
		locations: [
			{x:-627, y:42, z:275},
			{x:-630, y:41, z:276},
			{x:-638, y:42, z:278},
			{x:-638, y:41, z:283},
			{x:-633, y:42, z:285},
			{x:-627, y:41, z:283},
			{x:-635, y:41, z:286},
			{x:-635, y:41, z:274},
		]
	},
	{
		delay: 3600,
		type: "gravel_common",
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
		]
	},
	{
		delay: 4800,
		type: "gravel_rare",
		locations: [
			{x:129, y:50, z:-832},
			{x:134, y:48, z:-841},
			{x:121, y:46, z:-829},
			{x:130, y:45, z:-830},
		]
	}
]

// set random timeouts for each suspicious block location
let overworld, timer
world.afterEvents.worldLoad.subscribe(()=> {
	overworld = world.getDimension('overworld')
	timer = world.scoreboard.getObjective('Timer')
	structures.forEach(structure => {
		const part_size = Math.floor(structure.delay / structure.locations.length); let k = 0
		structure.locations.forEach(location => {
			location.timeout = k + Math.floor(Math.random() * part_size); k += part_size
		})
	})
})

let queue = new Set()
system.runInterval(() => {
	if (!timer?.isValid) return
	// tick the timers up
	structures.forEach(({type, locations, delay}) => {
		if ((timer.hasParticipant(type) ? timer.getScore(type) : 0 ) < delay) {
			timer.addScore(type, 1)
		} else timer.setScore(type, 0)
		// check every suspisious block location
		locations.forEach(location => {
			const {x, y, z, timeout} = location
			const block_type = type.startsWith('sand') ? 'sand' : type.startsWith('gravel') ? 'gravel' : undefined
			if (timer.getScore(type) == timeout && overworld.getBlock(location)?.typeId == `minecraft:${block_type}`) {
				queue.add(`${x} ${y} ${z} ${type}`)
			} else if (overworld.getBlock(location)?.typeId == 'minecraft:air') {
				const particle = `minecraft:falling_dust_${block_type}_particle`
				const location = {x: x + 0.49, y: y + 0.8, z: z + 0.49}
				overworld.spawnParticle(particle, location)
			}
		})
	})
	queue.forEach(hash => {
		const [x, y, z, type] = hash.split(' ')
		const location = {x: +x, y: +y, z: +z}
		if (!overworld.isChunkLoaded(location)) return
		queue.delete(hash)
		world.structureManager.place(`sus_blocks:${type}`, overworld, location)
	})
}, 20)