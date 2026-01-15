import { system, world } from "@minecraft/server"
import { ModalFormData } from "@minecraft/server-ui"
import { open_world_map } from "../world/maps"
import { load_dynamic_object, save_dynamic_object } from "../utilities"

const default_name = 'Waypoint'
const map_markers = {
	colored: new Set(['marker', 'banner', 'circle']),
	block_styles: ['full', 'center', 'corners'],
	paths: {
		marker: 'textures/ui/map/markers/marker_',
		banner: 'textures/ui/map/markers/banner_',
		circle: 'textures/ui/map/markers/circle_',
		structure: 'textures/ui/map/structures/',
		item: 'textures/items/',
		block: 'textures/blocks/',
		mob: 'textures/ui/map/mobs/',
	},
	colors: [
		'white', 'light_gray', 'gray', 'black', 'brown', 'red', 'orange', 'yellow',
		'lime', 'green', 'cyan', 'light_blue', 'blue', 'purple', 'magenta', 'pink',
	],
	mobs: [
		'chicken', 'cow', 'pig', 'sheep', 'camel', 'donkey', 'horse', 'mule',
		'cat', 'parrot', 'wolf', 'armadillo', 'bat', 'bee', 'fox', 'goat',
		'llama', 'ocelot', 'panda', 'polar_bear', 'rabbit', 'axolotl', 'cod', 'dolphin',
		'frog', 'glow_squid', 'nautilus', 'pufferfish', 'salmon', 'squid', 'tadpole', 'tropicalfish',
		'turtle', 'allay', 'mooshroom', 'sniffer', 'copper_golem', 'iron_golem', 'snow_golem',
		'villager', 'wandering_trader', 'bogged', 'camel_husk', 'drowned', 'husk', 'parched', 'skeleton',
		'skeleton_horse', 'stray', 'zombie', 'zombie_horse', 'zombie_nautilus', 'zombie_villager', 'cave_spider', 'spider',
		'breeze', 'creaking', 'creeper', 'elder_guardian', 'guardian', 'phantom', 'silverfish', 'slime',
		'warden', 'witch', 'illager', 'ravager', 'vex', 'blaze',
		'ghast', 'happy_ghast', 'hoglin', 'magma_cube', 'piglin_brute', 'piglin', 'strider', 'wither_skeleton',
		'wither', 'zoglin', 'zombie_pigman', 'enderman', 'endermite', 'shulker', 'end_phantom', 'ender_dragon',
	],
	structures: [
		'village_plains', 'village_savanna', 'village_snowy', 'village_taiga', 'village_desert', 'swamp_hut', 'jungle_temple', 'trial_chambers',
		'ancient_city', 'bastion_remnants', 'desert_pyramid', 'end_gateway', 'igloo', 'mineshaft', 'nether_fortress', 'ocean_monument',
		'pillager_outpost', 'ruined_portal', 'shipwreck', 'trail_ruins', 'woodland_mansion', 'x_mark'
	]
}
const marker_types = Object.keys(map_markers.paths)

export default function(player, item) {
	system.run(() => {
		if (player.is_confuguring_map) return
		// const strings = encode_chunks(player)
		// new ModalFormData().textField('', '', {defaultValue: JSON.stringify(strings)}).show(player)
		// item.setDynamicProperty('map', encoded_map_data)
		// player.getComponent('equippable').setEquipment('Mainhand', item)
		// console.log(item.getDynamicPropertyTotalByteCount())
		open_world_map(player, item)
	})
}

const vanilla_dimensions = new Map()
system.run(() => ['overworld', 'nether', 'the_end'].forEach(id => vanilla_dimensions.set('minecraft:' + id, world.getDimension(id))))
export function update_waypoints(player, item, changed) {
	const waypoints = Object.fromEntries(Object.entries(load_dynamic_object(item, 'waypoints')).filter(([hash, waypoint]) => {
		const [x, y, z, d] = hash.split(' ')
		const dimension = vanilla_dimensions.get(d) ?? world.getDimension(d)
		const location = {x: +x, y: +y, z: +z}
		if (!dimension.isChunkLoaded(location)) return true
		const block = dimension.getBlock(location)
		if (block.typeId == 'minecraft:lodestone') return true
		player.sendMessage(`§pRemoved "${waypoint.name}" for not having a lodestone`)
		changed = true
	}))
	if (changed) {
		save_dynamic_object(item, 'waypoints', waypoints)
		player.getComponent('equippable').setEquipment('Mainhand', item)
	}
	return [waypoints, changed]
}

