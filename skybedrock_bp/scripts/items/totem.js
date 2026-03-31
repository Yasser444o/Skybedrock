import { system, world } from "@minecraft/server"

world.beforeEvents.entityHurt.subscribe(event => {
	// check for a player taking void damage with totem_of_unfalling enabled
	if (event.hurtEntity.typeId != "minecraft:player") return
	if (event.damageSource.cause != "void") return
	const player = event.hurtEntity
	if (!player.getDynamicProperty('totem_of_unfalling')) return
	// check the player hands for a totem
	const equipment = player.getComponent('equippable')
	const totem = ['Offhand', 'Mainhand'].find(hand => 
		equipment.getEquipment(hand)?.typeId == 'minecraft:totem_of_undying'
	)
	if (!totem && !player.void_immunity) return
	// cancel the damage
	event.cancel = true
	if (!player.void_immunity) {
		// make the player immune to void damage
		player.void_immunity = true
		system.run(() => {
			// give the player levitation immediately
			player.addEffect('levitation', 200, {amplifier: 18})
			// using commands because api calls do not work outside world boundaries
			player.runCommand("particle minecraft:totem_particle ~ ~ ~") // player.dimension.spawnParticle('minecraft:totem_particle', {x, y: y + 2, z})
			player.runCommand("playsound random.totem @a ~ ~ ~ 10") // player.dimension.playSound('playsound random.totem', {x, y: y + 2, z}, { volume: 10 })
			// remove the totem 
			if (equipment.getEquipment(totem)?.typeId == 'minecraft:totem_of_undying') equipment.setEquipment(totem)
			else player.runCommand('clear @s totem_of_undying 0 1')
			// give the player slow falling once the levitation runs out 
			system.runTimeout(() => player.addEffect("slow_falling", 400), 200)
		})
	}
	// if the player takes void damage reset the timer
	if (player.immunity_timer) system.clearRun(player.immunity_timer)
	// clear the player's void immunity once safe from the void
	player.immunity_timer = system.runTimeout(() => {
		delete player.void_immunity
		delete player.immunity_timer
	}, 20)
})