import { world, system } from "@minecraft/server" ;
import { solidBlocks, nonSolids, instaPush } from "../data.js";

const wetBlocks = ['water', 'flowing_water'];
const headBlocks = nonSolids.concat(instaPush, wetBlocks);
const wetGroundBlocks = solidBlocks.filter((block) => { return !['soul_sand'].includes(block) }).concat(['sea_lantern']);

let overworld
world.afterEvents.worldLoad.subscribe(()=> {
	overworld = world.getDimension('overworld');
})

const swampHutSpots = [ {x:819, y:66, z:356} ];  
const pillagerOutpostSpots = [
	{x:-890, y:78, z:438},
	{x:-882, y:78, z:438},
	{x:-890, y:78, z:446},
	{x:-882, y:78, z:446}
];
const oceanMonumentSpots = [
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

function spawnWitch(spot) {
	try {
		overworld.spawnEntity("witch", spot);
	} catch {null}
}
function spawnPillager(spot) {
	try {
		if (Math.random() < 0.2) {
			overworld.spawnEntity("minecraft:pillager", spot, {spawnEvent: "minecraft:spawn_as_illager_captain"});
		} else {
			overworld.spawnEntity("pillager", spot);
		}
	} catch {null}
}
function spawnGuardian(spot) {
	try {
		overworld.spawnEntity("guardian", {x:spot.x + 0.5, y:spot.y, z:spot.z + 0.5});
	} catch {null}
}

function isLoaded(spot) {
	try {
		overworld.getBlock(spot).permutation
	} catch { return false }
	return true 
}
function isSpotDry(spot) {
	let hold = 0;
	for (let block of solidBlocks) {
		if (overworld.getBlock(spot).below().permutation.matches(block)) {hold++}
	}
	for (let block of nonSolids) {
		if (overworld.getBlock(spot).permutation.matches(block)) {hold++}
	}
	for (let block of headBlocks) {
		if (overworld.getBlock(spot).above().permutation.matches(block)) {hold++}
	}
	if (hold === 3) { return true } else {return false}
}
function isSpotWet(spot) {
	let hold = 0;
	for (let block of wetGroundBlocks) {
		if (overworld.getBlock(spot).below().permutation.matches(block)) {hold++}
	}
	for (let block of wetBlocks) {
		if (overworld.getBlock(spot).permutation.matches(block)) {hold++}
	}
	for (let block of headBlocks) {
		if (overworld.getBlock(spot).above().permutation.matches(block)) {hold++}
	}
	if (hold === 3) { return true } else {return false}
}
function isCapNotFilled(spot, mob) {
	if (
		overworld.getEntities({families:['monster']}).length < 16 && //monster cap isn't filled
		overworld.getEntities({location:spot, maxDistance:1, families:['mob']}).length === 0 && //no mob on the spawning block
		overworld.getEntities({location:spot, maxDistance:6, type:mob}).length < 2 //no witches, pillagers or guardians around the block
	) { return true } else { return false }
}
function isPlayerInRange(spot) {
	if (
		overworld.getPlayers({location:spot, maxDistance:24}).length === 0 && //no player within 24 blocks
		overworld.getPlayers({location:spot, maxDistance:44}).length !== 0 //player is within 44 blocks
	) { return true } else { return false }
}

let interval = 20
system.runTimeout(function swampHut() {
	for (let spot of swampHutSpots) {
		if (isLoaded(spot)) {
			if (isSpotDry(spot) && isCapNotFilled(spot, 'witch') && isPlayerInRange(spot)) {
				spawnWitch(spot)
			}
		}
	}
	interval = Math.ceil(Math.random() * 40);
	system.runTimeout(swampHut, interval)
}, interval)

let turn = 0
system.runInterval(function pillagerOutpost() {
	const spot = pillagerOutpostSpots[turn]
	if (isLoaded(spot)) {
		if (isSpotDry(spot) && isCapNotFilled(spot, 'pillager') && isPlayerInRange(spot)) {
			spawnPillager(spot)
		}
	}
	turn < pillagerOutpostSpots.length - 1 ? turn++ : turn = 0;
}, 20)

system.runInterval(function oceanMonument() {
	const spot = oceanMonumentSpots[Math.floor(Math.random() * (oceanMonumentSpots.length))]
	if (isLoaded(spot)) {
		if (isSpotWet(spot) && isCapNotFilled(spot, 'guardian') && isPlayerInRange(spot)) {
			spawnGuardian(spot)
		}
	}
}, 5)