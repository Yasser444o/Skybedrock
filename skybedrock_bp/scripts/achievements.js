import { world, system, EnchantmentType, ItemStack } from "@minecraft/server"
import { pillar_locations } from "./world/the_end"
import { complete, stop_challenge, quest_tracker } from "./world/quests"
import { stored_items } from "./startup"
import { locating_players } from "./world/maps"
import { update_vision } from "./world/limited_vision"


export const version = "v5.0.0"
const aux = 65536

export function check_items(player, item, count, data) {
    return player.runCommand(`testfor @s[hasitem={item= ${
        item + (count ? `, quantity= ${count
    }..` : '') + (data != undefined ? `, data= ${data}` : '')}}]`).successCount
}

export function check_block(dimension, location, typeId, fallback) {
    const block_id = dimension.getBlock(location)?.typeId
    return block_id ? block_id == typeId : fallback
}

function check_item_enchants(player, item, enchant) {
    const inventory = player.getComponent("inventory").container
    for (let i = 0; i < inventory.size; i++) {
        const slot = inventory.getItem(i)
        if (slot?.typeId != item) continue
        if (slot.getComponent("enchantable").getEnchantment(enchant) != undefined) return true
    }
}

function view_stats(player, category, block_type) {
    return JSON.parse(player.getDynamicProperty(category) || '{}')[block_type] ?? 0
}

function check_ach(player, id) {
    return JSON.parse(player.getDynamicProperty('completed_achs') || '[]').find(ach => ach == id)
}

function check_location(player, dimension, range, biome) {
    const {x, y, z} = player.location
    if (range) {
        const min = {
            x: Math.min(range[0].x, range[1].x),
            y: Math.min(range[0].y, range[1].y),
            z: Math.min(range[0].z, range[1].z),
        }
        const max = {
            x: Math.max(range[0].x, range[1].x),
            y: Math.max(range[0].y, range[1].y),
            z: Math.max(range[0].z, range[1].z),
        }
        if (x < min.x || x > max.x) return
        if (y < min.y || y > max.y) return
        if (z < min.z || z > max.z) return
    }
    if (dimension) if (player.dimension.id != dimension) return
    if (biome) return
    return true
}

function in_raduis(player, center, dimension= "minecraft:overworld", raduis) {
    if (player.dimension.id != dimension) return
    const [x, y, z] = center.split(' ') 
    return player.runCommand(`testfor @s[x=${x}, y=${y}, z=${z}, r=${raduis ?? 5}]`).successCount
}

function get_distance(a, b) {
	return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2)
}

export const categories = {
	skyblock: {
		icon: 65536 * 2,
		list: `
			cobblestone
			sapling
			farm
			animals
			bridge
			water
			mob_trap
			craft_bed
			copper_tools
			nether
			gold
			barter
			dirt
			clay
			fortress
			blaze_rod
			diamond
			brewing
			villagers
			iron
			saddle
			lodestone
			diamond_pickaxe
			silk_touch
			ender_eye
			stronghold
			the_end
			dragon
			shulkers
			end_phantom
			end_pillars
			elytra
		`
	},
	explorer: {
		icon: 'textures/items/compass_item',
		list: `
			swamp
			jungle
			taiga
			desert
			savanna
			dark_forest
			birch
			mushroom_island
			ocean
			badlands
			resin_clump
			cherry
			dripstone
			geode
			lush_cave
			deep_dark
			crimson
			warped
			soulsand_valley
			basalt_deltas
			biome_detector
			structure_locator
			witch_hut
			jungle_temple
			igloo
			desert_pyramid
			pillager_outpost
			trail_ruins
			woodland_mansion
			trial_chambers
			mineshaft
			shipwreck
			ancient_city
			monument
			fortress_loot
			bastion
			ruined_portal
			end_city
		`
	},
	farmer: {
		icon: 'textures/items/diamond_hoe',
		list: `
			wheat_farm
			vegetables
			cactus_farm
			sand_farm
			pumpkin_farm
			snow_farm
			slime_farm
			mushroom_farm
		`
	},
	challenges: {
		icon: 'textures/items/iron_sword',
		list: `
			sneak_a_warden
			desert_fishing
			located_all_structures
			direwolf
			bug_fixes
			pirate
			crafted_trials
		`
	}
}

