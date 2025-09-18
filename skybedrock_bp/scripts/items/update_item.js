import {ItemStack} from "@minecraft/server"

export default {
	onUse({source:player, itemStack}, {params}) {
        const new_item = new ItemStack(params.new_id, itemStack.amount)
        player.getComponent("equippable").setEquipment('Mainhand', new_item)
	}
}