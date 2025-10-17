import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { world, system } from "@minecraft/server"

export default {
	onUseOn({ block, source: player, itemStack: stick }) {
		const inventory = player.getComponent("inventory").container
		const mode = stick.getLore()[0]?.replace('§r§n', '')
		if (mode == "read id") player.sendMessage("§nId: §r" + block.typeId)
		if (mode == "copy permutation")
			try { inventory.addItem(block.permutation.getItemStack()) }
			catch { player.sendMessage("§cNo Item for this permutation") }
		if (mode == "copy block") 
			try { inventory.addItem(block.getItemStack(1, true)) }
			catch { player.sendMessage("§cNo Item for this Block") }
		if (mode == "read tags") block.getTags().forEach(tag => player.sendMessage(tag))
	},
	onUse({ itemStack: stick, source: player }) {
		if (player.getBlockFromViewDirection()) return
		new ActionFormData()
		.title("Debug Stick")
		.button("Read Id Mode")
		.button("Component Mode")
		.button("Property Mode")
		.button("Copy Permutation Mode")
		.button("Copy Block Mode")
		.button("Read Tags")
		.show(player).then(({ canceled, selection }) => {
			if (canceled) return
			if (selection == 0) stick.setLore(["§r§nread id"])
			if (selection == 1) stick.setLore(["§r§nsee components"])
			if (selection == 2) stick.setLore(["§r§nread properties"])
			if (selection == 3) stick.setLore(["§r§ncopy permutation"])
			if (selection == 4) stick.setLore(["§r§ncopy block"])
			if (selection == 5) {
				stick.setLore(["§r§nread tags"])
				const item = player.getComponent('inventory').container.getItem(9)
				if (item) item.getTags().forEach(tag => player.sendMessage(tag))
			}
			player.getComponent("equippable").setEquipment('Mainhand', stick)
		})
	}
}

world.beforeEvents.playerInteractWithEntity.subscribe(event => {
	const {itemStack, player, target} = event
	if (itemStack?.typeId != "yasser444:debug_stick") return
	event.cancel = true
	
	const lore = itemStack.getLore()
	const mode = lore[0]?.replace('§r§n', '')
	if (mode == "see components") {
		const componenets = target.getComponents()
		const form = new ActionFormData().title("Entity Components")
		componenets.forEach(comp => form.button(comp.typeId))
		system.run(() => {
			form.show(player).then(({canceled, selection}) => {
				if (canceled) return
				const componenet = componenets[selection]
				if ("value" in componenet) {
					player.sendMessage(`§m-§r value: ${componenet.value}`)
				}
			})
		})
	}
	if (mode == "read properties") {
		const last_property = lore[1]?.replace('§r§7> ', '') ?? ""
		const form = new ModalFormData().title("Entity Property")
		.textField('Property Id:', 'namespace:id', {defaultValue: last_property})
		system.run(() => {
			form.show(player).then(({formValues, canceled}) => {
				if (canceled) return
				const id = formValues[0]
				lore[1] = '§r§7> ' + id
				itemStack.setLore(lore)
				player.getComponent("equippable").setEquipment('Mainhand', itemStack)
				const value = target.getProperty(id)
				player.sendMessage(`- ${id}: ${value}`)
			})
		})
	}
})