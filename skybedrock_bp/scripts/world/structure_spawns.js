import { world, system } from "@minecraft/server" ;
import { solid_blocks, non_solids, insta_push } from "../data.js";

const wet_blocks = ['water', 'flowing_water'];
const head_blocks = non_solids.concat(insta_push, wet_blocks);
const wet_ground_blocks = solid_blocks.filter((block) => { return !['soul_sand'].includes(block) }).concat(['sea_lantern']);

let overworld
world.afterEvents.worldLoad.subscribe(()=> {
	overworld = world.getDimension('overworld');
})

const ocean_monument_spots = [
	{x:605, y:42, z:785},
	{x:605, y:42, z:775},
	{x:605, y:42, z:744},
	{x:605, y:42, z:733},
	{x:616, y:42, z:785},
	{x:616, y:42, z:775},
	{x:616, y:42, z:744},
	{x:616, y:42, z:733},
	{x:647, y:42, z:785},
	{x:647, y:42, z:775},
	{x:647, y:42, z:744},
	{x:647, y:42, z:733},
	{x:657, y:42, z:785},
	{x:657, y:42, z:775},
	{x:657, y:42, z:744},
	{x:657, y:42, z:733},
	{x:622, y:40, z:769},
	{x:622, y:40, z:750},
	{x:641, y:40, z:769},
	{x:641, y:40, z:750},
	{x:632, y:49, z:760},
	{x:632, y:47, z:760}
];

function spawn_a_guardian(spot) {
	try {
		overworld.spawnEntity("guardian", {x:spot.x + 0.5, y:spot.y, z:spot.z + 0.5});
	} catch {null}
}

function is_loaded(spot) {
	try {
		overworld.getBlock(spot).permutation
	} catch { return false }
	return true 
}
function is_spot_wet(spot) {
	let hold = 0;
	for (let block of wet_ground_blocks) {
		if (overworld.getBlock(spot).below().permutation.matches(block)) {hold++}
	}
	for (let block of wet_blocks) {
		if (overworld.getBlock(spot).permutation.matches(block)) {hold++}
	}
	for (let block of head_blocks) {
		if (overworld.getBlock(spot).above().permutation.matches(block)) {hold++}
	}
	if (hold === 3) { return true } else {return false}
}
function is_cap_not_filled(spot, mob) {
	if (
		overworld.getEntities({families:['monster']}).length < 16 && //monster cap isn't filled
		overworld.getEntities({location:spot, maxDistance:1, families:['mob']}).length === 0 && //no mob on the spawning block
		overworld.getEntities({location:spot, maxDistance:6, type:mob}).length < 2 //no witches, pillagers or guardians around the block
	) { return true } else { return false }
}
function is_player_in_range(spot) {
	if (
		overworld.getPlayers({location:spot, maxDistance:24}).length == 0 && //no player within 24 blocks
		overworld.getPlayers({location:spot, maxDistance:44}).length != 0 //player is within 44 blocks
	) { return true } else { return false }
}

system.runInterval(function ocean_monument() {
	const spot = ocean_monument_spots[Math.floor(Math.random() * (ocean_monument_spots.length))]
	if (is_loaded(spot)) {
		if (is_spot_wet(spot) && is_cap_not_filled(spot, 'guardian') && is_player_in_range(spot)) {
			spawn_a_guardian(spot)
		}
	}
}, 5)