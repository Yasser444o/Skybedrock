import { system, world} from "@minecraft/server" ;
import { locating_players } from "./maps";
import { biome_names, nether_structures, overworld_structures } from "../data";
const all_structures = overworld_structures.concat(nether_structures)

// thanks to @madlad0
function dot(u, v) {
	return u.x * v.x + u.y * v.y + u.z * v.z
}
function cross(u, v) {
	return {
		x: u.y * v.z - u.z * v.y,
		y: u.z * v.x - u.x * v.z,
		z: u.x * v.y - u.y * v.x
	}
}
function normalize(vector) {
	const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2)
	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length,
	}
}
function get_direction(id, player) {
	if (!id) return
	const view = player.getViewDirection()
	const origin = player.location
	const target =
		player.dimension.id == "minecraft:overworld" ? overworld_structures.find(poi => poi.id == id) :
		player.dimension.id == "minecraft:nether" ? nether_structures.find(poi => poi.id == id) : undefined
	if (target) {
		const norm_view = normalize({x: view.x, y: 0, z: view.z})
		const norm_distance = normalize({x: target.x - origin.x, y: 0, z: target.z - origin.z})
		const cos = dot(norm_view, norm_distance)
		const sin = dot(cross(norm_distance, norm_view), {x:0, y:1, z:0})
		const angle = Math.atan2(sin, cos)
		return Math.floor(16 * angle / Math.PI + 16) || 0
	} else return system.currentTick % 32
}

system.runInterval(() => { world.getAllPlayers().forEach(player => {
	const biome_on = player.getDynamicProperty('biome_detector')
	const structure = locating_players.get(player.id)
  
  	if ( structure != undefined && !biome_on) {
		const direction = get_direction(structure, player)
		const structure_index = all_structures.findIndex(poi => poi.id == structure)
		player.onScreenDisplay.setActionBar(`structure:d${direction}:s${structure_index}`)
	}
    if (biome_on) {
		if ((() => { try { player.dimension.getBlock(player.location).permutation } catch { return true }})()) return
		const biome_id = player.dimension.getBiome(player.location)?.id
		const biome_name = biome_names[biome_id?.replace('minecraft:', '')]
		if (structure != undefined) {
			const direction = get_direction(structure, player)
			const structure_index = all_structures.findIndex(poi => poi.id == structure)
			player.onScreenDisplay.setActionBar(`structure:d${direction}:s${structure_index}biome:${biome_name ?? "§0The Void"}`)
		}
		else {
			player.onScreenDisplay.setActionBar(`biome:${biome_name ?? "§0The Void"}`)
			system.runTimeout(()=> { if (!player.getDynamicProperty('biome_detector')) {
				player.onScreenDisplay.setActionBar('§.')
			}}, 5)
		}
	}
})}, 2)