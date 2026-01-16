
// dynamic properties
export const load_dynamic_object = (holder, id, fallback = '{}') => JSON.parse(holder.getDynamicProperty(id) ?? fallback)
export const save_dynamic_object = (holder, id, value) => holder.setDynamicProperty(id, value ? JSON.stringify(value) : undefined)


// math
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

