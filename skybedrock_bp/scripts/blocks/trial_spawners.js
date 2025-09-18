import { world, system } from "@minecraft/server";

function get_corners(block) {
	return [
		block.north().west(),
	    block.north().east(),
	    block.south().west(),
	    block.south().east(),
	]
}
function is_poisonous(block) {
	return block.typeId == 'minecraft:podzol' && block.above().typeId == 'minecraft:red_mushroom'
}
function is_web(block) {
	return block.typeId == 'minecraft:stone' && block.above().typeId == 'minecraft:web'
}
function spawner_layout(block) {
	const middle = block.below();
	return (
		['minecraft:waxed_copper', 'minecraft:copper_block'].includes(middle.typeId) &&
		['north', 'east', 'south', 'west'].every(side => [
			'minecraft:waxed_chiseled_copper',
			'minecraft:chiseled_copper'
		].includes(middle[side]().typeId))
	)
}

function get_materials(middle) {
	const materials = {tuff:0, cobble:0, moss:0, sand:0, brick:0, web:0, poison:0, ice:0, bone:0}
	for (let corner of get_corners(middle)) {
		corner.typeId == "minecraft:chiseled_tuff" ? materials.tuff++ :
		corner.typeId == "minecraft:mossy_cobblestone" ? [materials.cobble++, materials.moss++] :
		corner.typeId == "minecraft:chiseled_sandstone" ? materials.sand++ :
		corner.typeId == "minecraft:moss_block" ? materials.moss++ :
		corner.typeId == "minecraft:stone_bricks" ? materials.brick++ :
		corner.typeId == "minecraft:cobblestone" ? materials.cobble++ :
		corner.typeId == "minecraft:packed_ice" ? materials.ice++ :
		corner.typeId == "minecraft:bone_block" ? materials.bone++ :
		is_web(corner) ? materials.web++ :
		is_poisonous(corner) ? materials.poison++ : null
	}
	return materials
}
function get_mob(materials) {
	return (
		materials.tuff == 4 ? 'breeze' :
		materials.cobble == 4 && materials.moss == 4 ? 'zombie' :
		materials.sand == 4 ? 'husk' :
		materials.moss == 4 ? 'slime' :
		materials.brick == 4 ? 'silverfish' :
		materials.cobble == 4 && materials.moss == 2 ? 'baby' :
		materials.web == 4 ? 'spider' :
		materials.web == 2 && materials.poison == 2 ? 'cave_spider' :
		materials.ice == 4 ? 'stray' :
		materials.bone == 4 ? 'skeleton' :
		materials.bone == 2 && materials.poison == 2 ? 'bogged' : undefined
	)
}
function activate(block) {
	world.structureManager.place(`trials:${block.mob}_trial`, block.dimension, block.location)
	block.below().setType('waxed_copper')
	block.below().north().setType('waxed_chiseled_copper')
	block.below().south().setType('waxed_chiseled_copper')
	block.below().east().setType('waxed_chiseled_copper')
	block.below().west().setType('waxed_chiseled_copper')
}

export default {
	onPlayerInteract({block, dimension, player}) {
		if (dimension.id != 'minecraft:overworld') return
		const equipment = player.getComponent("minecraft:equippable")
		const item = equipment.getEquipment("Mainhand")
		if (item?.typeId != "minecraft:trial_key") return
		if (player.getGameMode() != 'Creative' && player.level < 20) return
		if (!spawner_layout(block)) return
		const materials = get_materials(block.below())
		block.mob = get_mob(materials)
		if (!block.mob) return
		system.run(()=> {
			activate(block)
			if (player.getGameMode() == 'Creative') return
			player.addLevels(-20)
			player.runCommand('clear @s trial_key 0 1')
		})
	}
}

let last_hit; let hits = 0
world.beforeEvents.playerInteractWithBlock.subscribe(({itemStack:item, player, block, isFirstEvent}) => {
	if (!isFirstEvent) return
	if (item?.typeId != 'minecraft:mace') return
	if (block.typeId != 'minecraft:trial_spawner') return
	const {dimension, location, x, y, z} = block
	last_hit == `${x} ${y} ${z}` ? hits++ : hits = 0; last_hit = `${x} ${y} ${z}`
	system.run(() => {
		player.playAnimation('animation.player.swing')
		block.dimension.playSound("trial_spawner.break", player.location)
		if (hits >= 2) { hits = 0; last_hit = undefined
			dimension.setBlockType(location, "yasser444:empty_spawner")
		}
		
		if (player.getGameMode() == 'Creative') return
		const unbreaking = item.getComponent('enchantable')?.getEnchantment('unbreaking')?.level ?? 0
		if (Math.random() * (unbreaking + 1) >= 1) return
		const durability = item.getComponent('durability')
		if (durability.maxDurability == durability.damage) {
			item = undefined
			dimension.playSound('random.break', player.location)
		} else durability.damage++
		player.getComponent('equippable').setEquipment('Mainhand', item)
	})
})