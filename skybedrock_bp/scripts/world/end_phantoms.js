import { world, system } from "@minecraft/server"

function get_distance(a, b={x: 0, z: 0}) {
	return Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2)
}

function chunk_corner({x, z}) {
    return {
        x: Math.floor(x / 16) * 16,
        z: Math.floor(z / 16) * 16,
    }
}

const food_items = [
    "minecraft:apple",
    "minecraft:baked_potato",
    "minecraft:beetroot",
    "minecraft:beetroot_soup",
    "minecraft:bread",
    "minecraft:carrot",
    "minecraft:chorus_fruit",
    "minecraft:cooked_chicken",
    "minecraft:cooked_cod",
    "minecraft:cooked_mutton",
    "minecraft:cooked_porkchop",
    "minecraft:cooked_beef",
    "minecraft:steak",
    "minecraft:cooked_rabbit",
    "minecraft:cooked_salmon",
    "minecraft:cookie",
    "minecraft:dried_kelp",
    "minecraft:golden_apple",
    "minecraft:enchanted_golden_apple",
    "minecraft:glow_berries",
    "minecraft:golden_carrot",
    "minecraft:honey_bottle",
    "minecraft:melon_slice",
    "minecraft:mushroom_stew",
    "minecraft:poisonous_potato",
    "minecraft:potato",
    "minecraft:pufferfish",
    "minecraft:pumpkin_pie",
    "minecraft:rabbit_stew",
    "minecraft:beef",
    "minecraft:chicken",
    "minecraft:cod",
    "minecraft:mutton",
    "minecraft:porkchop",
    "minecraft:rabbit",
    "minecraft:salmon",
    "minecraft:rotten_flesh",
    "minecraft:spider_eye",
    "minecraft:suspicious_stew",
    "minecraft:sweet_berries",
    "minecraft:tropical_fish",
]

world.afterEvents.itemCompleteUse.subscribe(({source:player, itemStack:item}) => {
	if (!food_items.includes(item.typeId) && !item.hasComponent('minecraft:food')) return
    if (item.typeId == 'minecraft:chorus_fruit') {
        player.setDynamicProperty("chorus_fruits", (player.getDynamicProperty("chorus_fruits") ?? 0) + 1)
        if (!player.getDynamicProperty("chorus_timeout")) player.setDynamicProperty("chorus_timeout", system.currentTick + 24000)
    } else {
        player.setDynamicProperty("chorus_fruits")
        player.setDynamicProperty("chorus_timeout")
    }
})

world.afterEvents.entitySpawn.subscribe(({entity}) => {
    if (entity.typeId != "skybedrock:end_sickness") return
    if (!entity.isValid) return
    const {dimension, location} = entity
    const {x, y, z} = location
    entity.remove()
    const {x:chunkX, z:chunkZ} = chunk_corner({x, z})
    const density_limit = dimension.getEntities({
        location: {x: chunkX - 64, y: 0, z: chunkZ - 64},
        volume: {x: 144, y: 300, z: 144},
        type: "skybedrock:end_phantom"
    }).length
    if (density_limit >= 5) return
    const near_players = dimension.getPlayers({
        location: location,
        maxDistance: 48
    })
    const end_sick = near_players.find(player => 
        (player.getDynamicProperty("chorus_fruits") >= 16) &&
        (player.getDynamicProperty("chorus_timeout") < system.currentTick)
    )
    const phantom_islands = JSON.parse(world.getDynamicProperty('phantom_islands') ?? '[]')
    const in_habitat = phantom_islands.find(island => get_distance({x, z}, island) <= 200)
    if ((end_sick && world.gameRules.doInsomnia) || in_habitat) dimension.spawnEntity("skybedrock:end_phantom", {x, y: y + 16, z})
})