function encode_chunks({dimension, location}) {
	const strings = []
	const [x, z] = [Math.floor(location.x / 16), Math.floor(location.z / 16)]
	for (let j = -1; j < 3; j++) for (let i = -1; i < 3; i++) {
		const chunk_blocks = scan_chunk(dimension, {x: x + i, z: z + j})
		const map_colors = read_colors(chunk_blocks)
		strings.push(encode_chunk(map_colors))
	}; return strings
}

function scan_chunk(dimension, chunk) {
	const blocks = []
	const [x, y, z] = [chunk.x * 16, dimension.heightRange.max - 1, chunk.z * 16]
	const options = { includeLiquidBlocks: true, includePassableBlocks: true }
	for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
		const block = dimension.getBlockBelow( { x: x + i, y, z: z + j }, options)
		blocks.push(block)
	}
	return blocks
}

function read_colors(blocks) {
	const [r_levels, g_levels, b_levels, grayscale] = [9, 12, 8, 64]
	const r_g_levels = r_levels * g_levels
	const all_levels = r_g_levels * b_levels
	return blocks.map(block => {
		if (!block) return 1023  // no block
		const {dimension, location} = block 
		if (!dimension.isChunkLoaded(location)) return 1023 // not loaded
		let color_component = block.getComponent("minecraft:map_color")
		// run until you get a color or reach the bottom
		while (!color_component && block.y != dimension.heightRange.min) {
			block = block.below()
			color_component = block.getComponent("minecraft:map_color")
		}
		if (!color_component) return 1023 // no color
		const {red, green, blue} = color_component.tintedColor
		if (red == green && green == blue) { // if grayscale
			return all_levels + Math.round((red) * (grayscale - 1))
		} else { // if has colors
			const b = Math.round(blue * (b_levels - 1))
			const r = Math.round(red * (r_levels - 1))
			const g = Math.round(green * (g_levels - 1))
			return b * r_g_levels + r * g_levels + g
		}	
	})
}

function encode_chunk(pixels) {
	const frequency = {}
	for (const pixel of pixels) frequency[pixel] = (frequency[pixel] || 0) + 1 // get all the unique colors
	const colors = Object.keys(frequency).map(Number).sort((a, b) => frequency[b] - frequency[a]) // sort them by frequency
	const palette_size = colors.length  // how many unique colors
	const size_string = encode_number(palette_size)  // encode the number
	const palette_string = colors.map(color => encode_number(color)).join('') // encode the palette
	if (palette_size == 1) return size_string + palette_string // for solid color
	const indexed = pixels.map(pixel => colors.indexOf(pixel)) // reduce the map pixels
	const pattern_bytes = bit_pack(indexed, palette_size) // encode into bytes
	const pattern_string = bytes_to_base64(pattern_bytes) // encode into a base64 string
	const leading_zeros = encode_number(pattern_string.length - pattern_string.replace(/^0+/, '').length) // encode the number of leading 
	const trimmed_pattern = pattern_string.replace(/^0+/, '').replace(/0+$/, '') // trim the leading and lagging zeros
	return size_string + palette_string + leading_zeros + trimmed_pattern // combine all data together
}

const base64_chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/"
const encode_number = (n) => base64_chars[(n >> 6) & 63] + base64_chars[n & 63]

