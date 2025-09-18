import { world, system } from "@minecraft/server";

class MersenneTwister {
	constructor(seed) {
		this.N = 624;
		this.M = 397;
		this.MATRIX_A = 0x9908b0df;
		this.UPPER_MASK = 0x80000000;
		this.LOWER_MASK = 0x7fffffff;

		this.mt = new Array(this.N);
		this.mti = this.N + 1;
		this.init_seed(seed);
	}
	init_seed(s) {
		this.mt[0] = s >>> 0;
		for (this.mti = 1; this.mti < this.N; this.mti++) {
			var s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
			this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
			this.mt[this.mti] >>>= 0;
		}
	}
	random_int() {
		var y;
		var mag01 = new Array(0x0, this.MATRIX_A);

		if (this.mti >= this.N) {
			var kk;
			if (this.mti == this.N + 1) this.init_seed(5489);
			for (kk = 0; kk < this.N - this.M; kk++) {
				y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
				this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
			}
			for (; kk < this.N - 1; kk++) {
				y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
				this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
			}
			y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
			this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
			this.mti = 0;
		}

		y = this.mt[this.mti++];
		y ^= (y >>> 11);
		y ^= (y << 7) & 0x9d2c5680;
		y ^= (y << 15) & 0xefc60000;
		y ^= (y >>> 18);

		return y >>> 0;
	}
}


//by @depressed-pho
function umul32_lo(a, b) {
	let a00 = a & 0xFFFF;
	let a16 = a >>> 16;
	let b00 = b & 0xFFFF;
	let b16 = b >>> 16;

	let c00 = a00 * b00;
	let c16 = c00 >>> 16;

	c16 += a16 * b00;
	c16 &= 0xFFFF;
	c16 += a00 * b16;

	let lo = c00 & 0xFFFF;
	let hi = c16 & 0xFFFF;

	return ((hi << 16) | lo) >>> 0;
}

//by @protolambda and @jocopa3
export function isSlimy({x, z}) {
	let x_uint = Math.floor(x / 16) >>> 0;
	let z_uint = Math.floor(z / 16) >>> 0;
	let seed = umul32_lo(x_uint, 0x1f1f1f1f) ^ z_uint;
	let mt = new MersenneTwister(seed);
	let n = mt.random_int();
	return (n % 10 == 0);
}

function chunk_corner({x, y, z}) {
    return { x: Math.floor(x / 16) * 16 , y, z: Math.floor(z / 16) * 16  }
}

function slimy_outline({x, y, z}, dimension) {
	const chunk_corner = {
		x: Math.floor(x / 16) * 16 + 0.5,
		y: y + 1.5,
		z: Math.floor(z / 16) * 16 + 0.5,
	}
	for (let i = 0; i < 15; i++) {
		chunk_corner.x++
		dimension.spawnParticle("minecraft:oozing_emitter", chunk_corner)
	}
	for (let i = 0; i < 15; i++) {
		chunk_corner.z++
		dimension.spawnParticle("minecraft:oozing_emitter", chunk_corner)
	}
	for (let i = 0; i < 15; i++) {
		chunk_corner.x--
		dimension.spawnParticle("minecraft:oozing_emitter", chunk_corner)
	}
	for (let i = 0; i < 15; i++) {
		chunk_corner.z--
		dimension.spawnParticle("minecraft:oozing_emitter", chunk_corner)
	}
}

function get_distance(a, b) {
	return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2)
}

function normalize({x, y, z}, a, b) {
	const d = get_distance(a, b)
	return {x: x / d, y: y / d, z: z / d}
}

function clamp({x, y, z}, min, max) {
	const clamp = (x, min, max) => Math.min(Math.max(x, min), max)
	return {x: clamp(x, min.x, max.x), y: y, z: clamp(z, min.z, max.z)}
}

