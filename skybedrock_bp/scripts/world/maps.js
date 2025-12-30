import { world } from "@minecraft/server" 
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { bookmark, open_book } from "../items/guidebook"
import treasure_map, { get_cardinal_direction } from "../items/treasure_map"
import { chorus_islands, end_cities, pillar_locations } from "./the_end"
import { check_block } from "../achievements"
import { nether_structures, overworld_structures, biome_names} from "../data"
import world_map, { manage_waypoint } from "../items/world_map"

export const locating_players = new Map()

const overworld_biomes = [
    { biome: biome_names.plains, offset: [6, 6], size: [4, 4] },
    { biome: biome_names.mangrove_swamp, offset: [10, 7], size: [2, 2] },
    { biome: biome_names.cold_taiga, offset: [7, 4], size: [2, 2] },
    { biome: biome_names.desert, offset: [7, 10], size: [2, 2] },
    { biome: biome_names.jungle, offset: [4, 7], size: [2, 2] },

    { biome: biome_names.birch_forest, offset: [4, 4], size: [2, 2] },
    { biome: biome_names.roofed_forest, offset: [10, 4], size: [2, 2] },
    { biome: biome_names.savanna, offset: [10, 10], size: [2, 2] },
    { biome: biome_names.mushroom_island, offset: [4, 10], size: [2, 2] },

    { biome: biome_names.pale_garden, offset: [7, 1], size: [2, 2] },
    { biome: biome_names.warm_ocean, offset: [13, 7], size: [2, 2] },
    { biome: biome_names.mesa, offset: [7, 13], size: [2, 2] },
    { biome: biome_names.cherry_grove, offset: [1, 7], size: [2, 2] },

    { biome: biome_names.snowy_slopes, offset: [5, 2], size: [2, 2] },
    { biome: biome_names.grove, offset: [12, 5], size: [2, 2] },
    { biome: biome_names.mesa_plateau_stone, offset: [9, 12], size: [2, 2] },
    { biome: biome_names.meadow, offset: [2, 9], size: [2, 2] },

    { biome: biome_names.ice_plains, offset: [7, 3], size: [2, 1] },
    { biome: biome_names.ocean, offset: [12, 7], size: [1, 2] },
    { biome: biome_names.deep_ocean, offset: [7, 12], size: [2, 1] },
    { biome: biome_names.flower_forest, offset: [3, 7], size: [1, 2] },

    { biome: biome_names.forest, offset: [6, 4], size: [1, 2] },
    { biome: biome_names.taiga, offset: [9, 4], size: [1, 2] },
    { biome: biome_names.river, offset: [10, 6], size: [2, 1] },
    { biome: biome_names.swampland, offset: [10, 9], size: [2, 1] },
    { biome: biome_names.beach, offset: [9, 10], size: [1, 2] },
    { biome: biome_names.cold_ocean, offset: [6, 10], size: [1, 2] },
    { biome: biome_names.bamboo_jungle, offset: [4, 9], size: [2, 1] },
    { biome: biome_names.jungle_edge, offset: [4, 6], size: [2, 1] },

    {
        surface: biome_names.extreme_hills,
        cave: biome_names.dripstone_caves,
        offset: [9, 2], size: [2, 2]
    },
    {
        surface: biome_names.stony_peaks,
        cave: biome_names.deep_dark,
        offset: [12, 9], size: [2, 2]
    },
    { biome: biome_names.jagged_peaks, offset: [5, 12], size: [2, 2] },
    {
        surface: biome_names.sunflower_plains,
        cave: biome_names.lush_caves,
        offset: [2, 5], size: [2, 2]
    },

    { biome: biome_names.stone_beach, offset: [3, 2], size: [2, 2] },
    { biome: biome_names.stone_beach, offset: [2, 3], size: [2, 2] },
    { biome: biome_names.ice_plains_spikes, offset: [11, 2], size: [2, 2] },
    { biome: biome_names.ice_plains_spikes, offset: [12, 3], size: [2, 2] },
    { biome: biome_names.extreme_hills_mutated, offset: [12, 11], size: [2, 2] },
    { biome: biome_names.extreme_hills_mutated, offset: [11, 12], size: [2, 2] },
    { biome: biome_names.frozen_ocean, offset: [2, 11], size: [2, 2] },
    { biome: biome_names.frozen_ocean, offset: [3, 12], size: [2, 2] },
]

const nether_biomes = [
    { biome: biome_names.hell, offset: [6, 6], size: [4, 4] },
    { biome: biome_names.crimson_forest, offset: [10, 7], size: [2, 2] },
    { biome: biome_names.soulsand_valley, offset: [7, 4], size: [2, 2] },
    { biome: biome_names.basalt_deltas, offset: [7, 10], size: [2, 2] },
    { biome: biome_names.warped_forest, offset: [4, 7], size: [2, 2] },

    { biome: biome_names.hell, offset: [3, 3], size: [4, 4] },
    { biome: biome_names.hell, offset: [3, 9], size: [4, 4] },
    { biome: biome_names.hell, offset: [9, 3], size: [4, 4] },
    { biome: biome_names.hell, offset: [9, 9], size: [4, 4] },
]