function bit_pack(indexes, size) {
	const depth = Math.ceil(Math.log2(size)) || 1 // determine the number of bits for each number
	const total_bits = indexes.length * depth // number of numbers * bits per number
	const bytes = new Uint8Array(Math.ceil(total_bits / 8)) // devide total bits by 8 and ceil
	let bit_part = 0
	for (let n of indexes) for (let i = 0; i < depth; i++) {
		// this is black magic.
		if ((n >> i) & 1) bytes[Math.floor(bit_part / 8)] |= (1 << (bit_part % 8))
		bit_part++
	}
	return bytes
}

function bytes_to_base64(bytes) {
    const length = bytes.length; const string = []
    for (let i = 0; i < length; i += 3) {
		const bit0 = bytes[i]; const bit1 = i + 1 < length ? bytes[i + 1] : 0
		const bit2 = i + 2 < length ? bytes[i + 2] : 0
		const idx0 = bit0 >> 2; const idx1 = ((bit0 & 3) << 4) | (bit1 >> 4)
		const idx2 = ((bit1 & 15) << 2) | (bit2 >> 6); const idx3 = bit2 & 63
        string.push(base64_chars[idx0] + base64_chars[idx1])
        if (i + 1 >= length) continue
		string.push(base64_chars[idx2] + base64_chars[idx3])
    }; return string.join('')
}

export function manage_waypoint(player, block, item) {
	player.is_confuguring_map = true; system.runTimeout(() => delete player.is_confuguring_map, 2)
	const {x, y, z, dimension:{id:d}} = block
	const hash = `${x} ${y} ${z} ${d}`
	const [waypoints, changed] = update_waypoints(player, item)
	const exists = hash in waypoints
	const deafults = exists ? waypoints[hash].deafults ?? [] : []
	const mode = exists ? 'modify' : 'add'
	
	system.runTimeout(() => {
		new ModalFormData()
		.title({ rawtext: [{ text: '§waypoint_ui§' }, { translate: `maps.waypoints.${mode}` }] })
		/*0*/.textField('Name:', default_name, { defaultValue: deafults[0] ?? default_name})
		/*1*/.dropdown('Icon: ', marker_types, { defaultValueIndex: deafults[1]})
		/*2*/.dropdown('Color: ', map_markers.colors, { defaultValueIndex: deafults[2]})
		/*3*/.dropdown('Structure: ', map_markers.structures, { defaultValueIndex: deafults[3]})
		/*4*/.textField('Texture: ', { translate: 'maps.waypoints.item.placeholder'}, { defaultValue: deafults[4], tooltip: { translate: 'maps.waypoints.item.tooltip'}})
		/*5*/.textField('Texture: ', { translate: 'maps.waypoints.block.placeholder'}, { defaultValue: deafults[5], tooltip: { translate: 'maps.waypoints.block.tooltip'}})
		/*6*/.dropdown('Style: ', map_markers.block_styles, { defaultValueIndex: deafults[6]})
		/*7*/.textField('Top Texture: ', { translate: 'maps.waypoints.top.placeholder'}, { defaultValue: deafults[7]})
		/*8*/.dropdown('Mob: ', map_markers.mobs, { defaultValueIndex: deafults[8]})
		.submitButton({ translate: `maps.waypoints.${mode}` })
		.show(player).then(({ formValues, canceled }) => {
			if (canceled) return
			if (block.typeId != 'minecraft:lodestone') return
			
			const [name, icon_type, color, stuc_index, item_texture, block_texture, style_index, top_texture, mob_index] = formValues
			const type = marker_types[icon_type]
			const texture = (() => {
				if (map_markers.colored.has(type)) return map_markers.colors[color]
				return {
					structure: map_markers.structures[stuc_index],
					mob: map_markers.mobs[mob_index],
					item: item_texture,
					block: block_texture,
				}[type]
			})()
			const icon = `${map_markers.paths[type]}${texture}`
			waypoints[hash] = {name:name ?? default_name, icon, deafults: formValues}
			save_dynamic_object(item, 'waypoints', waypoints)
			player.getComponent('equippable').setEquipment('Mainhand', item)
			// system.run(() => console.log(formValues))
			// system.run(() => console.log(player.getComponent('equippable').getEquipment('Mainhand').getDynamicProperty('waypoints')))
		})
	}, changed ? 40 : 0)
}
