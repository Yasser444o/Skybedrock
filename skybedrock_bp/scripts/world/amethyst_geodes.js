import { system, world } from "@minecraft/server"
import { MersenneTwister, umul32_lo } from "../utilities"
import { overworld } from "../startup"
import { generated_chunks } from "../generated"

const salt = 63457536
const chance = 24
export const new_chunks = []
export const chunks = new Set(generated_chunks)

function has_geode(x, z) {
	let x_uint = x >>> 0;
	let z_uint = z >>> 0;
	let seed = umul32_lo(x_uint, 0x1f1f1f1f) ^ z_uint;
	let mt = new MersenneTwister(seed ^ salt);
	let n = mt.random_int();
	return (n % chance == 0);
}


function scan_chunks(location) {
	const chunk_x = Math.floor(location.x / 16), chunk_z = Math.floor(location.z / 16)
	for (let x = chunk_x - 1; x <= chunk_x + 1; x++) for (let z = chunk_z - 1; z <= chunk_z + 1; z++) {
		const hash = `${x} ${z}`
		if (chunks.has(hash)) continue; chunks.add(hash)
		new_chunks.push(hash)
		if (!has_geode(x, z)) continue
		overworld.playSound("fall.amethyst_block", location)
		world.structureManager.placeJigsawStructure('skybedrock:amethyst_geode', overworld,
			{ x: x * 16, y: location.y ,z: z * 16, }
		)
	}
}

world.afterEvents.itemUse.subscribe(({source: player, itemStack}) => {
	if (player.typeId != 'minecraft:player') return
	if (player.dimension != overworld) return
	if (itemStack.typeId != 'minecraft:goat_horn') return
	scan_chunks(player.location)
})

export const amethyst_formation = {
	onTick({block}) {
		block.dimension.spawnParticle("skybedrock:amethyst_shine", block.center())
	},
	onPlayerInteract({block, player, dimension}) {
		const amethyst = 'minecraft:amethyst_block'
		const equipment = player.getComponent('minecraft:equippable')
		if (equipment.getEquipment('Mainhand')?.typeId != amethyst) return
		dimension.playSound("fall.amethyst_block", player.location)
		block.setType('budding_amethyst')
		if (player.getGameMode() == 'Creative') return
		player.runCommand(`clear @s ${amethyst} 0 1`)
	}
}