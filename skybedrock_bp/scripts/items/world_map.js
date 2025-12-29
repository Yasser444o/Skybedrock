import { ModalFormData } from "@minecraft/server-ui"
import { open_world_map } from "../world/maps"

export default function(player, item) {
	const block = player.getBlockFromViewDirection({maxDistance: 6})?.block
	if (block?.typeId == 'minecraft:lodestone') return
	// const strings = encode_chunks(player)
	// new ModalFormData().textField('', '', {defaultValue: JSON.stringify(strings)}).show(player)
	// item.setDynamicProperty('map', encoded_map_data)
	// player.getComponent('equippable').setEquipment('Mainhand', item)
	// console.log(item.getDynamicPropertyTotalByteCount())
	// open_world_map(player, item)
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

export function manage_waypoint(player, block, item, mode) {
	new ModalFormData()
	.title({ rawtext: [{ text: '§waypoint_ui§' }, { translate: `maps.waypoints.${mode}` }] })
	.textField('Name:', '', { defaultValue: 'Waypoint' })
	.dropdown('Icon: ', ['marker', 'banner', 'circle', 'structure', 'item', 'block', 'mob'])
	.dropdown('Color: ', [
		'white', 'light_gray', 'gray', 'black', 'brown', 'red', 'orange', 'yellow',
		'lime', 'green', 'cyan', 'light_blue', 'blue', 'purple', 'magenta', 'pink',
	])
	.dropdown('Structure: ', [
		'village_plains', 'village_savanna', 'village_snowy', 'village_taiga', 'village_desert', 'swamp_hut', 'jungle_temple', 'trial_chambers',
		'ancient_city', 'bastion_remnants', 'desert_pyramid', 'end_gateway', 'igloo', 'mineshaft', 'nether_fortress', 'ocean_monument',
		'pillager_outpost', 'ruined_portal', 'shipwreck', 'trail_ruins', 'woodland_mansion', 'x_mark'
	])
	.textField('Item: ', 'e.g. iron_ingot | reeds')
	.textField('Block: ', 'e.g. diamond_block | observer_front')
	.dropdown('Style: ', ['full', 'center', 'corners'])
	.dropdown('Mob: ', [
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
	])
	.submitButton({ translate: `maps.waypoints.${mode}` })
	.show(player).then(({ formValues, canceled }) => {
		if (canceled) return
		console.log(formValues[2])
	})
}
