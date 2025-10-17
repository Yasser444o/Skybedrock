import { ActionFormData } from "@minecraft/server-ui"
import { world, system } from "@minecraft/server"

export default {
	onUse({ itemStack: stick, source: player }) {
		if (player.getBlockFromViewDirection()) return
		new ActionFormData()
		.title("Creative Tool")
		.button("Delete Mobs")
		.button("Delete Blocks")
		.show(player).then(({ canceled, selection }) => {
			if (canceled) return
			if (selection == 0) stick.setLore(["§r§ndelete mobs"])
			player.getComponent("equippable").setEquipment('Mainhand', stick)
		})
	}
}

world.beforeEvents.playerInteractWithEntity.subscribe(event => {
	const {itemStack, player, target:entity} = event
	if (itemStack?.typeId != "yasser444:creative_tool") return
	event.cancel = true
	
	const lore = itemStack.getLore()
	const mode = lore[0]?.replace('§r§n', '')
	
	system.run(() => {
		if (mode == "delete mobs") entity.remove()
	})
})