function draw_line(dimension, a, b) {
	const direction = normalize({
		x: b.x - a.x,
		y: b.y - a.y,
		z: b.z - a.z,
	}, a, b)
	for (let i = 0; i <= get_distance(a, b); i++) {
		dimension.spawnParticle(
			"minecraft:oozing_ambient", {
				x: a.x + i * direction.x,
				y: a.y,
				z: a.z + i * direction.z,
			}
		)
	}
}

function damage_item(player) {
	const equippable = player.getComponent('equippable')
	let item = equippable.getEquipment('Mainhand')
	const unbreaking = item.getComponent('enchantable')?.getEnchantment('unbreaking')?.level ?? 0
	if (Math.random() * (unbreaking + 1) >= 1) return
	const durability = item.getComponent('durability')
	if (durability.maxDurability == durability.damage) {
		item = undefined
		player.dimension.playSound('random.break', player.location)
	} else durability.damage++
	equippable.setEquipment('Mainhand', item)
}

function breadth_first_search(block, player, blockFace) {
	const side = {Up: "above", Down: "below", North: "north", East: "east", South: "south", West: "west"}[blockFace]
	const directions = [
		{ dx: 0, dz: 1 }, { dx: 0, dz: -1 }, { dx: 1, dz: 0 }, { dx: -1, dz: 0 },
		{ dx: -1, dz: -1 }, { dx: 1, dz: -1 }, { dx: 1, dz: 1 }, { dx: -1, dz: 1 },
	]
	
	const {dimension, location} = block
	const corner = chunk_corner(location)
	const queue = [corner]
	const visited = new Set()
	player.dimension.playSound('mob.slime.small', player.location)
	visited.add(`${corner.x} ${corner.z}`)
	const run = system.runInterval(() => {
		const equippable = player.getComponent('equippable')
		let item = equippable.getEquipment('Mainhand')
		if (queue.length > 0 && item?.typeId == 'minecraft:stone_shovel') {
			damage_item(player)
			const current = queue.shift()
			const {x, y, z} = current
			for (const {dx, dz} of directions) {
				const newX = x + dx * 16
				const newZ = z + dz * 16
				if (newX > location.x - 512 && newX < location.x + 512 && newZ > location.z - 512 && newZ < location.z + 512 ) {
					if (!visited.has(`${newX} ${newZ}`)) {
						visited.add(`${newX} ${newZ}`)
						queue.push({ x: newX, y, z: newZ })
					}
				}
			}
			if (isSlimy(current) && dimension.getBlock(current)) {
				const slime_chunks = [current]
				queue.forEach(chunk => {
					if (!dimension.getBlock(chunk)) return
					if (isSlimy(chunk)) slime_chunks.push(chunk)
				})
				const nearest = slime_chunks.sort((a, b) => {
					const center_a = { x: a.x + 7.5, z: a.z + 7.5 }
					const center_b = { x: b.x + 7.5, z: b.z + 7.5 }
					const dist_a = Math.sqrt((location.x - center_a.x) ** 2 + (location.z - center_a.z) ** 2)
					const dist_b = Math.sqrt((location.x - center_b.x) ** 2 + (location.z - center_b.z) ** 2)
					return dist_a - dist_b
				})[0]
				draw_line(dimension, block.above().center(), clamp(location, nearest, {x: nearest.x + 15, y, z: nearest.z + 15}))
				slimy_outline(nearest, dimension)
				system.clearRun(run)
			}
		} else {
			dimension.spawnParticle("minecraft:basic_smoke_particle", block[side]().center())
			system.clearRun(run)
		}
	})
}

world.afterEvents.entityHitBlock.subscribe(({damagingEntity: player, hitBlock: block, blockFace}) => {
	if (block.typeId != 'minecraft:stone') return
	if (player.typeId != 'minecraft:player') return
	const equippable = player.getComponent('equippable')
	let item = equippable.getEquipment('Mainhand')
	if (item?.typeId != 'minecraft:stone_shovel') return
	if (block.dimension.id == "minecraft:overworld") breadth_first_search(block, player, blockFace)
})