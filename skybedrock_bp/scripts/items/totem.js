import { system } from "@minecraft/server";

let last_call = 0
system.afterEvents.scriptEventReceive.subscribe(({ id, message, sourceEntity: player }) => {
	if (id != "yasser444:unfall") return
	system.clearRun(last_call)
	if (message != 'yes') return
	last_call = system.runTimeout(() => {
		player.setProperty('yasser444:falling', false)
		player.runCommand("particle minecraft:totem_particle ~ ~2 ~")
		player.runCommand("playsound random.totem @a ~ ~2 ~ 10")
		const hands = player.getComponent('minecraft:equippable')
		const mainhand = hands.getEquipment('Mainhand')?.typeId
		const offhand = hands.getEquipment('Offhand')?.typeId
		system.runTimeout(() => {
			if (mainhand == "minecraft:totem_of_undying") hands.setEquipment('Mainhand')
			else if (offhand == "minecraft:totem_of_undying") hands.setEquipment('Offhand')
			else player.runCommand("clear @s totem 0 1")
		}, 5)
		system.runTimeout(() => { player.addEffect("slow_falling", 400) }, 180)
	}, 20)
})