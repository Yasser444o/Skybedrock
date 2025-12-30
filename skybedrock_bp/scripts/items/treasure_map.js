import { world, system } from "@minecraft/server" ;
import { stored_items } from "../startup";
import { open_map } from "../world/maps";

let overworld
world.afterEvents.worldLoad.subscribe(() => {
	overworld = world.getDimension('overworld')
})

const beach = {min_x: 32, max_x: 64, min_z: 64, max_z: 128}

export function get_cardinal_direction(player) {
  let angle = player.getRotation().y + 180
  const degree = 360 / 8;
  angle += degree / 2;
  for (let i = 0; i < 8; i++) {
    if (angle >= (i * degree) && angle < (i + 1) * degree) return i;
  }
  return 0;
}

export default function(player, item) {
	const {dimension, location} = player
	if (dimension != overworld) return
	const {x: tx, z: tz} = item.getDynamicProperty('treasure_location') ?? create_map(player, item)
	const px = Math.floor(location.x), pz = Math.floor(location.z)
	if (tx == px && tz == pz) give_treasure(player, item)
	else show_map(player, tx, tz)
}

function create_map(player, item) {
	const {min_x, max_x, min_z, max_z} = beach
	const x = min_x + Math.floor(Math.random() * (max_x - min_x))
	const z = min_z + Math.floor(Math.random() * (max_z - min_z))
	item.setDynamicProperty('treasure_location', {x, y: 0, z})
	player.getComponent('equippable').setEquipment('Mainhand', item)
	return {x, z}
}

function give_treasure(player, item) {
	const dig = () => overworld.playSound("dig.sand", player.location)
	if (player.getGameMode() == "Creative") {
		item.setDynamicProperty('treasure_location', undefined)
		player.getComponent('equippable').setEquipment('Mainhand', item)
	}
	else player.runCommand("clear @s skybedrock:sky_treasure_map 0 1")
	system.runTimeout(()=> dig(), 10)
	system.runTimeout(()=> dig(), 20)
	system.runTimeout(()=> dig(), 30)
	system.runTimeout(()=> {
		dig(); overworld.spawnItem(stored_items.sky_treasure[0], player.location)
	},40)
}

function show_map(player, tx, tz) {
	const {min_x, max_x, min_z, max_z} = beach
	const range = (max_x - min_x) / 2
	const part_z = min_z + (max_z - min_z) / 2
	const center = {x: min_x + range, z: (tz < part_z ? min_z : part_z) + range}
	open_map(player, {
		align_player: true,
		dim: overworld.id, center, range,
		markers: [{
			deco: true, dim: 'minecraft:overworld', text: '',
			texture: 'textures/ui/map/structures/x_mark',
			x: tx, z: tz,
		}]
	})
}