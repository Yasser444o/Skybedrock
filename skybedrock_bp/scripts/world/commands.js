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

export const enums = [
	[ "skybedrock:destination", Object.keys(destinations) ],
    [ "skybedrock:quest_id", ['*', ...Object.keys(quests)] ],
    [ "skybedrock:action", ['grant', 'revoke'] ],
    [ "skybedrock:information", ['biome', 'light', 'slimechunk'] ],
    [ "skybedrock:settings", Object.keys(settings) ],
    [ "skybedrock:settings_action", ['enable', 'disable', 'query', 'help'] ],
    [ "skybedrock:to_recover", ['bucket', 'lava', 'water', 'sapling', 'portal', 'grass', 'guidebook'] ],
    [ "skybedrock:restorable", Object.keys(restorable_structures) ],
]

export const commands = [
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
		],

		command: ({sourceEntity}, destination, players) => {
			const dest = destinations[destination]
			if (!dest) {sourceEntity.sendMessage(`§cNo structure with the id '${destination}'`) ; return}
			const targets = players ?? [sourceEntity]
			system.run(() => targets.forEach(target =>
				target.teleport( dest.coords, {
					dimension: world.getDimension(dest.dimension ?? "overworld")
				})
			))
		}
	},
	{
		name: "skybedrock:circle",
		description: "Builds a circle",
		cheatsRequired: true,
		permissionLevel: 2,
		mandatoryParameters: [
			{name: "location", type: "Location"},
			{name: "radius", type: "Integer"},
			{name: "block", type: "BlockType"},
		],
		optionalParameters: [
			{name: "outline", type: "Boolean"}
		],

		command: ({sourceEntity:source}, center, radius, block, outline) => {
			if (!source) return
			const {dimension} = source
			const {x: center_x, y: center_y, z: center_z} = center
			let x = 0, z = radius, d = 1 - radius
			const build_outline = (x, z) => {
				const p = [
					[center_x + x, center_z + z], [center_x - x, center_z + z],
					[center_x + x, center_z - z], [center_x - x, center_z - z],
					[center_x + z, center_z + x], [center_x - z, center_z + x],
					[center_x + z, center_z - x], [center_x - z, center_z - x],
				]
				p.forEach(([px, pz]) => dimension.setBlockType({x: px, y: center_y, z: pz}, block))
			}
			const build_full = (x, z) => {
				for (let i = center_x - x; i <= center_x + x; i++) {
					dimension.setBlockType({x: i, y: center_y, z: center_z + z}, block);
					dimension.setBlockType({x: i, y: center_y, z: center_z - z}, block);
				}
				for (let i = center_x - z; i <= center_x + z; i++) {
					dimension.setBlockType({x: i, y: center_y, z: center_z + x}, block);
					dimension.setBlockType({x: i, y: center_y, z: center_z - x}, block);
				}
			}
			system.run(() => { do { 
					if (outline) build_outline(x, z)
					else build_full(x, z)
					if (d < 0) d = d + 2 * x + 3;
					else { d = d + 2 * (x - z) + 5; z-- }
					x++;
				} while (x <= z)
			})
		}
	},
	{
		name: "skybedrock:restore",
		description: "§.%command.restore.description§..",
		cheatsRequired: true,
		permissionLevel: 2,
		mandatoryParameters: [
			{name: "skybedrock:restorable", type: "Enum"}
		],
		
		command: ({sourceEntity}, id) => {
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
	},
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
		
		command: (_, action, players, id) => {
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
	},
	{
		name: "skybedrock:inform",
		description: "§.%command.inform.description§..",
		cheatsRequired: false,
		permissionLevel: 0,
		optionalParameters: [
			{name: "skybedrock:information", type: "Enum"},
			{name: "location", type: "Location"},
		],
		
		command: ({sourceEntity:source}, information, location) => {
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
				source.sendMessage(`/inform light - §7Queries the light level and sky light`)
				source.sendMessage(`/inform slimechunk - §7Queries the slime chunk`)
			}
			const [x, y, z] = [location.x, location.y, location.z].map(a => Math.floor(a))
			if (information == "biome") {
				const biome = biome_names[dimension.getBiome(location)?.id?.replace('minecraft:', '')]
				source.sendMessage(`The biome at ${x}, ${y}, ${z} is: ${biome}`)
			}
			if (information == "light") {
				system.run(() => {
					const light_level = dimension.getLightLevel(location)
					const sky_light = dimension.getSkyLightLevel(location)
					source.sendMessage(`Light level at ${x}, ${y}, ${z}:`)
					source.sendMessage(`Light Level: §e${light_level}§r | Sky Light: §b${sky_light}§r`)
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
	},
	{
		name: "skybedrock:settings",
		description: "§.%command.settings.description§..",
		cheatsRequired: false,
		permissionLevel: 2,
		optionalParameters: [
			{name: "skybedrock:settings", type: "Enum"},
			{name: "skybedrock:settings_action", type: "Enum"},
		],
		
		command: 
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
	},
	{
		name: "skybedrock:recover",
		description: "§.%command.recover.description§..",
		cheatsRequired: false,
		permissionLevel: 0,
		optionalParameters: [
			{name: "skybedrock:to_recover", type: "Enum"},
		],
		
		command: ({sourceEntity:player}, option) => {
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
	},
	{
		name: "skybedrock:quests",
		description: "§.%command.quests.description§..",
		cheatsRequired: false,
		permissionLevel: 0,
		
		command: ({sourceEntity}) => {
			if (sourceEntity?.typeId == "minecraft:player") quests_menu(sourceEntity)
		}
	},
]