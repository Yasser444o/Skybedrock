import {ItemStack} from "@minecraft/server"

export default {
	onUse({source:player, itemStack}, {params}) {
        const new_item = new ItemStack(params.new_id)
        player.runCommand(`clear @s ${itemStack.typeId} 0 1`)
		const remaining_item = player.getComponent('inventory').container.addItem(new_item)
		if (remaining_item) player.dimension.spawnItem(remaining_item, player.location)
	}
}