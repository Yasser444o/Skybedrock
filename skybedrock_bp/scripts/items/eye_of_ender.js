import { world, system } from "@minecraft/server" ;

let overworld
world.afterEvents.worldLoad.subscribe(() => {
	overworld = world.getDimension('overworld')
	//reset
	// world.setDynamicProperty("stronghold1");
	// world.setDynamicProperty("stronghold2");
	// world.setDynamicProperty("stronghold3");
	// world.setDynamicProperty("generatedStronghold1");
	// world.setDynamicProperty("generatedStronghold2");
	// world.setDynamicProperty("generatedStronghold3");
})


function initialize() {
	const randomAngle = Math.random() * 360;
	const angles = [ randomAngle, randomAngle + 120, randomAngle + 240 ]
	for (let i = 0; i < 3; i++) {
		world.setDynamicProperty(`stronghold${i + 1}`, getLocation(angles[i]));
	}
}

function getLocation(angle) {
	angle = (Math.PI / 180) * angle; // to radian
	return {
		x: Math.round(1280 * Math.cos(angle)),
		y: 32,
		z: Math.round(1280 * Math.sin(angle)),
	}
}

function locate(player) {
	const {location} = player
	const strongholds = [
		world.getDynamicProperty("stronghold1"),
		world.getDynamicProperty("stronghold2"),
		world.getDynamicProperty("stronghold3"),
	]
	strongholds.sort((v1, v2) => get_distance(location, v1) - get_distance(location, v2))
	const nearest = strongholds[0];
	make_particles(location, nearest)
	consume_the_eye(player)
	;[1, 2, 3].forEach(i => {
		const distance = get_distance(location, world.getDynamicProperty(`stronghold${i}`))
		const generated = world.getDynamicProperty(`generatedStronghold${i}`)
		if (distance < 64 && !generated) generate(i)
	})
}

function get_distance(a, b) {
	const relative = {
		x: b.x - a.x,
		z: b.z - a.z,
	}
	return Math.sqrt(relative.x ** 2 + relative.z ** 2)
}

function make_particles(from, to) {
	const direction = normalize(from, to)
	for (let i = 1; i <= 8; i++) {
		overworld.spawnParticle(
			"minecraft:dragon_breath_trail", {
				x: from.x + i * direction.x,
				y: from.y + 1,
				z: from.z + i * direction.z,
			}
		)
	}
}

function consume_the_eye(player) {
	if (player.getGameMode() != 'Creative' && Math.random() < 0.1) {
		world.playSound("block.itemframe.break", player.location, {volume: 1})
		player.runCommand("clear @s ender_eye 0 1")
	} else overworld.playSound("random.bow", player.location)
}

function normalize(a, b) {
	return {
		x: (b.x - a.x) / get_distance(a, b),
		z: (b.z - a.z) / get_distance(a, b),
	}
}

function generate(i) {
	const location = world.getDynamicProperty(`stronghold${i}`)
	const [x, z] = [location.x, location.z]
	world.setDynamicProperty(`generatedStronghold${i}`, true)
	world.structureManager.place(`strongholds:stronghold${i}`, overworld, {x, y: 32, z})
}

world.afterEvents.itemUse.subscribe(({itemStack, source:player}) => {
	if (itemStack?.typeId != "minecraft:ender_eye") return
	if (player.dimension != overworld) return 
	if (!world.getDynamicProperty("stronghold1")) initialize()
	locate(player)
})