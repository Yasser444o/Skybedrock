import { world, system } from "@minecraft/server"

world.afterEvents.playerInteractWithBlock.subscribe(({player, block}) => {
    if (block.typeId != "minecraft:bed") return // clicked a bed
    if (world.getDynamicProperty('disable_cat_gifts')) return // More Cat Gifts is enabled
    if (!player.isSleeping) return // the player is sleeping
    const sleep = system.runInterval(() => {
        if (!player.isSleeping) system.clearRun(sleep) // tje player wakes up
        if (world.getTimeOfDay() == 0) { // time is day
            player.dimension
            // get all cats within 8 blocks
            .getEntities({ location: player.location, maxDistance: 8, type: "minecraft:cat" })
            // get the ones tamed to the player
            .filter(cat => cat.getComponent("tameable").tamedToPlayer == player)
            // get trigger skybedrock:cat_gift event in cat.json
            .forEach(cat => cat.triggerEvent("skybedrock:cat_gift"))
        }
    })
})

system.afterEvents.scriptEventReceive.subscribe(({id, sourceEntity:cat}) => {
    if (id != "skybedrock:cat_gift") return
    const variant = cat.getComponent("variant").value
    const color = cat.getComponent("color").value
    const loot_manager = world.getLootTableManager()
    const loot_table = loot_manager.getLootTable("entities/cat_gift"); if (!loot_table) return
    loot_manager.generateLootFromTable(loot_table).forEach(item => cat.dimension.spawnItem(item, cat.location))
})