export function see_maps(player) {
    const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')
	const maps = [
		["§2Overworld Biomes", 'overworld_biomes'],
		["§cNether Biomes", 'nether_biomes'],
		["§pOverworld Structures", 'overworld_structures']
	]
    if (completed_achs.includes('nether') || player.getGameMode() == "Creative") maps.push(["§mNether Structures", 'nether_structures'])
	maps.push(["§5The End Map", 'the_end_map'])

	const form = new ActionFormData()
    .title('§book_ui§' + "Skybedrock Maps")
    .button({rawtext: [{text: '§bookmark§'}, {translate: `guidebook.set_bookmark`}]})
    .button("Back")
	maps.forEach(map => form.button('§section ' + map[0]))
	form.show(player)
    .then(({ selection, canceled }) => {
        if (canceled) return
        else if (selection == 0) bookmark(player, "World Maps")
        else if (selection == 1) open_book(player)
        else see_a_map(player, maps[selection - 2][1])
    })
}

export function see_a_map(player, map) {
    const x = Math.min(Math.max(Math.round(player.location.x / 2) + 128, 0), 256)
    const z = Math.min(Math.max(Math.round(player.location.z / 2) + 128, 0), 256)
    if (['overworld_biomes', 'nether_biomes'].includes(map)) {
        const data = {
            overworld_biomes: {
                title: 'Overworld Biomes',
                background: 'textures/ui/maps/plains_map_background',
                foreground: 'textures/ui/maps/overworld_biomes',
                in_dimension: player.dimension.id == 'minecraft:overworld',
                biomes: overworld_biomes
            },
            nether_biomes: {
                title: 'Nether Biomes',
                background: 'textures/ui/maps/nether_map_background',
                foreground: 'textures/ui/maps/nether_biomes',
                in_dimension: player.dimension.id == 'minecraft:nether',
                biomes: nether_biomes
            }
        }[map]
        const form = new ActionFormData().title('§map_ui§' + data.title)
        .button('home').button('back').button('bookmark')
        .button('').button('').button('').button('').button('').button('').button('')

        .header(data.background)
        .header(data.foreground)
		.header('') // Chunk Borders

        .label(data.in_dimension ? `X${x}Z${z}D${get_cardinal_direction(player)}` : '')
        
        data.biomes.forEach(({ biome, surface, cave, offset, size }) => {
            form.button(`§area§ x${
                offset[0]}y${offset[1]}l${size[0]}w${size[1]}${
                surface ? 'Surface Biome: ' + surface + '\n§rCave Biome: ' + cave : 'Biome: ' + biome}\n§rx: ${
                (offset[0] - 8) * 32} §v->§r ${(offset[0] + size[0] - 8) * 32}\nz: ${
                (offset[1] - 8) * 32} §v->§r ${(offset[1] + size[1] - 8) * 32
            }`)
        })
        form.show(player)
        .then(({ selection, canceled }) => {
            if (canceled) return
            switch (selection) {
                case 0: open_book(player); break
                case 1: see_maps(player); break
                case 2: bookmark(player, data.title); break
            }
        })
    }
    if (['overworld_structures', 'nether_structures'].includes(map)) {
        const data = {
            overworld_structures: {
                map_size: 1000,
                title: 'Overworld Structures',
                in_dimension: player.dimension.id == 'minecraft:overworld',
                structures: overworld_structures,
            },
            nether_structures: {
                map_size: 300,
                title: 'Nether Structures',
                in_dimension: player.dimension.id == 'minecraft:nether',
                structures: nether_structures,
            }
        }[map]
        const pin_to_map = (axis) => Math.min(Math.max(Math.round(axis * 128 / data.map_size * 0.75) + 128, 0), 256)
        const place = ({x, z}) => `x${pin_to_map(x)}y${pin_to_map(z)}`
        const active = locating_players.has(player.id) ? 'on' : 'off'
        const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')
        const structures = data.structures.filter(({require}) => {
            return !require || completed_achs.includes(require) || player.getGameMode() == "Creative"
        })

        const form = new ActionFormData().title('§map_ui§' + data.title)
        .button('home').button('back').button('bookmark')
        .button(`switch_${active}`).button('').button('').button('').button('').button('').button('')

        .header('textures/map/map_background')
        .header('textures/none') //foreground
		.header('') // Chunk Borders

        .label(data.in_dimension ?
            `X${ pin_to_map(player.location.x)
            }Z${ pin_to_map(player.location.z)
            }D${get_cardinal_direction(player)
        }` : '')
        if (structures.length) {
            structures.forEach(({ id, x, z, icon, structure, structures, biome, biomes }) => {
                const hover_text = `${
                    structure ? `Structure: ${structure}` : `Structures:\n   ${structures?.join(',\n   ') ?? ''}`
                }${
                    biome ? `\nBiome: ${biome}` : biomes ? `\nBiomes:\n   ${biomes?.join(',\n   ') ?? ''}` : ''
                }\n§pClick to Locate`
                form.button(`§landmark§ ${place({x, z})}${hover_text}`, `textures/ui/map/${icon ?? id}`)
            })
        } else form.body({translate: 'guidebook.maps.no_structures'})
        form.show(player).then(({ selection, canceled }) => {
            if (canceled) return
            switch (selection) {
                case 0: open_book(player); break
                case 1: see_maps(player); break
                case 2: bookmark(player, data.title); break
                case 3: if (active == 'on') {
                    locating_players.delete(player.id)
                    if (!player.getDynamicProperty('biome_detector')) player.onScreenDisplay.setActionBar('§.')
                } see_a_map(player, map); break
            }
            if (selection > 9) locating_players.set(player.id, structures[selection - 10].id)
        })
    }
    else if (map == 'the_end_map') {
        const pin_to_map = (axis) => Math.min(Math.max(Math.round(axis * 128 / 120) + 128, 0), 256)
        const place = ({ x, z }) => `x${pin_to_map(x)}y${pin_to_map(z)}`
        const check_crystal = (location, fallback) => {
            const hits = world.getDimension("minecraft:the_end").getEntitiesFromRay(
                { ...location, y: 0 },
                { x: 0, y: 1, z: 0 },
                { type: "minecraft:ender_crystal", ignoreBlockCollision: true }
            )
            return hits ? hits.length > 0 : fallback
        }

        const exit = check_block(world.getDimension("minecraft:the_end"), { x: 0, y: 63, z: 1 }, "minecraft:end_portal", world.getDynamicProperty('exit_portal'))
        world.setDynamicProperty('exit_portal', exit)

        const end_pillars = JSON.parse(world.getDynamicProperty('end_pillars') ?? '[]')
        for (let i = 0; i < 10; i++) {
            end_pillars[i] = check_block(world.getDimension("minecraft:the_end"), { ...pillar_locations[i], y: 0 }, "minecraft:obsidian", end_pillars[i])
        }

        const end_crystals = JSON.parse(world.getDynamicProperty('end_crystals') ?? '[]')
        for (let i = 0; i < 10; i++) {
            end_crystals[i] = check_crystal({ ...pillar_locations[i] }, end_crystals[i])
        }
        world.setDynamicProperty('end_crystals', JSON.stringify(end_crystals))

        const form = new ActionFormData().title('§map_ui§' + "The End Map")
        .button('home').button('back').button('bookmark')
        .button('').button('').button('').button('').button('').button('').button('')

        .header('textures/ui/maps/end_map_background')
        .header('textures/ui/maps/main_end_island')
		.header('') // Chunk Borders
        
        .label(player.dimension.id == "minecraft:the_end" ? `X${pin_to_map(player.location.x)}Z${pin_to_map(player.location.z)}D${get_cardinal_direction(player)}` : '')
        
        .button(`§deco§ ${place({ x: 100, z: 0 })}The Obsidian Platform`, `textures/blocks/obsidian`)
        .button(`§deco§ ${place({ x: 0, z: 0 })}${exit ? 'Open' : 'Closed'} End Fountain`, `textures/ui/map/${exit ? 'open' : 'closed'}_end_fountain`)

        for (let i = 0; i < 10; i++) {
            if (end_pillars[i]) form.button(`§deco§ ${place(pillar_locations[i])}End Pillar`, 'textures/ui/map/end_pillar')
            else if (end_crystals[i]) form.button(`§deco§ ${place(pillar_locations[i])}End Crystal`, 'textures/items/end_crystal')
        }
    
        const open_gateways = JSON.parse(world.getDynamicProperty('open_gateways') ?? '[]')
        for (let i = 0; i < open_gateways.length; i++) {
            const count = `§.${i + 1}${(i == 0) ? 'st' : (i == 1) ? 'nd' : (i == 2) ? 'rd' : 'th'}`
            form.button(`§deco§ ${place(open_gateways[i])}${count} End Gateway${chorus_islands.get(i + 1) ? '\n  §uHas a Chorus Island' : ''}${end_cities.get(i + 1) ? '\n  §dHas an End City' : ''}${[2, 12].includes(i + 1) ? '\n  §9End Phantoms Spawn Here' : ''}`, `textures/ui/map/end_gateway`)
        }
        form.show(player)
        .then(({ selection, canceled }) => {
            if (canceled) return
            switch (selection) {
                case 0: open_book(player); break
                case 1: see_maps(player); break
                case 2: bookmark(player, 'The End Map'); break
            }
        })
    }
}

