import { world, system, ItemStack } from "@minecraft/server"
import { biome_names, destinations, restorable_structures } from "../data"
import { complete, quest_tracker, quests_menu, undo } from "./quests"
import { quests } from "../achievements"
import { isSlimy } from "./slime_finder"

let trader_request
const settings = {
    player_heads: {
        name: "Player Heads",
        help: "- Enables lighting bolts to convert zombie and skeleton heads into player heads.",
        query: () => world.getDynamicProperty("player_heads"),
        toggle: (option) => world.setDynamicProperty('player_heads', option),
    },
    endermans_plus: {
        name: "Enderman+",
        help: "- Makes endermen able to pickup frosted ice, suspicious sand, suspicious gravel, and farmland.",
        query: () => world.getDynamicProperty("enderman_pickup"),
        toggle: (option) => world.setDynamicProperty('enderman_pickup', option),
    },
    dragon_eggs: {
        name: "Renewable Dragon Eggs",
        help: "- Enables the summoning ritual for dragon eggs.",
        query: () => world.getDynamicProperty("dragon_eggs"),
        toggle: (option) => world.setDynamicProperty('dragon_eggs', option),
    },
    natural_shriekers: {
        name: "Natural Shriekers",
        help: "- Sculk shriekers placed in the deep dark biome can spawn wardens.",
        query: () => world.getDynamicProperty("natural_shriekers"),
        toggle: (option) => world.setDynamicProperty('natural_shriekers', option),
    }
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
	customCommandRegistry.registerEnum("skybedrock:destination", Object.keys(destinations))
    customCommandRegistry.registerEnum("skybedrock:quest_id", ['*', ...Object.keys(quests)])
    customCommandRegistry.registerEnum("skybedrock:action", ['grant', 'revoke'])
    customCommandRegistry.registerEnum("skybedrock:information", ['biome', 'light', 'slimechunk'])
    customCommandRegistry.registerEnum("skybedrock:settings", Object.keys(settings))
    customCommandRegistry.registerEnum("skybedrock:settings_action", ['enable', 'disable', 'query', 'help'])
    customCommandRegistry.registerEnum("skybedrock:to_recovere", ['bucket', 'lava', 'water', 'sapling', 'portal', 'grass', 'guidebook'])
    customCommandRegistry.registerEnum("skybedrock:restorable", Object.keys(restorable_structures))
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:visit",
            description: "§.%command.visit.description§..",
            cheatsRequired: true,
            permissionLevel: 2,
            mandatoryParameters: [
                {name: "skybedrock:destination", type: "Enum"}
            ],
            optionalParameters: [
                {name: "player", type: "PlayerSelector"}
            ]
        },
        ({sourceEntity}, destination, players) => {
            const dest = destinations[destination]
            const targets = players ?? [sourceEntity]
            system.run(() => targets.forEach(target =>
                target.teleport( dest.coords, {
                    dimension: world.getDimension(dest.dimension ?? "overworld")
                })
            ))
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:restore",
            description: "§.%command.restore.description§..",
            cheatsRequired: true,
            permissionLevel: 2,
            mandatoryParameters: [
                {name: "skybedrock:restorable", type: "Enum"}
            ]
        },
        ({sourceEntity}, id) => {
            if (!sourceEntity) return
            const structure = restorable_structures[id]
            const visit = destinations[structure.visit]
            const dimension = world.getDimension(visit.dimension ?? "overworld")
            if (dimension.getPlayers({location: visit.coords, maxDistance: 20}).length) {
                system.run(() => {
                    if (structure.place.constructor.name == "Object") {
                        dimension.getEntities({
                            location: structure.place,
                            volume: world.structureManager.get(`worldgen/${id}`).size,
                            excludeTypes: ["minecraft:player"]
                        }).forEach(entity => entity.remove())
                        world.structureManager.place(`worldgen/${id}`, dimension, structure.place)
                    }
                    if (structure.place.constructor.name == "Array") {
                        for (let i = 0; i < structure.place.length; i++) {
                            dimension.getEntities({
                                location: structure.place[i],
                                volume: world.structureManager.get(`worldgen/${id}/${i}`).size,
                                excludeTypes: ["minecraft:player"]
                            }).forEach(entity => entity.remove())
                            world.structureManager.place(`worldgen/${id}/${i}`, dimension, structure.place[i])
                        }
                    }
                })
            } else sourceEntity.sendMessage(`§cYou need to be within 20 blocks of the structure to resotre it`)
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:ach",
            description: "§.%command.ach.description§..",
            cheatsRequired: true,
            permissionLevel: 1,
            mandatoryParameters: [
                {name: "skybedrock:action", type: "Enum"},
                {name: "player", type: "PlayerSelector"},
                {name: "skybedrock:quest_id", type: "Enum"},
            ],
        },
        (_, action, players, id) => {
            players.forEach(player => {
                if (action == "grant") {
                    if (id == '*') Object.keys(quests).forEach(id => complete(player, id))
                    else complete(player, id)
                }
                if (action == "revoke") {
                    if (id == '*') {
                        player.setDynamicProperty("completed_achs")
                        player.setDynamicProperty("claimed_rewards")
						Object.keys(quest_tracker).forEach(key => {
							if (key.startsWith(`${player.id}`)) delete quest_tracker[key]
						})
                        player.sendMessage(`Revoked all achievements for ${player.nameTag}`)
                    }
                    else {
                        undo(player, id)
						Object.keys(quest_tracker).forEach(key => {
							if (key.startsWith(`${player.id} ${id}`)) delete quest_tracker[key]
						})
                        let claimed_rewards = JSON.parse(player.getDynamicProperty("claimed_rewards") ?? '[]')
                        claimed_rewards = claimed_rewards.filter(i => i != id)
                        player.setDynamicProperty("claimed_rewards", JSON.stringify(claimed_rewards))
                    }
                }
            })
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:request_trader",
            description: "§.%command.request_trader.description§..",
            cheatsRequired: false,
            permissionLevel: 0,
        },
        ({sourceEntity, sourceBlock, initiator}) => {
            const target = sourceBlock ? world : sourceEntity ?? initiator
            if (!trader_request) {
                target.sendMessage(["§e", {translate: "guidebook.trader_request.message"}])
                trader_request = true
            } else {
                target.sendMessage(["§c", {translate: "guidebook.trader_request.already"}])
            }
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:inform",
            description: "§.%command.inform.description§..",
            cheatsRequired: false,
            permissionLevel: 0,
            optionalParameters: [
                {name: "skybedrock:information", type: "Enum"},
                {name: "location", type: "Location"},
            ]
        },
        ({sourceEntity:source}, information, location) => {
			if (!source) return
			const {dimension} = source
			if (!location) location = source.location
			if (location.y < dimension.heightRange.min | location.y >= dimension.heightRange.max) {
				source.sendMessage("§cLocation is outside of the world bounderies"); return
			}
			if (!dimension.isChunkLoaded(location)) {
				source.sendMessage("§cCannot access unloaded chunks"); return
			}
			if (!information) {
				source.sendMessage(`Usage:`)
				source.sendMessage(`/inform biome - §7Queries the biome`)
				source.sendMessage(`/inform light - §7Queries the block and sky light`)
				source.sendMessage(`/inform slimechunk - §7Queries the slime chunk`)
			}
			const [x, y, z] = [location.x, location.y, location.z].map(a => Math.floor(a))
			if (information == "biome") {
				const biome = biome_names[dimension.getBiome(location)?.id?.replace('minecraft:', '')]
				source.sendMessage(`The biome at ${x}, ${y}, ${z} is: ${biome}`)
			}
			if (information == "light") {
				system.run(() => {
					const block_light = dimension.getLightLevel(location)
					const sky_light = dimension.getSkyLightLevel(location)
					source.sendMessage(`Light level at ${x}, ${y}, ${z}:`)
					source.sendMessage(`Sky Light: §b${sky_light}§r | Block Light: §e${block_light}§r`)
				})
			}
			if (information == "slimechunk") {
				if (dimension.id != "minecraft:overworld") {
					source.sendMessage("§cYou can not use this command outside the overworld"); return
				}
				const slimy = isSlimy(location)
				if (slimy) source.sendMessage(`The location ${x}, ${y}, ${z} is inside a §aslime chunk`)
				else source.sendMessage(`The location ${x}, ${y}, ${z} is §cnot§r inside a slime chunk`)
			}
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:settings",
            description: "§.%command.settings.description§..",
            cheatsRequired: false,
            permissionLevel: 2,
            optionalParameters: [
                {name: "skybedrock:settings", type: "Enum"},
                {name: "skybedrock:settings_action", type: "Enum"},
            ]
        },
        ({sourceEntity}, id, action) => {
            if (!sourceEntity) return
            if (!id) {
                sourceEntity.sendMessage(`Settings: §7[${Object.keys(settings).join(', ')}]`)
                sourceEntity.sendMessage(`Actions: §7[enable, disable, query, help]`)
                return
            }
            if (!(id in settings)) {
                sourceEntity.sendMessage(`§cInvalid setting: ${id}`)
                return
            }
            const setting = settings[id]
            if (action == 'enable') {
                sourceEntity.sendMessage(`${setting.name} feature has been enabled`)
                setting.toggle(true)
            }
            else if (action == 'disable') {
                sourceEntity.sendMessage(`${setting.name} feature has been disabled`)
                setting.toggle()
            }
            else if (action == 'help') {
                sourceEntity.sendMessage('§u' + setting.name + ':')
                sourceEntity.sendMessage('§e' + setting.help)
            }
            else if (!action || action == 'query') {
                sourceEntity.sendMessage(`${setting.name} = ${!!setting.query()}`)
            } else sourceEntity.sendMessage(`§cNo such action: ${action}`)
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:recover",
            description: "§.%command.recover.description§..",
            cheatsRequired: false,
            permissionLevel: 0,
            optionalParameters: [
                {name: "skybedrock:to_recovere", type: "Enum"},
            ]
        },
        ({sourceEntity:player}, option) => {
            if (!player || player.typeId != "minecraft:player") return
            const inventory = player.getComponent('inventory').container
            const equip = player.getComponent('equippable')
            const block = player.getBlockFromViewDirection()?.block
            if (!option) {
                player.sendMessage(`Options: §7[bucket, lava, water, sapling, portal, grass, guidebook]`)
                return
            }
            if (!['bucket', 'lava', 'water', 'sapling', 'portal', 'grass', 'guidebook'].includes(option)) {
                player.sendMessage(`§cNo such option: ${option}`)
                return
            }
            switch(option) {
                case 'bucket': {
                    const bucket = new ItemStack('bucket')
                    if (!inventory.contains(bucket)) system.run(() => inventory.addItem(bucket))
                    else player.sendMessage('§cYou already have a bucket.')
                }; break
                case 'lava': {
                    const mainhand = equip.getEquipment('Mainhand')
                    if (mainhand && mainhand.typeId == "minecraft:bucket" && mainhand.amount == 1) {
                        system.run(() => equip.setEquipment('Mainhand', new ItemStack('lava_bucket')))
                    } else if (block && block.typeId == "minecraft:obsidian") {
                        system.run(() => block.setType("lava"))
                    } else player.sendMessage('§cLook at a block of obsidian or hold an empty bucket.')
                }; break
                case 'water': {
                    const mainhand = equip.getEquipment('Mainhand')
                    if (mainhand && mainhand.typeId == "minecraft:bucket" && mainhand.amount == 1) {
                        system.run(() => equip.setEquipment('Mainhand', new ItemStack('water_bucket')))
                    } else player.sendMessage('§cHold an empty bucket.')
                }; break
                case 'sapling': {
                    const sapling = new ItemStack('oak_sapling')
                    if (!inventory.contains(sapling)) system.run(() => inventory.addItem(sapling))
                    else player.sendMessage('§cYou already have an oak sapling.')
                }; break
                case 'grass': {
                    if (block && block.typeId == "minecraft:dirt") {
                        system.run(() => block.setType("grass_block"))
                    } else player.sendMessage('§cLook at a block of dirt.')
                }; break
                case 'guidebook': {
                    const book = new ItemStack('skybedrock:guidebook')
                    if (!inventory.contains(book)) system.run(() => inventory.addItem(book))
                    else player.sendMessage('§cYou already have a guidebook.')
                }; break
                case 'portal': {
                    const portal = new ItemStack('obsidian', 10)
                    if (!inventory.contains(portal)) system.run(() => inventory.addItem(portal))
                    else player.sendMessage('§cYou already have 10 obsidian.')
                }; break
            }
        }
    )
    customCommandRegistry.registerCommand(
        {
            name: "skybedrock:quests",
            description: "§.%command.quests.description§..",
            cheatsRequired: false,
            permissionLevel: 0
        },
        ({sourceEntity}) => {
            if (sourceEntity?.typeId == "minecraft:player") quests_menu(sourceEntity)
        }
    )
})

system.runInterval(() => {
	if (!trader_request) return
	if (world.getTimeOfDay() != 0) return
	trader_request = undefined
	try {
        const overworld = world.getDimension("minecraft:overworld")
        if (overworld.getEntities({type: "wandering_trader"}).length == 0) overworld.spawnEntity("wandering_trader", {x:0, y:65, z:0})
        else world.sendMessage(["<§t", {translate: "entity.wandering_trader.name"}, "§r> ", {translate: "guidebook.trader_request.late"}])
	} catch {
		world.sendMessage(["<§t", {translate: "entity.wandering_trader.name"}, "§r> ", {translate: "guidebook.trader_request.failed"}])
	}
})