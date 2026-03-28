
// dynamic properties
export const load_dynamic_object = (holder, id, fallback = '{}') => JSON.parse(holder.getDynamicProperty(id) ?? fallback)
export const save_dynamic_object = (holder, id, value) => holder.setDynamicProperty(id, value ? JSON.stringify(value) : undefined)

// math
export class MersenneTwister {
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
export function umul32_lo(a, b) {
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


export function dot(u, v) {
	return u.x * v.x + u.y * v.y + u.z * v.z
}

export function cross(u, v) {
	return {
		x: u.y * v.z - u.z * v.y,
		y: u.z * v.x - u.x * v.z,
		z: u.x * v.y - u.y * v.x,
	};
}

export function normalize(vector) {
	const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2)
	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length,
	}
}

// vectors
export function hash_to_location(hash) {
	return ((([x, y, z]) => ({x: +x, y: +y, z: +z})))(hash.split(' '))
}

export function location_to_hash({x, y, z}) {
	return `${x} ${y} ${z}`
}

export function offset_location(location, direction, distance) {
	return {
		x: location.x + direction.x * distance,
		y: location.y + direction.y * distance,
		z: location.z + direction.z * distance,
	}
}

export function add_vectors(a, b) {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
		z: a.z + b.z,
	}
}

export function subtract_vectors(a, b) {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
		z: a.z - b.z,
	}
}
