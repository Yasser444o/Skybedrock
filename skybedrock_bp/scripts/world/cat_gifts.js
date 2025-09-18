import { world, system } from "@minecraft/server"

world.afterEvents.playerInteractWithBlock.subscribe(({player, block}) => {
    if (block.typeId != "minecraft:bed") return
    if (world.getDynamicProperty('disable_cat_gifts')) return
    system.runTimeout(() => {
        if (!player.isSleeping) return
        const sleep = system.runInterval(() => {
            if (!player.isSleeping) system.clearRun(sleep)
            if (world.getTimeOfDay() == 0) {
                player.dimension
                .getEntities({ location: player.location, maxDistance: 8, type: "minecraft:cat" })
                .filter(cat => player.id == cat.getComponent("tameable").tamedToPlayerId)
                .forEach(cat => cat.triggerEvent("skybedrock:cat_gift"))
            }
        })
    })
})

system.afterEvents.scriptEventReceive.subscribe(({id, sourceEntity:cat}) => {
    if (id != "skybedrock:cat_gift") return
    const variant = cat.getComponent("variant").value
    const color = cat.getComponent("color").value
    cat.runCommand("loot spawn ~ ~ ~ loot \"entities/cat_gift\"")
})