export const quests = {
	cobblestone: {
		data: `
			title: Cobble Gen
			icon: 262144
			* Build a cobblestone generator
			- craft a wooden pickaxe
			- place and break the ice to get water
			- generate cobblestone with water and lava
			- collect 64 blocks of cobblestone
			(You can place a backward staircase in the water to stop it from flowing into the lava)
		`,
		query: (player) => check_items(player, 'cobblestone', 64),
		reward: ["32 Cobblestone", `give @s cobblestone 32`]
	},
	sapling: {
		data: `
			title: It's All Renewable
			icon: textures/blocks/sapling_oak
			* Chop down the tree and collect 3 oak saplings
			- chop down the oak tree
			- replant an oak sapling
			- repeat until you catch 3 oak saplings
			(If you didn't catch any saplings you can complete this achievement with other tree types)
		`,
		query: (player) => ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'cherry'].some(sapling => 
			check_items(player, sapling +'_sapling', 3)
		),
		reward: ["2 Oak Logs", `give @s oak_log 2`]
	},
	farm: {
		data: `
			title: Don't Starve
			icon: textures/items/seeds_wheat
			* Build a little wheat farm
			- break the short grass for wheat seeds
			- craft a hoe
			- till the ground near water
			- plant at least 3 wheat seeds
		`,
		query: (player) => view_stats(player, 'blocks_placed', 'minecraft:wheat') >= 3,
		reward: ["5 Bread", `give @s bread 5`]
	},
	animals: {
		data: `
			require: farm
			title: Livestock
			icon: textures/items/beef_raw
			* Expand the grass platform to allow for animals to spawn
			- gather some dirt to expand your grass platform
			- watch your grass spread
			- walk away 25 blocks from your grass
			- wait for cows, chickens, sheep, or pigs to spawn
			(If you have broken all the grass, there is more in the other islands)
		`,
		query: (player) => ['cow', 'chicken', 'pig', 'sheep'].some(animal =>
			player.runCommand(`testfor @e[type= ${animal}, r=30]`).successCount
		),
		reward: ["16 wheat", `give @s wheat 16`]
	},
	bridge: {
		data: `
			require: cobblestone
			title: Bridge Explorer
			icon: ${aux * -873}
			* Build a bridge out of slabs to one of the surrounding islands
			- craft 100 cobblestone slabs
			- build a bridge to one of the nearby islands
			- reach the snowy taiga, jungle, mangrove swamp, or the desert island
			(Place torches on your bridges or build them out of lower slabs to prevent mobs from spawning on them)
		`,
		query: (player) => (
			player.dimension.id == "minecraft:overworld" &&
			(Math.abs(player.location.x) > 90 || Math.abs(player.location.z) > 90) &&
			Math.abs(player.location.x) < 100 &&
			Math.abs(player.location.z) < 100
		),
	},
	water: {
		data: `
			require: (swamp | ocean | birch)
			title: §.Infinite Water!
			icon: textures/items/bucket_water
			* Make an infinite water source
			- go to any island with water in it
			- collect a second water bucket
			- make an infinite water source
			- separate your wheat farm and cobblestone generator
			- click the complete button below
			(Water can be found in the swamp, birch, and ocean island)
		`,
		checkmark: true,
		reward: ["16 Torches", `give @s torch 16`]
	},
	mob_trap: {
		data: `
			require: water
			title: Spawn, Drop, Drops
			icon: textures/items/stone_sword
			* Build a mob trap
			- collect a bunch of building blocks
			- build a 20 blocks tall 2x2 drop chute
			- build a water stream to each cardinal direction of your drop chute
			- build the spawning platforms by filling the gaps between your water streams
			- cover the water streams with open trapdoors and open them
			- build walls that are 2 blocks high around the spawning platforms
			- cover your mob trap with a roof made out of soild blocks
			- craft a stone sword
			- collect 2 bones, 2 gunpowder, and 2 strings
		`,
		query: (player) => check_items(player, 'bone', 2) && check_items(player, 'gunpowder', 2) && check_items(player, 'string', 2),
		reward: ["1 Iron Ingot", `give @s iron_ingot`]
	},
	craft_bed: {
		data: `
			require: mob_trap
			title: Good Night
			icon: textures/items/bed_yellow
			* Craft a bed to skip the night
			- collect 12 strings by killing spiders
			- craft them into wool
			- craft a bed and dye it with any color
			(You could also obtain wool from killing sheep btw)
		`,
		query: (player) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].some(color =>
			check_items(player, 'bed', null, color)
		),
		reward: ["Another Bed for your friend", `give @s bed 1`]
	},
	copper_tools: {
		data: `
			require: (mob_trap & water)
			title: Metallurgy
			icon: textures/items/copper_pickaxe
			* Obtain Copper to craft better tools and armor
			- build a drowned farm, in the river, ocean, or dripstone caves biome
			- you can also use water to drown regular zombies into drowneds
			- obtain some copper ingots from killing drowneds
			- use copper ingots to craft 2 types of any copper tool or armor
			(You can also obtain a lot of copper by visiting the trial chambers)
		`,
		query: (player) => ['copper_sword', 'copper_pickaxe', 'copper_axe', 'copper_shovel', 'copper_hoe', 'copper_helmet', 'copper_chestplate', 'copper_leggings', 'copper_boots'].filter(item => check_items(player, item)).length >= 2,
		reward: ["2 Copper Blocks", `give @s copper_block 2`]
	},
	nether: {
		data: `
			require: (cobblestone & sapling)
			title: Distant Realm
			icon: textures/items/flint_and_steel
			* Light the nether portal and enter the nether dimension
			- build the portal frame
			- use lava and wood to light the portal
			- go to the nether
			- you can view the Nether Structures map by completing this quest
			(You may also use a flint and steel to light the portal if you have gravel and got an iron ingot from zombies)
		`,
		query: (player) => check_location(player, 'minecraft:nether'),
		reward: ["A stack of Walls", `give @s cobblestone_wall 64`]
	},
	gold: {
		data: `
			require: nether
			title: Gold Lust
			icon: textures/items/gold_ingot
			* Build a basic gold farm
			- build a platform in the nether wastes biome
			- surround the platform with walls or fences
			- wait for zombie piglins to spawn and kill them
			- craft 8 gold ingots
		`,
		query: (player) => check_items(player, 'gold_ingot', 8),
		reward: ["8 Gold Ingots", `give @s gold_ingot 8`]
	},
	barter: {
		data: `
			require: gold
			title: Gold for Junk
			icon: textures/items/potion_bottle_fireResistance
			* Use your gold to barter with piglins for the following items:
			- Iron Nuggets
			- Ender Pearls
			- Nether Gravel
			- Soul Sand
			- Nether Quartz
			- Blackstone
			- Crying Obsidian
			(Hold all items in your inventory at once to complete this quest)
		`,
    	query: (player) => ['iron_nugget', 'ender_pearl', 'crying_obsidian', 'skybedrock:nether_gravel', 'soul_sand', 'blackstone', 'quartz'].every(item => check_items(player, item)),
		reward: ["A Potion of Fire Resistance", `give @s potion 1 13`]
	},
	dirt: {
		data: `
			require: (gold | mob_trap)
			title: Cherish Every Piece
			icon: 196608
			* Convert a stack of gravel into a stack of dirt
			- collect nether gravel from bartering with piglins or regular gravel from killing zombies
			- convert nether gravel into regular gravel using the crafting grid
			- craft coarse dirt by combining dirt and gravel
			- place it down and till it with a hoe or a shovel
			- break it down and use it to craft more coarse dirt
			- collect a stack of dirt by repeating this process
		`,
		query: (player) => (
			view_stats(player, 'blocks_placed', 'minecraft:coarse_dirt') >= 32 &&
			check_items(player, 'dirt', 64)
		),
		reward: ["32 Gravel", `give @s gravel 32`]
	},
	clay: {
		data: `
			require: (dirt & dripstone)
			title: Ceramist in Training
			icon: textures/items/clay_ball
			* Create 16 blocks of clay from just dirt
			- obtain some dirt and a water bottle
			- use the water bottle on dirt to make mud
			- place the mud on a platform with pointed dripstone hanging from it
			- wait for the mud to dry
			- harvest the clay balls and craft them into 16 blocks
		`,
		query: (player) => check_items(player, 'clay', 16),
		reward: ["12 Pointed Dripstone", `give @s pointed_dripstone 12`]
	},
	fortress: {
		data: `
			require: nether
			title: Deadly Fort
			icon: 7340032
			* Find and reach the nether fortress
			- locate the nether fortress on the structures map
			- build a bridge to the nether fortress
			- avoid getting shot by skeletons and blazes
			- build a safe room on the floor of the nether fortress
			(You can use weeping vines to build lower in the nether; Alternatively you can use lava and fire resistance)
		`,
		query: (player) => check_location(player, 'minecraft:nether', [{x:64, y: 50, z: 113}, {x:111, y: 55, z: 143}]),
		reward: ["3 Steaks", `give @s cooked_beef 3`]
	},
	blaze_rod: {
		data: `
			require: fortress
			title: Flame Conqueror
			icon: textures/items/blaze_rod
			* Kill a blaze and obtain a blaze rod
			- fight and kill a blaze
			- obtain 2 blaze rods
		`,
		query: (player) => check_items(player, 'blaze_rod', 2)
	},
	diamond: {
		data: `
			require: (nether & bridge)
			title: Diamonds!!!
			icon: textures/items/diamond
			* Obtain a Diamond; This acheivement serves as a guide on how to obtain diamonds:
			- There are multiple options, some are better then others:
			- 1) Diamond Chickens: Head to the How to Play screen to learn more about them
			- 2) Archeology: You could brush suspesious sand in the desert pyramid, it will regenerate after 30 minutes
			- 3) Sky Treasure: Sky treasure chests have a small chance of containing diamond ore
			- 4) Trial Vaults: You could obtain diamonds by opening vaults or ominous vaults
			- 5) End city Loot: One of the 5 end cities has diamonds in its chest, this source isn't renewable though
		`,
		query: (player) => check_items(player, 'diamond'),
		reward: ["2 More diamonds", `give @s diamond 2`]
	},
	brewing: {
		data: `
			require: blaze_rod
			title: Alchemist
			icon: textures/items/potion_bottle_weakness
			* Brew a splash potion of weakness
			- craft a brewing stand
			- collect a spider eye, sugar, and a brown mushroom and craft a fermented spider eye
			- brew some weakness potions
			- turn them into splash potions with gunpowder
		`,
		query: (player) => check_items(player, 'splash_potion', null, 34),
		reward: ["32 Gunpowder", `give @s gunpowder 32`]
	},
	villagers: {
		data: `
			require: (gold & brewing)
			title: Villagers Unlocked
			icon: textures/items/emerald
			* Cure two villagers and start a village
			- capture two zombie villagers
			- splash them with weakness and feed them golden apples
			- wait for them to become villagers
			- give them some beds and food to breed them
			(If you decide to skip this process there is a villager and a zombie villager in the igloo)
		`,
		query: (player) => player.runCommand('testfor @e[type=villager, r=5]').successCount > 1,
		reward: ["20 Emeralds", `give @s emerald 20`]
	},
	iron: {
		data: `
			require: villagers
			title: The Iron Age
			icon: textures/items/iron_ingot
			* Obtain iron from iron golems
			- craft or buy 20 beds
			- place them sown in a village
			- have at least 10 villagers
			- make sure that over 70%% of the villagers in the village are employed
			- wait for an iron golems to spawn
			- kill them to obtain iron ingots
			- collect 32 iron ingots
			(You can automate this process with water and lava to push and kill the iron golems)
		`,
		query: (player) => player.runCommand('testfor @e[type=iron_golem]').successCount && check_items(player, 'iron_ingot', 32)
	},
	saddle: {
		data: `
			require: mob_trap
			title: Backridden
			icon: textures/items/saddle
			* Craft a saddle and ride a horse
			- Collect an iron ingot from killing zombies, bartering with piglins, or from an iron farm
			- Craft a saddle out of iron and leather
			- Get a horse to spawn on the grass and tame it
			- Equip it with a saddle and ride it
		`,
		query: (player) => {
			const horse = player.getComponent('minecraft:riding')?.entityRidingOn
			return horse?.typeId == "minecraft:horse" && horse?.runCommand('testfor @s[hasitem={item=saddle, location=slot.saddle}]')?.successCount
		}
	},
	lodestone: {
		data: `
			require: iron
			title: Waypoints
			icon: -14548992
			* Place lodestones in your other islands 
			- craft a lodestone and place it in your other bases
			- use a compass on it to create a lodestone compass
		`,
		query: (player) => check_items(player, 'lodestone_compass')
	},
	diamond_pickaxe: {
		data: `
			require: iron
			title: Sky Miner
			icon: textures/items/diamond_pickaxe
			* Buy an enchanted diamond pickaxe from a tool smith
			- craft a smithing table
			- employ a tool smith villager
			- upgrade that villager to the master level
			- buy a diamond pickaxe
		`,
		query: (player) => player.runCommand('testfor @e[type=villager, r=5]').successCount && check_items(player, 'diamond_pickaxe', null, 0),
		reward: [
			"Enchant the next tool or armor you hold with mending",
			(player) => {
				const call = system.runInterval(() => {
					const tool = player?.getComponent("equippable")?.getEquipment("Mainhand")
					if (!tool) return
					const enchantable = tool.getComponent("enchantable")
					if (!enchantable) return
					const mending = enchantable.getEnchantment("mending")
					if (!mending && enchantable.canAddEnchantment({type: new EnchantmentType("mending"), level: 1})) {
						player.runCommand('enchant @s mending')
						system.clearRun(call)
					}
				})
			}
		]
	},
	silk_touch: {
		data: `
			require: diamond_pickaxe
			title: Silky
			icon: textures/items/iron_pickaxe
			* Obtain an silk touch pickaxe
			- craft an enchanting table
			- buy lapis from clerics
			- gather enough xp
			- enchant a pickaxe with silk touch
			(You may also buy a silk touch book from a villager and put it on your pickaxe)
		`,
		query: (player) => ['wooden', 'golden', 'stone', 'iron', 'diamond', 'netherite'].some(type =>
			check_item_enchants(player, `minecraft:${type}_pickaxe`, 'silk_touch')
		)
	},
	ender_eye: {
		data: `
			require: blaze_rod
			title: Let's Beat the Game
			icon: textures/items/ender_eye
			* Craft 12 eyes of ender and locate the stronghold
			- gather 12 ender pearls
			- craft 12 eyes of ender
			- use an eye of ender to point to the direction of the stronghold
			(Make sure to have particles activated for eyes of ender to work properly)
		`,
		query: (player) => view_stats(player, 'items_used', 'minecraft:ender_eye'),
		reward: ["4 stacks of slabs", `give @s oak_slab 256`]
	},
	stronghold: {
		data: `
			require: ender_eye
			title: A Stronghold Has Appeared
			icon: 7864320
			* Find and enter the stronghold
			- gather about 1500 blocks or slabs
			- build a bridge in the direction of the stronghold
			- follow the eyes of ender until you reach your distension
			- enter the stronghold
			(The stronghold won't generate until you use another eye of ender near its location)
		`,
		query: (player) => (
			player.dimension.id == "minecraft:overworld" &&
			[1, 2, 3].some(i => {
				if (!world.getDynamicProperty(`generatedStronghold${i}`)) return
				const {x, y, z} = world.getDynamicProperty(`stronghold${i}`)
				return player.runCommand(`testfor @s[x=${x}, y=${y}, z=${z}, dx=16, dy=10, dz=16]`).successCount
			})
		)
	},
	the_end: {
		data: `
			require: stronghold
			title: What Awaits Is the End
			icon: 7929856
			* Enter the End dimension
			- prepare for the end fight
			- activate the end portal
			- jump to the end dimension
			- reach the main end island
			(Be prepared to bridge to the main end island as soon as you enter)
		`,
		query: (player) => check_location(player, 'minecraft:the_end'),
		reward: ["One arrow", `give @s arrow`]
	},
	dragon: {
		data: `
			require: the_end
			title: A Head for Each Chief
			icon: textures/ui/items/head_dragon
			* Beat the ender dragon and acquire its head
			- destroy the end crystals
			- kill the ender dragon
			- collect the dragon head when it drops
			- exit the end dimension
			(You have to kill the ender dragon yourself for the achievement to count, explosives don't count as a player kill)
		`,
		query: (player) => check_items(player, 'dragon_head') && view_stats(player, 'mobs_killed', 'minecraft:ender_dragon'),
		reward: ["20 xp levels", `xp 20L @s`]
	},
	shulkers: {
		data: `
			require: dragon
			title: Shell Lurkers
			icon: 13434880
			* Duplicate some shulkers and craft a shulker box
			- go to the end city island
			- get a shulker to shoot itself or another shulker
			- kill the duplicated shulkers to obtain shulker shells
			- craft a shulker box
			(DO NOT kill the shulkers before duplicating them first, the outer end islands are removed and those are the only shulkers in the map. If you have killed them all already, there are 4 more end city islands unlocked by respawning and defeating the ender dragon again a certian number of times)
		`,
		query: (player) => check_items(player, 'undyed_shulker_box') && player.runCommand('testfor @e[type=shulker]').successCount > 1,
		reward: ["4 Shulker Shells", `give @s shulker_shell 4`]
	},
	end_phantom: {
		data: `
			require: dragon
			title: Chorus Sickness
			icon: textures/items/chorus_fruit
			* Do not eat anything but chorus fruits for 3 days
			- eat 16 chorus fruits
			- do not eat anything else for 3 days
			- walk in the end dimesion
			- find an end phantom and kill it
			(End phantoms spawn naturally if you kill the ender dragon a second time and go through the second end gateway)
		`,
		query: (player) => view_stats(player, 'mobs_killed', 'skybedrock:end_phantom')
	},
	end_pillars: {
		data: `
			require: dragon
			title: Plenty of Obsidian
			icon: 3211264
			* Respawn the Ender dragon to generate the obsidian pillars
			- craft 4 end crystals
			- place one end crystal on each side of the end exit fountain
			- respawn the ender dragon
			- wait for the 10 pillars to regenerate
			(If you don't want to fight the dragon, you could interrupt its summoning by exploding the end crystals right before it spawns)
		`,
		query: () => pillar_locations.every(loc => check_block(world.getDimension("minecraft:the_end"), {...loc, y: 0}, "minecraft:obsidian", false))
	},
	elytra: {
		data: `
			require: end_phantom
			title: I Can Fly
			icon: textures/items/broken_elytra
			* Fly with elytra and rockets
			- obtain a broken elytra from killing end phantoms
			- repair your elytra with an anvil
			- craft some firework rockets and fly with your elytra
		`,
		query: (player) => player.isGliding,
		reward: ["16 Flight Rockets", `give @s firework_rocket 16`]
	},

	swamp: {
		data: `
			require: bridge
			title: Stinky Woods
			icon: textures/items/mangrove_propagule
			* Visit the mangrove swamp island for:
			- Water
			- Mangrove Wood
			- Lily Pads
			- Blue Orchids
			- Mud
			- Boggeds
			- Slimes (If you are lucky)
			- Frogs
			- Firefiles
			- Tropical Fish
			- Unlock the Swamp Hut
		`,
		query: (player) => in_raduis(player, '96 63 0'),
		reward: ["A Frog", `summon frog`]
	},
	jungle: {
		data: `
			require: bridge
			title: Lungs of the Planet
			icon: textures/blocks/sapling_jungle
			* Pay a visit to the jungle island for:
			- Melon
			- Cocoa Beans
			- Jungle Wood
			- Bamboo
			- Sunflowers
			- Ocelots
			- Parrots
			- Pandas
			- Unlock the Jungle Temple
		`,
		query: (player) => in_raduis(player, '-96 63 0'),
		reward: ["A Parrot", `summon parrot`]
	},
	taiga: {
		data: `
			require: bridge
			title: Boreal Forests
			icon: textures/blocks/sapling_spruce
			* Head north until you reach the taiga island for:
			- Snow and Ice
			- Pumpkins
			- Sweet Berries
			- Spruce Wood
			- Foxes
			- Rabbits
			- Wolves
			- Unlock the Igloo
		`,
		query: (player) => in_raduis(player, '0 63 -96')
	},
	desert: {
		data: `
			require: bridge
			title: Floating Sands
			icon: textures/blocks/tall_dry_grass
			* Head south to visit the desert island for:
			- Sand
			- Cactus
			- Dry Grass
			- Dead Bushes
			- Husks
			- Rabbits
			- Camels
			- Unlock the Desert Pyramid
		`,
		query: (player) => in_raduis(player, '0 63 96'),
		reward: ["A Rabbit", `summon rabbit`]
	},
	savanna: {
		data: `
			require: (desert | swamp)
			title: Lions and Giraffes
			icon: textures/blocks/sapling_acacia
			* Go to the savanna island for:
			- Acacia Wood
			- Beetroot
			- Rose Bushes
			- Wolves
			- Armadillos
			- Unlock the Pillager Outpost
		`,
		query: (player) => in_raduis(player, '96 63 96')
	},
	dark_forest: {
		data: `
			require: (swamp | taiga)
			title: Old Tree
			icon: textures/blocks/sapling_roofed_oak
			* Come to the dark forest island for:
			- Dark Oak Wood
			- Leaf Litter
			- A Peony
			- Lilly of the Valley
			- Unlock the Woodland Mansion
			(You need 4 saplings to grow a dark oak tree, take the reward if you got less than 4 saplings)
		`,
		query: (player) => in_raduis(player, '96 63 -96'),
		reward: ["3 Dark Oak Saplings", `give @s dark_oak_sapling 3`]
	},
	birch: {
		data: `
			require: (taiga | jungle)
			title: Magical Forest
			icon: textures/blocks/sapling_birch
			* Make it to the birch island for:
			- Birch Wood
			- Sugar Cane
			- Lilacs
			- Wildflowers
			- Unlock the Trail Ruins
		`,
		query: (player) => in_raduis(player, '-96 63 -96')
	},
	mushroom_island: {
		data: `
			require: (desert | jungle)
			title: Stranded in the Sky
			icon: textures/blocks/mushroom_red
			* Reach the mushroom island for:
			- Mycelium
			- Red and Brown Mushrooms
			- Mooshrooms
			- No Hostile mobs
			- Unlock the Ocean Monument
		`,
		query: (player) => in_raduis(player, '-96 63 96'),
		reward: ["4 Mushroom Stew", `give @s mushroom_stew 4`]
	},
	ocean: {
		data: `
			require: swamp
			title: Let's Sail
			icon: textures/blocks/seagrass_carried
			* Visit the ocean island for:
			- Water
			- Kelp
			- Sea Pickles
			- Coral
			- Gravel
			- Drowneds
			- All types of Fish
			- Squids
			- Dolphins
			- Unlock the Ocean Ruins
		`,
		query: (player) => in_raduis(player, '192 63 0')
	},
	badlands: {
		data: `
			require: desert
			title: Wild South
			icon: textures/blocks/cactus_flower
			* Continue south to reach the badlands island for:
			- Red Sand
			- Cactus
			- Cob Webs
			- Armadillos
			- Unlock the Mineshaft
		`,
		query: (player) => in_raduis(player, '0 63 192')
	},
	resin_clump: {
		data: `
			require: taiga
			title: Sap Beat
			icon: textures/items/resin_clump
			* Pay a visit to the pale garden island for:
			- Resin
			- Pale Moss
			- Hanging Moss
			- Eyeblossoms
			- Pale Oak Wood
			- Creakings
		`,
		query: (player) => in_raduis(player, '0 63 -192')
	},
	cherry: {
		data: `
			require: jungle
			title: Sakura Island
			icon: textures/blocks/cherry_sapling
			* Reach the cherry island
			- Pink Petals
			- Cherry Wood
			- Bees
			- Unlock the Trial Chambers
		`,
		query: (player) => in_raduis(player, '-192 63 0')
	},
	dripstone: {
		data: `
			require: dark_forest
			title: Pointy Stones
			icon: textures/blocks/pointed_dripstone_up_tip
			* Reach the dripstone island for:
			- Dripstone
			- Lava
			- Glow Lichen
			- Drowneds
		`,
		query: (player) => in_raduis(player, '45 31 -145')
	},
	geode: {
		data: `
			require: mushroom_island
			title: Cracked Gemstone
			icon: textures/blocks/amethyst_cluster
			* Visit the amethyst island for... Amethyst
		`,
		query: (player) => in_raduis(player, '-45 32 145'),
	},
	lush_cave: {
		data: `
			require: birch
			title: The Underground Garden
			icon: textures/blocks/potted_azalea_bush_plant
			* Dip down to the lush island for:
			- Moss
			- Azalea
			- Glow Berries
			- Dripleaves
			- Clay
			- Axolotls
			- Tropical Fish
		`,
		query: (player) => in_raduis(player, '-145 31 -49')
	},
	deep_dark: {
		data: `
			require: savanna
			title: Corruption
			icon: -30146560
			* Descend to the deep dark island for:
			- Sculk Blocks
			- Sculk Sensors
			- A Sculk Catalyst
			- Deepslate
		`,
		query: (player) => in_raduis(player, '145 -33 49')
	},
	crimson: {
		data: `
			require: nether
			title: The Nether Artery
			icon: -15204352
			* Visit the crimson island for
			- Crimson Wood
			- Weeping Vives
			- Crimson Fungi
			- Hoglins
		`,
		query: (player) => in_raduis(player, '96 63 0', 'minecraft:nether')
	},
	warped: {
		data: `
			require: nether
			title: The Nether Veins
			icon: -15269888
			* Visit the warped island for
			- Warped Wood
			- Twisted Vines (Make sure to grow it up before harvesting)
			- Warped Fungi
			- Endermen
		`,
		query: (player) => in_raduis(player, '-96 63 0', 'minecraft:nether')
	},
	soulsand_valley: {
		data: `
			require: nether
			title: Soul Flames
			icon: -15466496
			* Visit the soulsand island for:
			- Soul Sand
			- Soul Soil
			- Bone blocks
			- Ghasts
			- Nether Skeletons
		`,
		query: (player) => in_raduis(player, '0 63 -96', 'minecraft:nether')
	},
	basalt_deltas: {
		data: `
			require: nether
			title: Volcanic Fields
			icon: -15335424
			* Visit the basalt deltas island for:
			- Lava
			- Basalt
			- Blackstone
			- Magama Cubes
		`,
		query: (player) => in_raduis(player, '0 63 96', 'minecraft:nether')
	},
	biome_detector: {
		data: `
			require: (swamp | jungle | desert | taiga)
			title: Nature Sense
			icon: textures/items/biome_detector
			* Record a new biome on the biome detector
			- find the player settings in the guidebook
			- activate the biome detector
			- walk out into another biome
		`,
		query: (player) => player.getDynamicProperty('biome_detector')
	},
	structure_locator: {
		data: `
			require: biome_detector
			title: Remnants of the Past
			icon: textures/items/structure_locator
			* Find a structure using the structures map
			- open the structures map in the guidebook
			- select the structure you want to visit
			- follow the compass until you reach it
			- explore more islands to unlock new structures
		`,		
		query: (player) => locating_players.has(player.id)
	},
	witch_hut: {
		data: `
			require: (structure_locator & swamp)
			title: Source of Evil
			icon: textures/items/cauldron
			* Reach the Swamp Hut and kill the witch inside
		`,
		query: (player) => (
			in_raduis(player, '819 65 356', undefined, 10) && 
			!player.runCommand('testfor @e[type=witch, r=32]').successCount
		)
	},
	jungle_temple: {
		data: `
			require: (structure_locator & jungle)
			title: Tomb Raider
			icon: textures/items/wild_armor_trim_smithing_template
			* Locate and loot the jungle temple
		`,
		query: (player) => {
			const place = in_raduis(player, '-459 69 886', undefined, 16)
			const chest = player.dimension.getBlock({x:-456, y:66, z:883})?.getComponent("inventory")?.container
			return place && (!chest || chest.emptySlotsCount > 26)
		}
	},
	igloo: {
		data: `
			require: (structure_locator & taiga)
			title: Snow House
			icon: 5242880
			* Visit the Igloo and cure the zombie villager
			(How is this furnace still burning?)
		`,
		query: (player) => (
			in_raduis(player, '-348 71 -717', undefined, 16) && 
			player.runCommand('testfor @e[type=villager, r=16]').successCount > 1
		)
	},
	desert_pyramid: {
		data: `
			require: (structure_locator & desert)
			title: Welcome to Giza
			icon: textures/items/dune_armor_trim_smithing_template
			* Visit and disarm the desert pyramid
			- reach the desert temple
			- break all the TNT
			- loot the chest
		`,
		query: (player) => (
			in_raduis(player, '-762 65 -266', undefined, 32) && 
			player.dimension.getBlock({x:-762, y: 63, z: -266})?.typeId == "minecraft:air"
		),
		reward: ["A redstone torch", `give @s redstone_torch`]
	},
	pillager_outpost: {
		data: `
			require: (structure_locator & savanna)
			title: Enemy's Camp
			icon: textures/items/sentry_armor_trim_smithing_template
			* Find the pillager outpost and kill every pillager
		`,
		query: (player) => (
			in_raduis(player, '-889 73 439', undefined, 32) && 
			!player.runCommand('testfor @e[type=pillager, r=40]').successCount
		),
		reward: ["Bad Omen for 10 minutes", `effect @s bad_omen 600`]
	},
	trail_ruins: {
		data: `
			require: (structure_locator & taiga)
			title: Buried City
			icon: textures/items/wayfinder_armor_trim_smithing_template
			* Locate and clean the trail ruins
			- go to the trail ruins
			- craft a shovel or two
			- dig all the dirt, course dirt, and gravel
			- find every suspicious gravel location (there are 20)
			- brush all the suspicious gravel in the structure
			(Remember their locations because they will regenerate after a while)
		`,
		query: (player) => (
			in_raduis(player, '130 45 -840', undefined, 20) && [
				{x:131, y:45, z:-824}, {x:135, y:45, z:-829}, {x:128, y:40, z:-857}, {x:131, y:40, z:-855},
				{x:134, y:41, z:-850}, {x:137, y:42, z:-853}, {x:126, y:43, z:-847}, {x:137, y:45, z:-842},
				{x:136, y:43, z:-844}, {x:129, y:43, z:-843}, {x:127, y:44, z:-836}, {x:123, y:47, z:-832},
				{x:125, y:45, z:-829}, {x:131, y:51, z:-831}, {x:139, y:46, z:-832}, {x:140, y:46, z:-828},
				{x:129, y:50, z:-832}, {x:134, y:48, z:-841}, {x:121, y:46, z:-829}, {x:130, y:45, z:-830},
			].every(location => 
				(player.dimension.getBlock(location)?.typeId ?? "minecraft:suspicious_gravel") != "minecraft:suspicious_gravel"
			)
		)
	},
	woodland_mansion: {
		data: `
			require: (structure_locator & dark_forest)
			title: Hidden in the Woodlands
			icon: -48693248
			* Visit the woodland mansion and find the secret chest
			- use the structures map to find the woodland mansion
			- build a bridge until you reach it
			- kill the evoker and the vindicators
			- find the secret chest
			(It's not a secret anymore now i told you)
		`,
		query: (player) => (
			in_raduis(player, '531 64 -862', undefined, 20) &&
			check_items(player, 'vex_armor_trim_smithing_template')
		)
	},
	trial_chambers: {
		data: `
			require: (structure_locator & cherry)
			title: Trials & Errors
			icon: -49807360
			* Visit the and complete the trial chambers
			- use the structures map to locate the trial chambers
			- enter the trial chambers to activate the spawners
			- kill all the mobs they spawn
			- obtain a trial key
			- use the trial key to open a vault
		`,
		query: (player) => (
			in_raduis(player, '375 13 -505', undefined, 40) &&
			view_stats(player, 'items_used_on', 'minecraft:trial_key')
		),
		reward: ["10 Copper Blocks", `give @s waxed_copper 10`]
	},
	mineshaft: {
		data: `
			require: (structure_locator & badlands)
			title: The Last Mine
			icon: textures/blocks/rail_normal
			* Find the mineshaft and mine a sample of each ore
		`,
		query: (player) => (
			in_raduis(player, '696 32 -236', undefined, 20) &&
			['coal_ore', 'iron_ore', 'gold_ore'].every(ore => 
				view_stats(player, 'blocks_broken', 'minecraft:' + ore)
			)
		)
	},
	shipwreck: {
		data: `
			require: (structure_locator & ocean)
			title: Wrecked and Ruined
			icon: textures/items/coast_armor_trim_smithing_template
			* Pay a visit to the ocean ruins and find the treasure map
		`,
		query: (player) => (
			in_raduis(player, '-641 45 262', undefined, 30) &&
			check_items(player, 'yasser444:treasure_map')
		)
	},
	ancient_city: {
		data: `
			require: (structure_locator & deep_dark)
			title: Everdark
			icon: textures/items/ward_armor_trim_smithing_template
			* Locate the ancient city and trigger a warden
		`,
		query: (player) => (
			in_raduis(player, '157 -43 764', undefined, 40) &&
			player.runCommand('testfor @e[type=warden]').successCount
		)
	},
	monument: {
		data: `
			require: (structure_locator & mushroom_island)
			title: Submerged!
			icon: 11010050
			* Raid the ocean monument and find the gold
		`,
		query: (player) => (
			in_raduis(player, '632 39 760', undefined, 30) &&
			check_items(player, 'raw_gold_block')
		)
	},
	fortress_loot: {
		data: `
			require: fortress
			title: Fortified!
			icon: textures/items/rib_armor_trim_smithing_template
			* Loot the chest in the nether fortress
		`,
		query: (player) => (
			check_location(player, 'minecraft:nether', [{x:64, y: 50, z: 113}, {x: 111, y: 55, z: 143}]) &&
			check_items(player, 'rib_armor_trim_smithing_template')
		)
	},
	bastion: {
		data: `
			require: (structure_locator & crimson)
			title: Hog Town
			icon: textures/items/snout_armor_trim_smithing_template
			* Raid the nether bastion while wearing any golden armor
		`,
		query: (player) => (
			check_location(player, 'minecraft:nether', [{x:-109, y: 64, z: 79}, {x: -97, y: 76, z: 105}]) && [
				"{item=golden_helmet, location=slot.armor.head}",
				"{item=golden_chestplate, location=slot.armor.chest}",
				"{item=golden_leggings, location=slot.armor.legs}",
				"{item=golden_boots, location=slot.armor.feet}",
			].some(armor => player.runCommand(`/testfor @s[hasitem=${armor}]`).successCount)
		)
	},
	ruined_portal: {
		data: `
			require: (structure_locator & warped)
			title: Getting an Upgrade
			icon: textures/items/netherite_upgrade_smithing_template
			* Locate a ruined nether portal and obtain a netherite upgrade
		`,
    	query: (player) => check_items(player, 'netherite_upgrade_smithing_template')
	},
	end_city: {
		data: `
			require: dragon
			title: Endless Void
			icon: textures/items/spire_armor_trim_smithing_template
			* Reach the End city in the endless end void
			- throw an ender pearl through the end gateway to teleport to the other side
			- once you're there, build a bridge to the end city island
			- get inside the end city
			- do not kill the shulkers, Head to "Shell Lurkers" achievement in Skyblock Path
		`,
		query: (player) => in_raduis(player, '-298 71 -954', 'minecraft:the_end', 8)
	},
	wheat_farm: {
		data: `
			require: farm
			title: Bread Fields
			icon: textures/items/wheat
			* Build a large wheat farm and collect 1 stack of wheat
			- there are multiple good options for farming wheat
			- you could farm it manually by building a large farmland and planting wheat on it
			- you could make a semi automatic farm where you place seeds and it gets automatically bonemealed and harvested
			- you could build a fully automatic farm where villagers harvest and replant the wheat while hopper minecarts or allays collect it
			- you could also come up with your own design
			- submit 2 stacks of wheat to complete this quest
			(Note that these quests aim to encourage you to build farms and be self-stuffiest in terms of generating your resources, do not complete these quests unless you have a farm that you're happy with)
		`,
		consume: ["2 Stacks of Wheat", `wheat 128`],
		reward: ["16 Bone Blocks", `give @s bone_block 16`]
	},
	vegetables: {
		data: `
			require: (farm & mob_trap)
			title: Buy it Fresh
			icon: textures/items/potato
			* Build a farm for carrots and potatoes and obtain a stack of each
			- obtain a carrot and a potato from killing zombies
			- choose a farm design from the ones listed in "Bread Fields" and build a farm for carrots and potatoes
			- submit a stack of each to complete this quest
			(Carrots can also be found in the shipwreck; Husk don't drop carrots when the More Sand addon is active, so your chances of obtaining a potato are higher)
		`,
		consume: ["64 Carrots and 64 Potatoes", `[carrot 64, potato 64]`],
		reward: [ "Fortune II Golden Hoe", (player) => {
			const hoe = new ItemStack('golden_hoe')
			hoe.getComponent("enchantable").addEnchantment({type: new EnchantmentType("fortune"), level: 2})
			player.dimension.spawnItem(hoe, player.location)
		}]
	},
	cactus_farm: {
		data: `
			require: desert
			title: What's Green and Prickly?
			icon: ${81 * aux}
			* Build a cactus farm
			- cactus farms are super easy to build
			- collect a cactus from the desert or the badlands island
			- plant 16 cactus or more on sand in a grid
			- place fences one block above to the side of your cacti to harvest it automatically
			- use water to flush the harvested cactus into a central location
			- you could expand your farm horizontally by extending the grid or vertically by stacking more layers
			(smelting cactus is great source of passive xp, here is the xp worth of smelting 10 stacks of cactus)
		`,
		consume: ["A stack of Cactus", `cactus 64`],
		reward: ["The xp you get from smelting 10 stacks of cactus", `xp 128`]
	},
	sand_farm: {
		data: `
			require: desert
			title: Desertification
			icon: 786432
			* Build a husk farm in the desert biome to farm sand
			- build a large platform in the desert biome for husks to spawn at night
			- use water to flush the mobs into a drop chute
			- kill the husks that drop and collect a stack of sand
			(You may also cover the platform with leaves so it is dark during the day)
		`,
		consume: ["64 Blocks of Sand", `sand 64`],
		reward: ["4 stacks of Oak Leaves", `give @s oak_leaves 256`]
	},
	pumpkin_farm: {
		data: `
			require: taiga
			title: Harvest Season
			icon: 5636096
			* Build a pumpkin farm
			- pick up the pumpkin from the taiga island and craft it into seeds
			- build a simple pumpkin farm to get more pumpkin seeds
			- expand your farm until you have over 30 pumpkin plants
			- harvest a stack of pumpkin
			(Selling Pumpkins to villagers is a great source of emeralds; The image below shows the best layout for farming melons and pumpkins; You may automate the farm later with pistons and observers)
			image: textures/ui/guidebook/pum_and_mel_farm
		`,
		consume: ["64 Pumpkins", `pumpkin 64`],
		reward: ["Shears", `give @s shears`]
	},
	snow_farm: {
		data: `
			require: taiga
			title: It's White and Cold
			icon: 5242880
			* Use snow golems to farm a lot of snow
			- craft a stone shovel and collect 8 snowballs from the taiga island
			- carve a pumpkin using shears
			- summon a snow golem with 2 snow blocks and a carved pumpkin
			- remember to put a roof over your snow golem to protect it from the rain water
			- dig the snow layers from beneath the snow golem using shovels
			- craft your snow balls into snow blocks for compact storage
			(You could use pistons and slime blocks to automatically harvest the snow; You could use crafters to automatically craft snow blocks)
		`,
		consume: ["64 Snow Blocks", `snow 64`],
		reward: ["Unbreaking III Iron shovel", (player) => {
			const item = new ItemStack('iron_shovel')
			item.getComponent("enchantable").addEnchantment({type: new EnchantmentType("unbreaking"), level: 3})
			player.dimension.spawnItem(item, player.location)
		}]
	},
	slime_farm: {
		data: `
			require: swamp
			title: Slimy Situation
			icon: textures/items/slimeball
			* Find a slime chunk and build a slime farm
			- you can use a stone shovel on a block of stone to locate the nearest slime chunk
			- you can also use the §7/inform slimechunk§r command to see if you are in a slime chunk or not
			- build a platform below y level 40 inside a slime chunk for slimes to spawn on
			- you can stack multiple platforms if you leave 3 blocks of space between them
			- light the spawning platforms so no other mobs can spawn
			- use snow golems or iron golems to lure the slime into a death chamber
			- use campfires, magma, or any other method to kill the slime
			- craft and submit 16 slime blocks
			(Slimes can spawn on jack o'lanterns, so use them to light the platforms insead of torches)
		`,
		consume: ["16 Slime Blocks", `slime 16`],
		reward: ["16 Jack o'Lanterns", `give @s lit_pumpkin 16`]
	},
	mushroom_farm: {
		data: `
			require: mushroom_island
			title: Mycologist
			icon: textures/blocks/mushroom_brown
			* Build a mushroom farm for red and brown mushrooms
			- the best way to farm mushrooms is to grow and harvest large mushrooms
			- obtain a red and a brown mushroom from the mushroom island
			- to grow a large mushroom, you need to place a mushroom on a dirt block in a dark area and grow it up with bonemeal
			- the nether is always dark and suitable for growing mushrooms
			- mushrooms planted on mycelium or podzol don't need a dark area
			- farm both types of mushroom by growing and harvesting large mushrooms
			(Mushroom Blocks break instantly with iron axes)
		`,
		consume: ["32 Brown and 32 Red Mushrooms", `[red_mushroom 32, brown_mushroom 32]`],
		reward: ["3 Iron Axes", `give @s iron_axe 3`]
	},

	sneak_a_warden: {
		data: `
			require: ancient_city
			title: Sneaky Like a Ninja
			icon: -20119552
			* Spend 2 minutes within 16 blocks of a warden
			- click Start to start the timer
			- if you get farther than 16 blocks you lose
			- if the warden leaves you lose
			- if you die you lose
			- the challenge is completed once the 2 minutes are up
		`,
		challenge: {
			timer: {interval: 20, time: 120},
			callback: (player, id, time) => () => { time--
				const warden = player.runCommand('testfor @e[type=warden, r=16]').successCount
				if (!warden) {
					player.sendMessage("§mYou have failed!")
					stop_challenge(player, id)
				}
				if (time == 0) {
					complete(player, id)
					stop_challenge(player, id)
				}
			}
		},
		reward: ["Silence Armor Trim", `give @s silence_armor_trim_smithing_template`]
	},
	desert_fishing: {
		data: `
			require: (desert & mob_trap)
			title: Deserted Fish
			icon: textures/items/fish_clownfish_raw
			* Catch a tropical fish in the desert biome
			- go to the desert island
			- click Start and start fishing
			- catch a tropical fish
		`,
		challenge: {
			event: world.beforeEvents.entityRemove,
			callback: (player, id) => ({removedEntity:entity}) => {
				if (entity.typeId != 'minecraft:fishing_hook') return
				const {location, dimension} = entity
				if (player.id != dimension.getPlayers({location, closest: 1})[0]?.id) return
				const nearest_item = dimension.getEntities({location, closest: 1, type: "item"})[0]
				if (!nearest_item) return
				if (get_distance(nearest_item.location, location)) return
				if (nearest_item.getComponent('item').itemStack.typeId != 'minecraft:tropical_fish') return
				system.run(async () => {
					if (await dimension.getBiome(location) != "desert") return
					complete(player, id)
					stop_challenge(player, id)
				})
			}
		},
		reward: ["Trophy Fish Mount", `give @s frame`]
	},
	located_all_structures: {
		data: `
			require: structure_locator
			title: On the Radar
			icon: textures/items/globe_banner_pattern
			* Visit all 15 skybedrock structures and complete their dedicated acheievements
			- Source of Evil
			- Tomb Raider
			- Snow House
			- Welcome to Gize
			- Enemy's Camp
			- Buried City
			- Hidden in the Woodlands
			- Trials & Errors
			- The Last Mine
			- Wreaked and Ruined
			- Everdark
			- Submerged!
			- Fortified!
			- Hog Town
			- Getting an Upgrade
		`,
		query: (player) => [
			'witch_hut', 'jungle_temple', 'igloo', 'desert_pyramid',
			'pillager_outpost', 'trail_ruins', 'woodland_mansion', 'trial_chambers',
			'mineshaft', 'shipwreck', 'ancient_city', 'monument',
			'fortress_loot', 'bastion', 'ruined_portal',
		].every(ach => check_ach(player, ach)),
		reward: ["Unlock Over 16 chunks render distance", (player) => {
			player.setDynamicProperty("free_vision", true)
			update_vision(player, player.dimension)
		}]
	},
	direwolf: {
		data: `
			require: (dark_forest & snow_farm)
			title: Extinct Dire Wolf
			icon: textures/items/bone
			* Find and tame a snowy wolf
			- go the the grove biome
			- build a platform of snow
			- wait for a snowy wolf to spawn
			- tame it with a bone
		`,
		query: (player) => {
			const wolfs = player.dimension.getEntities({type: "minecraft:wolf"}) // get all wolfs
			return wolfs.some(wolf => {
				const variant = wolf.getComponent("variant")
				if (!variant || variant.value != 5) return // filter snowy wolfs
				return wolf.getComponent('is_tamed')
				// const tameable = wolf.getComponent("tameable")
				// if (!tameable || !tameable.isTamed) return // filter tamed wolfs
				// return tameable.tame(player)
			})
		},
		reward: ["Snowy Wolf Armor", (player) => player.dimension.spawnItem(stored_items.rewards[0], player.location)]
	},
	bug_fixes: {
		data: `
			require: trial_chambers
			title: Bug Fixes
			icon: textures/items/mace
			* Kill 30 arthopods with a mace smash attack
			% n$1/30 Arthopods smashed:
			(Arthopods include Spiders, Cave Spider, Silverfish, Endermites, and Bees)
		`,
		format: (player, id) => [
			['$1', quest_tracker[`${player.id} ${id} bugs_killed`] ?? 0]
		],
		challenge: {
			event: world.afterEvents.entityDie,
			callback: (player, id) => ({deadEntity, damageSource: {cause, damagingEntity}}) => {
				if (damagingEntity?.id != player.id) return
				if (cause != 'maceSmash') return
				if (!deadEntity.getComponent('type_family').hasTypeFamily('arthropod')) return
				const bugs_killed = `${player.id} ${id} bugs_killed`
				quest_tracker[bugs_killed] = quest_tracker[bugs_killed] + 1 || 1
				if (quest_tracker[bugs_killed] == 30) {
					complete(player, id)
					stop_challenge(player, id)
					return
				}
			}
		}
	},
	pirate: {
		data: `
			require: (jungle & geode)
			title: Pirate Mode
			icon: textures/items/spyglass
			* Use a spyglass with a parrot on your shoulder while riding a boat in the ocean
			- find and tame a parrot in the jungle biome
			- craft a spyglass using amethyst and copper
			- build a little pool in the ocean biome
			- pick up the parrot on your shoulder
			- place and ride a boat in your pool
			- look through the spyglass
			(Look at yourself XD)
		`,
		query: async (player) => {
			const parrot = player.getComponent('rideable').getRiders().find(rider => rider.typeId == 'minecraft:parrot')
			const ride = player.getComponent('riding')?.entityRidingOn
			const boat = ride?.typeId?.includes('boat')
			const water = ride?.isInWater
			const spyglass = player.getComponent('equippable').getEquipment('Mainhand')?.typeId == 'minecraft:spyglass'
			const ocean = (await player.dimension.getBiome(player.location)).includes("ocean")
			return parrot && boat && water && spyglass && ocean
		},
		reward: ["A treasure map and a Banner", (player) => {
			player.dimension.spawnItem(stored_items.rewards[1], player.location)
			player.dimension.spawnItem(new ItemStack('yasser444:treasure_map'), player.location)
		}]
	},
	crafted_trials: {
		data: `
			require: trial_chambers
			title: Crafted Trials
			icon: textures/items/spawner_core
			* Construct a vault or an ominuos vault
			- go to the trial chambers and drink an ominous bottle
			- fight the mobs and obtain a spawner core from a trial spawner
			- craft a vault shell or an ominous vault shell
			- build a vault altar and activate the vault with a spawner core
			(Click the spawner core icon in your inventory for all the details)
		`,
		checkmark: false,
		reward: ["Creator Music Disc", `give @s music_disc_creator`]
	}
}