export function open_map(player, data) {
	const map_size = 128 // there are 256 valid locations to place a marker
	const fit = (a) => Math.max(-map_size, Math.min(map_size, a))
	const resize = (a) => Math.round(a * map_size / data.range)
	const align = data.align_player ? Math.floor : Number
	const player_place = {
		x: fit(resize(align(player.location.x) - data.center.x)) + map_size,
		z: fit(resize(align(player.location.z) - data.center.z)) + map_size,
	}

	const chunks_element = `x${map_size - (resize(data.center.x) % map_size)}z${map_size - (resize(data.center.z) % 128)}s${16 * 256**2 / data.range}`

	const markers = data.markers
	.filter((marker) => data.dim == marker.dim)  // the correct dimension
	.map(({x, z, text, texture, deco, tag}) => {
		tag = deco ? '§deco§' : '§landmark§'  // add a tag
		x = resize(x - data.center.x) + map_size // rezize the x
		z = resize(z - data.center.z) + map_size  // resize the z
		return { tag, x, z, text, texture }
	})
	.filter(({x, z}) => x >= 0 && x <= map_size * 2 && z >= 0 && z <= map_size * 2) // does it fit in the map
	.map(({x, z, text, texture, tag}) => ({text: `${tag} x${x}y${z}${text ?? ''}`, texture})) //configure for a button

	const form = new ActionFormData()
	form.title('§map_ui§' + (data.title ?? ''))  // Title
	for (let i = 0; i < 10; i++) form.button((data.buttons ? data.buttons : [])[i] ?? '')
	form.header(data.background ?? 'textures/map/map_background')  // Background
	form.header(data.foreground ?? 'textures/none') // Forground
	form.header(data.chunk_borders ? chunks_element : '') // Chunk Borders
	form.label(player.dimension.id == data.dim ? `X${player_place.x}Z${player_place.z}D${get_cardinal_direction(player)}` : '') // Player
	markers?.forEach(marker => form.button(marker.text, marker.texture))  // Markers
	// data.areas?.forEach(area => form.button(`§area§ ${area.text}`, area.texture))

	form.show(player).then(({ selection, canceled }) => {
		if (canceled || !data.action) return
		data.action(selection)
	})
}

