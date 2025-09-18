import {world} from "@minecraft/server"

world.afterEvents.playerPlaceBlock.subscribe(({player, block}) => {
    const stats = JSON.parse(player.getDynamicProperty('blocks_placed') || '{}')
    stats[block.typeId] = (stats[block.typeId] ?? 0) + 1
    player.setDynamicProperty('blocks_placed', JSON.stringify(stats))
})

world.afterEvents.playerBreakBlock.subscribe(({player, brokenBlockPermutation:block}) => {
    const stats = JSON.parse(player.getDynamicProperty('blocks_broken') || '{}')
    stats[block.type.id] = (stats[block.type.id] ?? 0) + 1
    player.setDynamicProperty('blocks_broken', JSON.stringify(stats))
})

world.afterEvents.itemUse.subscribe(({source:player, itemStack}) => {
    const stats = JSON.parse(player.getDynamicProperty('items_used') || '{}')
    stats[itemStack.typeId] = (stats[itemStack.typeId] ?? 0) + 1
    player.setDynamicProperty('items_used', JSON.stringify(stats))
})

world.afterEvents.playerInteractWithBlock.subscribe(({player, itemStack}) => {
    if (!itemStack) return
    const starts = JSON.parse(player.getDynamicProperty('items_used_on') || '{}')
    starts[itemStack.typeId] = (starts[itemStack.typeId] ?? 0) + 1
    player.setDynamicProperty('items_used_on', JSON.stringify(starts))
})

world.afterEvents.entityDie.subscribe(({damageSource, deadEntity:entity}) => {
    if (damageSource.damagingEntity?.typeId  != 'minecraft:player') return
    const player = damageSource.damagingEntity
    const stats = JSON.parse(player.getDynamicProperty('mobs_killed') || '{}')
    stats[entity.typeId] = (stats[entity.typeId] ?? 0) + 1
    player.setDynamicProperty('mobs_killed', JSON.stringify(stats))
})