Object.entries(quests).forEach(([id, {data, query, consume, reward, challenge, checkmark, format}]) => {
	data = data.split('\n').map(line => line.replaceAll('	', ''))  // remove the indentation
	const icon = data.find(line => line.startsWith('icon: '))?.replace('icon: ', '')
	const title = data.find(line => line.startsWith('title: '))?.replace('title: ', '')
	const summary = data.find(line => line.startsWith('* '))?.replace('* ', '')
	const note = data.find(line => line.startsWith('(') && line.endsWith(')'))?.slice(1, -1)
	const image = data.find(line => line.startsWith('image: '))?.replace('image: ', '')
	const parent = data.find(line => line.startsWith('require: '))?.replace('require: ', '')
	const lines = data.filter(line => line.slice(0, 2) != '* ' && line[1] == ' ')
	.map(line => [line[0], line.slice(2)])  // convert from "prefix string" to [prefix, string]
	quests[id] = {
		icon, title, summary, note, image, parent,
		lines: lines.filter(line => typeof line == 'object'),
		query, consume, reward, challenge, checkmark, format
	}
})

const for_rework = { /*

	new_fromat: {
		data: `
			icon: path or aux
			title: Text
			* summary
			- bullets
			! notes
			# phrases
			--- (dividers)
			^ images
			@ links
			$ 
			% 
			& 
			| 
			: 
			? 
			/ 
			~ 
		`,
		require: id,                }
		require_all: [id, id, id],  }  only one of these and can be ignored
		require_any: [id, id, id],  }
		query: () => {},      }
		challange: {},        }  only one 
		checkmark: bool,      }  of these
		consume: ["", ``],    }
		reward: ["", ``],           } can be ignored
	},

	oceans: {
		data: `
			require: (shipwreck)
			title: In the Seven Seas
			icon: textures/items/boat_dark_oak
			* Find every ocean biome in the map
		`
	},
	mountains: {
		data: `
			require: (biome_detector)
			title: The Summit
			icon: 8454144
			* Find every mountain biome in skybedrock
			- find the Meadow
			- find the Grove
			- find the Stony Peaks
			- find the Jagged Peaks
			- find the Snowy Slopes
		`,
		reward: ["A Flag", `give @s banner 1 6`]
	},
	treasure: {
		data: `
			require: (shipwreck)
			title: Plunder!
			icon: textures/items/map_nautilus
			* Take the sky treasure map from the ocean ruins and find the treasure
		`
	},
	other_soulsand_valley: {
		data: `
			require: (biome_detector & soulsand_valley)
			title: Nio Diversity
			icon: 14155776
			* Travel in the nether until you detect a new soul sand valley biome in the biome detector
		`
	},
	biomes: {
		data: `
			require: (biome_detector & desert & mountains & oceans & mineshaft & the_end & lush_cave & cherry & dark_forest & basalt_deltas & locked)
			title: Skybedrock Ecosystem
			icon: textures/items/map_locked
			* Record every biome of the following on the biome detector
		`
	},
	strongholds: {
		data: `
			require: (stronghold)
			title: find_strongholds
			icon: textures/items/eye_armor_trim_smithing_template
			* Find all three strongholds and obtain Eye armor trim
		`
	},

	mob_farm
	require: mob_trap
	title: Watch You Steps
	icon: textures/items/bone
	* Build an automatic mob farm
	- collect a trident and some redstone
	- build a mob farm with more layers
	- install a trident killer in the killing chamber to kill the mobs automatically
	(Alternatively you could use soul campfires to kill the mobs)

	cow_farm
	require: farm
	title: Slaughterhouse
	icon: textures/items/leather
	* Build a cow farm with over 30 cows
	- expand your grass platform
	- get some cows to spawn on it
	- build your cows an animal enclosure
	- breed your cows until you have over 30
	- when you feel you have enough cows breed them all and slaughter them except the babies

	fishing_farm
	require: water
	title: Patience Is Key
	icon: textures/items/fishing_rod_uncast
	* Build an afk fishing farm
	- build a machine that lets you fish while you are afk
	- use the machine until you catch a fishing rod with mending on it
	- keep fishing until you catch a treasure item
	(You might need an auto clicker to run the machine)

	sweet_berry
	require: taiga
	title: It Might Be Poisonous
	icon: textures/items/sweet_berries
	* Collect 64 sweet berries
	- pick up a berry from the taiga island
	- plant a sweet berry bush on grass or dirt and harvest the berries when they are ready
	- plant 15 more berry bushes
	- collect a stack of sweet berries
	- now you must eat a sweet berry

	stray_farm
	require: taiga
	title: Someone in the Blizzard
	icon: textures/items/tipped_arrow_slow
	* Build a stray farm for tuff
	- find the snowy plains biome using the biomes map in the how to play screen
	- build a platform in there for strays to spawn at night
	- surround the platform with walls so the strays can not shoot you
	- collect 16 blocks of tuff from killing strays

	melon_farm
	require: jungle
	title: Fresh Watermelon
	icon: textures/items/melon
	* Build a melon farm
	- break the melon in the jungle island and craft some melon seeds
	- start a small melon farm
	- expand your farm until you have 60 melon stems
	- harvest your melon craft 64 melon blocks
	(All crops are affected negatively by crops of the same type planted diagonally to them, you can plant your melon and pumpkin side by side (one lane for pumpkin and the other for melon) to speed up their growth)

	cocoa_farm
	require: jungle
	title: Chocolate Tree?
	icon: textures/items/dye_powder_brown
	* Plant and harvest 64 cocoa beans
	- find cocoa beans in the jungle island
	- collect 16 or more jungle logs
	- plant your cocoa beans on the sides of jungle logs
	- harvest 64 cocoa beans

	bamboo_farm
	require: jungle
	title: Jungle Grows Restless
	icon: textures/items/bamboo
	* Build an automatic bamboo farm

	sugar_cane_farm
	require: birch
	title: Sugar Sweet!
	icon: textures/items/reeds
	* Build a sugar cane farm

	tall_flowers
	require: (jungle & birch & dark_forest & savanna)
	title: Pretty Bouquet
	icon: textures/blocks/double_plant_rose_top
	* Collect 64 of every tall flower

	sea_pickles
	require: (coral_farm & dark_forest)
	title: Pick All
	icon: textures/items/sea_pickle
	* Make an automatic sea pickles farm

	honeycomb_farm
	require: cherry
	title: The Apiary
	icon: textures/items/honeycomb
	* Make an automatic honeycomb farm

	honey_farm
	require: cherry
	title: Beekeeper
	icon: textures/items/honey_bottle
	* Build a honey farm

	dirt_farm
	require: (gravel_farm | mob_farm)
	title: The Endless Grind
	icon: 196608
	* Build an area to smooth course dirt

	kelp_farm
	require: ocean
	title: Seek Help
	icon: textures/items/kelp
	* Build a kelp farm

	composter
	require: (melon_farm | kelp_farm | moss_farm | nether_wood_farm)
	title: Green Energy
	icon: -13959168
	* Build a bone meal farm using composters
	- build any sort of plants farm
	- feed its output to a composter
	- gather 64 bone meal from the composter output

	drowned_farm
	require: (ocean | dripstone)
	title: drowned_farm
	icon: textures/items/trident
	* Build a drowned farm
	- build a large platform in the ocean, river, or dripstone caves biome
	- cover it with leaves or tinted glass to turn it dark during the day and allow for surface spawning
	- fill the platform with water to allow for drowned spawning and push them to a kill chamber
	- collect 10 copper ingots
	- collect 5 nautilus shells
	- collect 5 tridents
	(if you built the farm in a dripstone caves biome, you can use any blocks to darken the spawning platforms, you may also built the farm out of multiple layers)

	squid_farm
	require: ocean
	title: Inky Way
	icon: textures/items/dye_powder_black
	* Build a squid farm in the ocean biome

	coral_farm
	require: ocean
	title: Marine Life
	icon: textures/blocks/coral_plant_blue
	* Build a bone meal based coral farm in any warm ocean biome

	fish_farm
	require: ocean
	title: Smells Fishy
	icon: textures/items/fish_raw
	* Build a fish farm in the warm ocean biome

	web_farm
	require: (brewing & badlands)
	title: Dark Web
	icon: textures/blocks/web
	* Build a cobweb farm with the weaving potions

	turtle_farm
	require: birch
	title: turtle_farm
	icon: textures/blocks/seagrass_carried
	* Find sea turtles and build a breeder for them

	glow_berry
	require: lush_cave
	title: Shiny Fruit
	icon: textures/items/glow_berries
	* Collect 64 glow berries

	hanging_roots
	require: lush_cave
	title: Hang In There
	icon: textures/blocks/hanging_roots
	* Collect 64 hanging roots

	dripleaves
	require: lush_cave
	title: Living Parkour Material
	icon: -21168128
	* Collect 64 big dripleaves

	amethyst_farm
	require: geode
	title: Chiming Crystals
	icon: textures/items/amethyst_shard
	* Build an amethyst farm in the geode

	glow_squid
	require: squid_farm
	title: Like a Dream
	icon: textures/items/dye_powder_glow
	* Build a glow squid farm

	glow_lichen
	require: dripstone
	title: I'm Liking It
	icon: textures/blocks/glow_lichen
	* Collect 64 glow lichen

	dripstone_farm
	require: dripstone
	title: Speleothems
	icon: textures/blocks/pointed_dripstone_down_tip
	* Build an automatic dripstone farm

	lava_farm
	require: (iron_farm & dripstone_farm)
	title: The Forge
	icon: textures/items/bucket_lava
	* Collect 27 lava buckets

	obsidian_generator
	require: lava_farm
	title: Not a Mistake
	icon: 3211264
	* Build an obsidian generator that uses lava

	ice_farm
	require: (silk_touch & snow_farm)
	title: Ice Breaker
	icon: ${aux * 79}
	* Build an ice farm in a cold biome

	powder_snow
	require: (taiga & iron_farm)
	title: Undisturbed Snow
	icon: textures/items/bucket_powder_snow
	* Collect 27 buckets of powder snow

	chicken_farm
	require: iron
	title: Rotisserie
	icon: textures/items/chicken_cooked
	* Build an automatic chicken cooker

	eggs
	require: iron
	title: All My Eggs in One Basket
	icon: textures/items/egg
	* Fill up a chest or a shulker box with eggs

	wool_farm
	require: (wool & iron)
	title: Cheerful Day!
	icon: 2293760
	* Build an automatic wool farm for 5 colors of wool

	flower_farm
	require: (dark_forest & birch & evoker)
	title: The Smell of Spring
	icon: textures/blocks/flower_cornflower
	* Build a flower farm for every small flower
	- collect a poppy, dandelion, and a cornflower from the starter island
	- collect an oxeye daisy and an azure bluet by bone mealing grass in the plains biome
	- collect a blue orchid from the swamp island
	- collect a lily of the valley from the roofed island or by bone mealing grass in any forest biome
	- collect an allium from the woodland mansion
	- find a tulip patch and collect all 4 colors of tulips
	- build a small flower farm
	- farm 64 of every type of flower
	(Bone mealing the grass in the flower forest or meadow biome does only grow poppies due to a bug)
	(You may also buy any type of flowers from the wandering trader)
	(A tulip patch can be found at 440 64 -160)

	vine_farm
	require: (swamp & iron)
	title: Viner
	icon: textures/blocks/vine_carried
	* Collect 64 vines

	witch_farm
	require: witch_hut
	title: Wild Witch Hunt
	icon: textures/items/redstone_dust
	* Build a witch farm at the swamp hut

	gold_farm
	require: gold
	title: We Hit Gold
	icon: textures/items/gold_nugget
	* Build an automatic gold farm for gold and xp

	pigman_farm
	require: gold_farm
	title: Rebuilding the Nether
	icon: 5701632
	* Build a zombiefied piglin farm in the nether for netherrack

	bartering_farm
	require: gold
	title: Greedy Piglins
	icon: textures/items/gold_ingot
	* Capture 10 piglins and build a bartering machine

	fungus_farm
	require: (crimson & warped)
	title: Fun Guy
	icon: textures/blocks/warped_fungus
	* Build a farm for crimson and warped fungi

	nether_vines
	require: (crimson & warped)
	title: Up n Down
	icon: textures/blocks/weeping_vines_plant
	* Harvest 64 weeping vines and 64 twisting vines

	fortress_farm
	require: fortress
	title: Fuel for Days
	icon: textures/items/coal
	* Find every spawning spot in the fortress and turn it into a fortress farm

	blaze_farm
	require: fortress_loot
	title: That's Fire
	icon: textures/items/blaze_rod
	* Build a blaze only farm

	coal_farm
	require: (fortress_loot & other_soulsand_valley)
	title: Overcooked
	icon: textures/ui/items/head_wither_skeleton
	* Find a new nether fortress and build a wither skeleton only farm

	nether_wart
	require: fortress_loot
	title: Growing Up Warts
	icon: textures/items/nether_wart
	* Harvest 4 stacks of nether wart

	strider_farm
	require: (basalt_deltas & lava_farm)
	title: Nether Silk
	icon: textures/items/string
	* Build a strider farm in the nether for string

	ghast_farm
	require: soulsand_valley
	title: Don't Cry
	icon: textures/items/ghast_tear
	* Build a ghast farm in the soul sand valley

	valley_skeleton_farm
	require: other_soulsand_valley
	title: Magic Bones
	icon: textures/items/bone
	* Build a skeleton farm in a soul sand valley biome for souland

	basalt_farm
	require: (ice_farm & basalt_deltas)
	title: Supercooling
	icon: -15335424
	* Build a basalt generator
	- get a block of soul soil either by visiting the souland island, crafing and breaking a soul campfire, or by killing a ghast
	- craft a block of blue ice or buy it from a wandering trader
	- build a basalt generator with lava, soul soil, and blue ice
	(lava flows faster in the nether, so if you build it there, it will generate blocks faster)

	magma_farm
	require: basalt_deltas
	title: Living Magma
	icon: textures/items/magma_cream
	* Build a magma cube farm

	froglight_farm
	require: (magma_farm & swamp)
	title: Little Things Matter
	icon: -30736384
	* Build a froglight farm

	villager_farm
	require: villagers
	title: Repopulation
	icon: textures/items/bed_brown
	* Build an infinite villager breeder

	iron_farm
	require: villager_farm
	title: Iron Factory
	icon: textures/items/iron_ingot
	* Build an iron farm with 20 villagers

	farmer
	require: villagers
	title: Farmers' Market
	icon: textures/items/carrot_golden
	* Max out a farmer villager

	fletcher
	require: villagers
	title: Archery
	icon: textures/items/arrow
	* Buy 4 stacks of arrows from fletchers

	cleric
	require: villagers
	title: The Enchanter
	icon: textures/items/dye_powder_blue
	* Max out four cleric villagers

	mason
	require: villagers
	title: Spawn Masons
	icon: 10158080
	* max out 6 stone masons

	ominous_farm
	require: pillager_outpost
	title: I Have a Bad Feeling About This
	icon: textures/items/crossbow_arrow
	* Build an ominous bottle farm at the pillager outpost

	raid_farm
	require: ominous_farm
	title: I Am Rich
	icon: textures/items/emerald
	* Build a raid farm

	stone_farm
	require: (silk_touch & witch_farm)
	title: Stoned!
	icon: 65536
	* Make a stone generator

	creeper_farm
	require: mob_farm
	title: Highly Explosive
	icon: textures/items/gunpowder
	* Build a creeper only farm

	phantom_farm
	require: no_sleep
	title: The Fruit of Insomnia
	icon: textures/items/phantom_membrane
	* Build a phantom farm

	prismarine_farm
	require: monument
	title: Guardian Farm
	icon: textures/items/prismarine_shard
	* Find the ocean monument and build a guardian farm

	moss_farm
	require: lush_cave
	title: Better Than Dirt
	icon: -20971520
	* Build an automatic moss farm

	rabbit_farm
	require: (micro_farm & desert)
	title: Hop On
	icon: textures/items/rabbit_raw
	* Find some rabbits and build a rabbit breeder

	wither_rose_farm
	require: wither_farm
	title: It Grows on Weathering Victims
	icon: textures/blocks/flower_wither_rose

	wither_farm
	require: coal_farm
	title: Easy Nether Stars
	icon: textures/ui/items/nether_star
	* Build a wither cage and farm for nether stars

	sculk_farm
	require: (deep_dark & silk_touch & enderman_farm)
	title: Solid Xp
	icon: -30015488
	* Build a sculk block farm

	tree_farm
	require: (witch_farm & honey_farm & slime_farm)
	title: Log In
	icon: 1114112
	* Build a tree farm for oak, birch and jungle

	deepslate
	require: (sculk_farm & lava_farm)
	title: Purified!
	icon: ${aux * -378}
	* Build a machine that converts sculk into deepslate

	dark_oak_farm
	require: tree_farm
	title: The Motherlode of Engineering
	icon: -37486592
	* Build an redstone powered dark oak tree farm

	gravel_farm
	require: monster_spawner
	title: Rubble
	icon: 851968
	* Build a zombie gravel farm out of a monster spawner or trial spawners

	copper_farm
	require: monster_spawner
	title: Trial Copper
	icon: textures/items/copper_ingot
	* Build farm for copper using trial spawners
	- craft 10 trial spawners
	- activate them with any mob
	- gather the items dropped by the spawners
	- collect 64 copper ingots

	sniffing_farm
	require: shipwreck
	title: Ancient Herbology
	icon: textures/items/torchflower_seeds
	* Build a torchflower seeds farm
	- craft a brush
	- excavate 2 sniffer eggs from the warm ocean ruins
	- hatch the sniffer eggs and leave them to grow
	- breed more sniffers with the torchflower seeds they produce
	- obtain 32 torchflower seeds and 32 pitcher pods

	pink_petals
	require: cherry
	title: Pretty in Pink
	icon: textures/items/pink_petals
	* Collect a stack of pink petals

	brushing_farm
	require: (trail_ruins & iron_farm)
	title: Lore Farm
	icon: textures/items/prize_pottery_sherd
	* Build an afk suspicious sand or gravel brushing machine
	- use a minecart track to cycle an akf player between all the suspicious blocks of a certian structure

	enderman_farm
	require: dragon
	title: The Ender Power
	icon: textures/items/ender_pearl
	* Build an enderman farm in the end dimension

	obsidian_farm
	require: dragon
	title: It's Hard
	icon: 3211264
	* Build an obsidian farm out of the obsidian platform in the end dimension

	nether_wood_farm
	require: (witch_farm & honey_farm & slime_farm & crimson & warped)
	title: nether_wood_farm
	icon: -14745600

	raw_ores
	require: axolotl
	title: Metal Degradation
	icon: textures/items/raw_copper
	* Build a machine to convert ingots into raw ores using axolotls

	turtle_scute
	require: turtle_farm
	title: scutes_farm
	icon: textures/items/turtle_shell_piece
	* Build an automatic turtle scutes farm

	silverfish_farm
	require: brewing
	title: silverfish_farm
	icon: 6422530
	* Build a silverfish farm using the infestation potion

	copper_oxidizer
	require: copper_farm
	title: Rusting for Ages
	icon: -22478848
	* Dedicate an area to oxidize copper

	clay_farm
	require: dripstone_farm
	title: clay_farm
	icon: 5373952
	* Build a machine that converts dirt to mud and mud to clay

	shulker_farm
	require: shulkers
	title: shulker_farm
	icon: textures/items/shulker_shell

	chorus_farm
	require: the_end
	title: Native End Vegetation
	icon: textures/items/chorus_fruit
	* Build a chorus fruit farm

	elytra_farm
	require: elytra
	title: Because I Can!
	icon: textures/items/elytra
	* Design and build an elytra farm

	zombie
	require: bridge
	title: Zombie Slayer
	icon: textures/items/rotten_flesh
	* Kill 10 zombies

	milk
	require: cow_farm
	title: Drink Your Milk Kids
	icon: textures/items/bucket_milk
	* Milk a cow for a milk bucket
	- grab a bucket and milk a cow
	- drink that milk bucket

	wool
	require: (fishing_farm & iron)
	title: Rainbow Wool?
	icon: textures/items/shears
	* Name a sheep jeb_ and shear it
	- get a name tag from fishing
	- rename the name tag "jeb_" in an anvil
	- use the name tag on a sheep
	- shear the sheep and find out what color of wool it gives

	mooshroom
	require: mushroom_island
	title: Boom!
	icon: textures/blocks/mushroom_red
	* Find a Mooshroom and shear its mushrooms
	- find a mooshroom in the mushroom island
	- craft a pair of shears
	- shear the mushrooms off of the mooshroom

	when_pigs_fly?
	require: fishing_farm
	title: Pigs Never Fly!
	icon: textures/items/carrot_on_a_stick
	* Ride a pig to the void
	- equip a pig with a saddle
	- craft a carrot on a stick
	- ride the pig right off the edge of the island
	(please put any stuff you care about in a chest before you do that)

	horse
	require: fishing_farm
	title: Five Jumper
	icon: textures/items/saddle
	* Tame a horse who can jump 5 blocks high
	- find a horse in the plains or the sunflower plains biome
	- tame the horse and equip it with a saddle
	- jump over 5 blocks tall pillar
	(If the horse didn't make it, you got to find a better horse)

	donkey
	require: fishing_farm
	title: Heavy Loads
	icon: 3538944
	* Put a chest on a donkey and fill it up completely with items
	- find a donkey in a the plains or the meadow biome
	- tame the donkey and equip it with a chest
	- fill up every slot of the donkey's inventory with any item

	enderman
	require: mob_trap
	title: Give That Back
	icon: 131072
	* Kill an enderman with a block in his hands
	- find an enderman which stolen a block from your island
	- kill the enderman and place that block back

	endermite
	require: cleric
	title: I Have a Mite Problem
	icon: textures/items/ender_pearl
	* Spawn 3 endermites and let them chase you
	- collect many ender pearls
	- keep throwing ender pearls until you have 3 ender mites
	- release all 3 endermites at the same time
	- keep running away from them for 1 minute

	evoker
	require: woodland_mansion
	title: The Illagers Stash
	icon: textures/items/vex_armor_trim_smithing_template
	reward: summon vex ~~3~; A Vex
	* Find the hidden chest in the woodland mansion

	skeleton
	require: mob_trap
	title: I Am the Real Archer
	icon: textures/items/bow_standby
	* Shoot a skeleton with bow and arrows
	- craft a bow or get one from killing skeletons
	- get some arrows
	- kill a skeleton with bow and arrows

	soul_torch
	require: soulsand_valley
	title: What Did They See?
	icon: textures/blocks/soul_torch
	* Craft and place some soul torches to scare piglins
	- obtain soul sand or soul soil
	- craft some soul torches
	- place it down in front of a piglin and watch them run away

	firewall
	require: blaze_rod
	title: Firewall
	icon: textures/ui/items/shield
	* Use a shield to block a blaze fireball
	- craft a shield
	- go to the nether fortress
	- block a fireball which a blaze shot with your shield

	netherite
	require: bartering_farm
	title: Netherite!
	icon: textures/items/netherite_scrap
	* Obtain some netherite scraps from bartering with piglins
	- get a stack of gold ingots
	- throw your stack of gold to piglins for bartering
	- get 4 netherite scraps from the piglins
	- craft a netherite ingot

	brute
	require: crimson
	title: You Are Welcome
	icon: textures/items/apple_golden
	* Get a piglin down to half a heart and feed them a golden apple
	- craft a golden apple
	- damage a piglin until they are one hit away from dying
	- heal the piglin with a golden apple
	(You can use poison potions to get a piglin down to exactly 1 health point)
	(Piglins do not accept your golden apple for 20 seconds if you are the one who damaged them)

	froglight
	require: basalt_deltas
	title: Time for a Snack
	icon: -30867456
	* Slice a large magma cube for frogs to eat
	- bring some frogs to the nether or a large magma cube to the overworld
	- get the frogs and the magma cube to the same area
	- kill the magma cube to split into the medium size and the medium size to the small size
	- watch your frogs swallow the magma cubes until there is nothing left

	hoglin
	require: crimson
	title: Hostile Family
	icon: textures/blocks/crimson_fungus
	* Breed two hoglins together using crimson fungi
	- find 2 hoglins in the crimson forest
	- trap them in an enclosure
	- get yourself some crimson fungi
	- breed the two hoglins together

	ghast
	require: soulsand_valley
	title: Was a Blast
	icon: textures/items/fireball
	* Send a ghast back to the overworld and trap them in a blast chamber
	- build a large nether portal in a soul sand valley
	- build a cage for the ghast on the other side of the portal
	- get a ghast to spawn near the portal
	- name tag the ghast and send it to the overworld via a minecart
	- use the ghast to blow up concrete or wood
	(Make sure to have glass blocks at the eye level of the ghast so they can't shoot fireballs)

	strider_in_rain
	require: (fishing_farm & basalt_deltas)
	title: It Tickles
	icon: textures/items/warped_fungus_on_a_stick
	* Ride a strider 10 blocks in the overworld while it's raining
	- place lava in the nether for striders to spawn
	- craft a warped fungus on a stick and place a saddle on the strider
	- ride the strider to the overworld
	- wait for it to rain
	- ride the strider a distance of 10 blocks under the rain
	(Water damages striders by the way)

	cat_gift
	require: villagers
	title: Meowrning
	icon: textures/items/chicken_raw
	* Sleep with a cat and claim its gift in the morning
	- tame a cat
	- sleep in a bed with the cat
	- pick up whatever the cat brought you in the morning

	iron_golem
	require: iron
	title: Let's Get You Fixed
	icon: textures/blocks/flower_rose
	* Use iron ingots to repair an iron golem
	(It can be your iron golem or a village iron golem)

	butcher
	require: villagers
	title: Animal Hunter
	icon: textures/items/beef_raw
	* Sell a stack of beef or mutton to a butcher villager
	- employ a butcher villager
	- level up the butcher to become a Journeyman
	- sell the them 60 raw beef or 70 raw mutton

	wandering_trader
	require: villagers
	title: Sold Out!
	icon: textures/items/bucket_pufferfish
	* Buy every item a wandering trader has in stock

	bee_sting
	require: honeycomb_farm
	title: Angry Swarm
	icon: textures/items/honey_bottle
	* Get a bee to sting you and survive
	- grow up saplings next to flowers until you find a bee nest
	- stand close to the nest and break it with your bare hands
	- get stung by the bees
	- try to survive the poison effect
	(But the bees won't)

	fox
	require: sweet_berry
	title: My Mischievous Friend
	icon: textures/items/sweet_berries
	* Breed two foxes to gain the trust of the baby fox
	- find two foxes in a taiga biome
	- breed them with sweet berries
	- take the baby fox away with a lead
	(The baby fox will try to follow its parents but once it is away from them, it won't be afraid from you)

	ocelot
	require: (fishing_farm & jungle)
	title: Leopardus Pardalis
	icon: textures/items/fish_raw
	* Gain the trust of an ocelot by feeding it raw fish
	- Get some raw fish
	- Find an ocelot in the jungle biome
	- go near the ocelot and let it slowly approach you
	- feed the ocelot raw fish until it starts to trust you
	- take it back to your island with a lead

	llama
	require: (savanna)
	title: Dressed Up Llama
	icon: -39256064
	* Equip a llama with a carpet and a chest
	- find a llama in the windswept hills or savanna biome
	- tame the llama and put it on a leash
	- place different colors of carpet on the llama and decide which design you like
	- equip the llama with a chest
	(Wandering llamas are not allowed)

	goat
	require: biome_detector
	title: The GOAT
	icon: textures/items/goat_horn
	* Find goats in a mountain biome
	- use the structures map to find the snowy slopes, or the jagged peaks biome
	- build a platform of stone in that biome
	- wait for some goats spawn there

	polar_bear
	require: stray_farm
	title: Give the Bear a Hug
	icon: textures/items/snowball
	* Find Polar bears in the snowy plains biome
	- place ice or grass blocks in the snowy plains biome
	- come back later to find a polar bear on the platform

	snow_golem
	require: (pumpkin_farm & snow_farm)
	title: Face Reveal
	icon: -10158080
	* Remove the pumpkin of a snow golem using shears
	- summon a snow golem
	- craft some shears
	- take off the pumpkin head of the snow golem

	ninja_turtles
	require: (sand_farm & turtle_farm & silk_touch)
	title: Mutant Baby Ninja Turtles
	icon: textures/items/turtle_egg
	* Place a turtle egg on red, orange, blue, and purple concrete powder
	- craft blue concrete powder
	- craft red concrete powder
	- craft orange concrete powder
	- craft purple concrete powder
	- collect 4 turtle eggs using silk touch
	- place down a concrete powder of each color and place a turtle egg on each one of them

	washed_up
	require: (desert & water)
	title: Washed Up
	icon: 1572867
	* Drown a husk into a zombie then into a drowned
	- find and trap a husk in the desert biome
	- pour water on the husk
	- wait for it to convert into a zombie
	- wait for the zombie to convert into a drowned

	stray
	require: powder_snow
	title: Send Shivers Down Your Spine
	icon: 11403264
	* Place a skeleton in powder snow until it becomes a stray

	baby_slime
	require: (iron & slime_farm)
	title: Harmless
	icon: textures/items/slimeball
	* Use a name tag on a small slime

	ravager
	require: raid_farm
	title: Beast Relocation
	icon: textures/items/minecart_normal
	* Kidnap a ravager from a raid

	zoglin
	require: (raid_farm & crimson)
	title: Aggressive Battle
	icon: textures/items/iron_axe
	* Watch a battle between a Johnny vindicator and a zoglin

	summoner
	require: (raid_farm & iron_farm)
	title: There Is Room for One Summoner
	icon: textures/items/totem
	* Summon an iron golem to kill an evoker

	no_sleep
	require: dragon
	title: Sleep Deprivation
	icon: textures/items/bed_red
	* Spend 10 minecraft days without sleep

	undead_knight
	require: (zombie & horse)
	title: Undead Knight
	icon: textures/ui/items/head_zombie
	* Let a baby zombie ride a zombie horse
	- Enable Zombie Horses addon
	- Find a wild horse and don't tame it
	- Let zombies convert it into a zombie horse
	- Find a baby zombie able to ride mobs
	- Let the baby zombie ride the zombie horse

	squid
	require: ocean
	title: Ink in My Eyes
	icon: textures/items/dye_powder_black
	* Jump in water with a squid and punch it

	dolphin
	require: ocean
	title: Playing With Dolphins
	icon: textures/ui/water_breathing_effect
	* Feed raw cod to a dolphin and swim with it

	spear
	require: ocean
	title: Spearfishing
	icon: textures/items/trident
	* Throw a trident on a cod or a salmon

	tropical_fish
	require: (iron & ocean)
	title: Aquarium
	icon: textures/items/bucket_tropical
	* Pick up 10 different tropical fish of the following types in a bucket
	- pick up only 10 of them:§
	- Anemone
	- Black Tang
	- Blue Dory
	- Butterfly Fish
	- Cichlid
	- Clownfish
	- Cotton Candy Betta
	- Dottyback
	- Emperor Red Snapper
	- Goatfish
	- Moorish Idol
	- Ornate Butterfly
	- Parrotfish
	- Queen Angel Fish
	- Red Cichlid
	- Red Lipped Blenny
	- Red Snapper
	- Threadfin
	- Tomato Clown
	- Triggerfish
	- Yellowtail Parrotfish
	- Yellow Tang

	axolotl
	require: lush_cave
	title: Amphibian Healers
	icon: textures/items/bucket_axolotl
	* Gain the regeneration effect from an axolotl

	elder_guardian
	require: monument
	title: Electrocuted!
	icon: textures/ui/items/enchanted_trident
	* Throw a channeling trident on a guardian in a thunder storm

	tide
	require: elder_guardian
	title: Sea Waves
	icon: textures/items/tide_armor_trim_smithing_template
	* Obtain Tide armor trim from killing elder guardians

	charged_creeper
	require: drowned_farm
	title: Shockwave
	icon: textures/ui/items/head_creeper
	* Ignite a charged creeper with a flint and steel

	skeleton_horse
	require: horse
	title: Underwater Horseback Riding
	icon: textures/items/bucket_water
	Ride a skeleton horse 30 blocks underwater

	allay
	require: (geode & evoker)
	title: Exponential Growth
	icon: textures/items/cookie
	* Rescue an allay from the woodland mansion and duplicate it into 16 allays

	leader
	require: (desert | savanna)
	title: In the Lead
	icon: textures/items/lead
	* Ride a camel with another player or make 5 llamas walk in a line by leashing one of them

	camel
	require: desert
	title: Leap of Fate
	icon: textures/items/potion_bottle_splash_moveSpeed
	* Cross an 8 block gap over the void on a camel

	monster_spawner
	require: trial_chambers
	title: Dungeon Master
	icon: 3407872
	* Obtain a monster spawner and 50 levels and activate it

	moving_shulkers
	require: shulker_farm
	title: Inboxed!
	icon: textures/items/shulker_shell
	* Pick up a shulker in a boat or a minecart

	respawn_dragon
	require: (dragon & soulsand_valley)
	title: Here We Go Again
	icon: textures/items/end_crystal
	* Craft 4 end crystals and summon the ender dragon
*/}