function zoom_map(player, item) {
	const zoom_level = item.getDynamicProperty('zoom') ?? 128
	new ModalFormData()
	.title('World Map')
	.slider('Zoom Level §7( In Blocks )', 0, 1024, {defaultValue: zoom_level, valueStep: 16, tooltip: 'Set to 0 to Reset'})
	.show(player).then(({canceled, formValues}) => {
		if (canceled) return
		const zoom = formValues[0]
		if (zoom == 0) item.setDynamicProperty('zoom')
		else item.setDynamicProperty('zoom', zoom)
		const equippable = player.getComponent('equippable')
		if (equippable.getEquipment('Mainhand')?.typeId != 'skybedrock:world_map') return
		equippable.setEquipment('Mainhand', item)
		open_world_map(player, item)
	})
}

function toggle_chunks(player, item, chunk_borders) {
	const equippable = player.getComponent('equippable')
	if (equippable.getEquipment('Mainhand')?.typeId != 'skybedrock:world_map') return
	item.setDynamicProperty('chunk_borders', chunk_borders ? undefined : true)
	equippable.setEquipment('Mainhand', item)
	open_world_map(player, item)
}

export function open_world_map(player, item) {
	const zoom_level = item.getDynamicProperty('zoom') ?? 128
	const chunk_borders = item.getDynamicProperty('chunk_borders')
	open_map(player, {
		title: 'World Map',
		center: player.location,
		dim: player.dimension.id,
		range: zoom_level,
		chunk_borders,
		markers: [
			{deco: true, text: 'Spawn', texture: 'textures/ui/map/spawn', x: 0, z: 0, dim: 'minecraft:overworld'}
		],
		buttons: ['', '', 'zoom', 'chunks'],
		action: (selection) => {
			if (selection == 2) zoom_map(player, item)
			if (selection == 3) toggle_chunks(player, item, chunk_borders)
		}
	})
}
export default {
	onUse({source:player, itemStack:item}, {params}) {
		if (params.type == 'world_map') world_map(player, item)
		if (params.type == 'treasure_map') treasure_map(player, item)
	},
	onUseOn({source:player, block, itemStack:item}, {params}) {
		if (params.type == 'world_map') {
			if (block.typeId != 'minecraft:lodestone') return
			manage_waypoint(player, block, item, 'add')
		}
	}
}
