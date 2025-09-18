import { ActionFormData} from "@minecraft/server-ui" ;
import { world, system } from "@minecraft/server" ;
import { stored_items } from "../startup";

let overworld
world.afterEvents.worldLoad.subscribe(() => {
	overworld = world.getDimension('overworld')
})

export function get_cardinal_direction(player) {
  let angle = player.getRotation().y + 180
  const degree = 360 / 8;
  angle += degree / 2;
  for (let i = 0; i < 8; i++) {
    if (angle >= (i * degree) && angle < (i + 1) * degree) return i;
  }
  return 0;
}

function show_map(player, p, t) {
	const far_half = t.z >= 96
	let [markX, markZ, playerX, playerZ] = [
		t.x - 32,
		t.z - (far_half ? 96 : 64),
		p.x - 32,
		p.z - (far_half ? 96 : 64),
	];
	playerX < 0 ? playerX = 0 : playerX > 31 ? playerX = 31 : null
	playerZ < 0 ? playerZ = 0 : playerZ > 31 ? playerZ = 31 : null
	const direction = get_cardinal_direction(player);
	let map = new ActionFormData()
	.title("Treasure Map")
	map.button(`T x${markX < 10 ?'0' : ''}${markX}z${markZ}`)
	map.button(`P d${direction}x${playerX < 10 ?'0' : ''}${playerX}z${playerZ}`)
	map.show(player)
}
function create_map(player) {
	const location = {
		x: 32 + Math.floor(Math.random() * 32), y: 0,
		z: 64 + Math.floor(Math.random() * 64),
	}
	player.setDynamicProperty('treasure_location', location);
	return location
}

function give_treasure(player) {
	player.setDynamicProperty('treasure_location', undefined);
	if (player.getGameMode() != "Creative") player.runCommand("clear @s yasser444:treasure_map 0 1");
	system.runTimeout(()=>{overworld.playSound("dig.sand", player.location)},10)
	system.runTimeout(()=>{overworld.playSound("dig.sand", player.location)},20)
	system.runTimeout(()=>{overworld.playSound("dig.sand", player.location)},30)
	system.runTimeout(()=>{
		overworld.spawnItem(stored_items.sky_treasure[0], player.location)
		overworld.playSound("dig.sand", player.location)
	},40)
}
export default {
	onUse({source:player}) {
		const {dimension, location} = player
		if (dimension != overworld) return
		const treasure_loc = player.getDynamicProperty('treasure_location') ?? create_map(player);
		const player_loc = {x: Math.floor(location.x), z: Math.floor(location.z)};
		if (treasure_loc.x == player_loc.x && treasure_loc.z == player_loc.z) give_treasure(player)
		else show_map(player, player_loc, treasure_loc)
	}
}