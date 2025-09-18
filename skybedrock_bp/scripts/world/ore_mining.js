import { system, world } from "@minecraft/server"

const diamond_tier = ["minecraft:diamond_pickaxe", "minecraft:netherite_pickaxe"]
const iron_tier = ["minecraft:iron_pickaxe", ...diamond_tier]
const stone_tier = ["minecraft:stone_pickaxe", ...iron_tier]
const wood_tier = ["minecraft:wooden_pickaxe", "minecraft:golden_pickaxe", ...stone_tier]

const one_item_loot = [
    "minecraft:coal_ore",
    "minecraft:iron_ore",
    "minecraft:gold_ore",
    "minecraft:quartz_ore",
    "minecraft:emerald_ore",
    "minecraft:diamond_ore",
    "minecraft:deepslate_coal_ore",
    "minecraft:deepslate_iron_ore",
    "minecraft:deepslate_gold_ore",
    "minecraft:deepslate_emerald_ore",
    "minecraft:deepslate_diamond_ore",
]

function wrong_tool(block, item) {
	return (block.hasTag("require_wooden_pickaxe") && !wood_tier.includes(item))
	|| (block.hasTag("require_stone_pickaxe") && !stone_tier.includes(item))
	|| (block.hasTag("require_iron_pickaxe") && !iron_tier.includes(item))
	|| (block.hasTag("require_diamond_pickaxe") && !diamond_tier.includes(item))
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
	const {block, dimension, player, itemStack} = event
	const item = itemStack?.typeId
	if (!(player.getGameMode() == "Creative") && wrong_tool(block, item)) {
		event.cancel = true
		system.run(()=>{
			dimension.playSound("dig.stone", block.location)
			block.setType("air")
		})
	}
})

system.runInterval(()=> {
	world.getAllPlayers().forEach(player => {
		const item = player.getComponent("minecraft:equippable").getEquipment("Mainhand")?.typeId
		const block = player.getBlockFromViewDirection({
			includeTags: ["require_wooden_pickaxe", "require_stone_pickaxe", "require_iron_pickaxe", "require_diamond_pickaxe"],
			maxDistance: 7
		})?.block
		if (!block) return
		const ore = block.permutation
		if (wrong_tool(block, item)) block.setPermutation(ore.withState("yasser444:mining_speed", "slow"))
		else block.setPermutation(ore.withState("yasser444:mining_speed", "normal"))
	})
}, 2)


// const multi_item_loot = [
//     "minecraft:lapis_ore",
//     "minecraft:copper_ore",
//     "minecraft:redstone_ore",
//     "minecraft:nether_gold_ore",
//     "minecraft:lit_redstone_ore",
//     "minecraft:deepslate_lapis_ore",
//     "minecraft:deepslate_copper_ore",
//     "minecraft:deepslate_redstone_ore",
//     "minecraft:lit_deepslate_redstone_ore",
// ]
//const ores = one_item_loot.concat(multi_item_loot)

// prevent exploding (canceled because of the wither)
// world.beforeEvents.explosion.subscribe(event => {
//     const blocks = event.getImpactedBlocks().filter(block => !ores.includes(block.typeId))
//     event.setImpactedBlocks(blocks)
// })

function bad_tool(item, typeId) {
	if (!item) return true
	const a = (block, tier) => block && !tier.includes(item.typeId)
	const b = (blocks) => blocks.map(block => 'minecraft:' + block).includes(typeId)
	if (a(b(["coal_ore", "quartz_ore", "deepslate_coal_ore"]), wood_tier)) return true
	if (a(b(["iron_ore", "deepslate_iron_ore"]), stone_tier)) return true
	if (a(b(["gold_ore", "emerald_ore", "diamond_ore", "deepslate_gold_ore","deepslate_emerald_ore", "deepslate_diamond_ore"]), iron_tier)) return true
}

// disallow fortune for ores that drop a single item.
world.beforeEvents.playerBreakBlock.subscribe(event => {
    const {block: {typeId, location: {x, y, z}}, dimension, player, itemStack:item} = event
    if (player.getGameMode() == 'Creative') return  //if not creative mode
    if (!one_item_loot.includes(typeId)) return //if drops one item
	if (bad_tool(item, typeId)) return //if using a good pickaxe
	if (!item.getComponent('enchantable')?.getEnchantment('fortune')?.level) return //if using fortune
	// simulate breaking the ore
    event.cancel = true
    system.run(()=> dimension.runCommand(`/setblock ${x} ${y} ${z} air destroy`)) //simulate breaking it

    const broken_blocks = JSON.parse(player.getDynamicProperty('blocks_broken') || '{}') //update stats
    broken_blocks[typeId] = (broken_blocks[typeId] ?? 0) + 1
    player.setDynamicProperty('blocks_broken', JSON.stringify(broken_blocks))

	const unbreaking = item.getComponent('enchantable')?.getEnchantment('unbreaking')?.level ?? 0
	const durability = item.getComponent('durability')
	if (Math.random() * (unbreaking + 1) >= 1) return //if unbreaking didn't protect it
	const breaks = durability.maxDurability == durability.damage
	// break or damage the tool
    system.run(()=> {
        if (breaks) {
            item = undefined
            player.dimension.playSound('random.break', player.location)
        } else durability.damage++
        player.getComponent('equippable').setEquipment('Mainhand', item)
    })
})