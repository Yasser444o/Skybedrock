import { system, world} from "@minecraft/server" ;
import { locating_players } from "./maps";
import { biome_names, nether_structures, overworld_structures } from "../data";
import { cross, dot, normalize } from "../utilities";
const all_structures = overworld_structures.concat(nether_structures)

function get_direction(target, player) {
	if (target && target.dim == player.dimension.id) {
		const view = player.getViewDirection()
		const origin = player.location
		const norm_view = normalize({x: view.x, y: 0, z: view.z})
		const norm_distance = normalize({x: target.x - origin.x, y: 0, z: target.z - origin.z})
		const cos = dot(norm_view, norm_distance)
		const sin = dot(cross(norm_distance, norm_view), {x:0, y:1, z:0})
		const angle = Math.atan2(sin, cos)
		return Math.floor(16 * angle / Math.PI + 16) || 0
	} else return system.currentTick % 32
}

system.runInterval(() => { world.getAllPlayers().forEach(player => {
	if (!player.dimension.isChunkLoaded(player.location)) return	
	const biome_on = player.getDynamicProperty('biome_detector')
	const waypoint = player.waypoint
	let hud_biome = ''
	let hud_waypoint = ''
	if (biome_on) {
		const biome_id = player.dimension.getBiome(player.location)?.id
		const biome_name = biome_names[biome_id?.replace('minecraft:', '')] ?? "§0The Void"
		hud_biome = `biome:l${biome_name.replace('§', '..').length}:b${biome_name}`
	} if (waypoint) {
		const {name} = waypoint
		const direction = get_direction(waypoint, player)
		hud_waypoint = `waypoint:d${direction}:w${name}`
	} if (biome_on || waypoint) player.onScreenDisplay.setActionBar(`${hud_biome}${hud_waypoint}`)
})}, 2)