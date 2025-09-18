import { world, system } from "@minecraft/server"

const last_position = new Map()

export const gateways = [
    {x: 77, z: 56},
    {x: 91, z: 29},
    {x: 95, z: 0},
    {x: 91, z: -29},
    {x: 77, z: -56},
    
    {x: 56, z: -77},
    {x: 29, z: -91},
    {x: 0, z: -95},
    {x: -29, z: -91},
    {x: -56, z: -77},

    {x: -77, z: -56},
    {x: -91, z: -29},
    {x: -95, z: 0},
    {x: -91, z: 29},
    {x: -77, z: 56},
    
    {x: -56, z: 77},
    {x: -29, z: 91},
    {x: 0, z: 95},
    {x: 29, z: 91},
    {x: 56, z: 77},
]
export const end_cities = new Map([
    [1, "first_city"],
    [5, "second_city"],
    [10, "third_city"],
    [15, "forth_city"],
    [20, "last_city"],
])
export const chorus_islands = new Map([
    [1, "chorus1"],
    [9, "chorus2"],
    [18, "chorus3"],
])
export const pillar_locations = [
    { x: 41, z: 0 },
    { x: 33, z: -24 },
    { x: 12, z: -39 },
    { x: -12, z: -39 },
    { x: -33, z: -24 },
    { x: -41, z: 0 },
    { x: 33, z: 24 },
    { x: 12, z: 39 },
    { x: -12, z: 39 },
    { x: -33, z: 24 },
]

function get_distance(a, b) {
    b = b ?? {x: 0, z: 0}
	return Math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2)
}

function find_nearest(location, locations) {
	const distances = locations.map(coords => get_distance(location, coords))
    const nearest = Math.min(...distances)
    return locations[distances.indexOf(nearest)]
}

function chunk_corner({x, z}) {
    return { x: Math.floor(x / 16) * 16 , z: Math.floor(z / 16) * 16  }
}

function used_new_gateway(player) {
    if (!last_position.get(player.id)) return
    if (get_distance(last_position.get(player.id)) > 200) return // if the player teleported from less than 200 blocks from 0
    const arrival = chunk_corner(player.location)
    if (get_distance(arrival) < 800) return // if the player teleported to more than 800 blocks from 0
    if (player.dimension.id != 'minecraft:the_end') return // if the player stayed in the end
    const nearest_gateway = find_nearest(arrival, gateways)
    const nearest_string = `${nearest_gateway.x} ${nearest_gateway.z}`
    const activeted_gateways = active_gateways.map(gateway => `${gateway.x} ${gateway.z}`)
    if (activeted_gateways.includes(nearest_string)) return // if the nearest gateway to the chunk the player has arrived to is not activated
    active_gateways.push(nearest_gateway)
    world.setDynamicProperty('open_gateways', JSON.stringify(active_gateways)) // mark the gateway as active
    return true
}

function build_far_island(player) {
    const arrival = chunk_corner(player.location)
    //preserve the arrival area 
    ;[-1, 0, 1].forEach(i => {
        ;[-1, 0, 1].forEach(j => {
            const location = {x: arrival.x + 16 * i, z: arrival.z + 16 * j, y: 10}
            world.structureManager.place(`end_islands/void`, the_end, location)
        })
    })
    //load the end cities
    system.runTimeout(()=> {
        if (!end_cities.has(active_gateways.length)) return
        const city = end_cities.get(active_gateways.length)
        world.structureManager.place(`end_islands/void`, the_end, {x: arrival.x, z: arrival.z - 48, y: 10})
        world.structureManager.place(`end_islands/${city}`, the_end, {x: arrival.x, z: arrival.z - 48, y: 66})
    }, 20)
    //load the chorus islands
    system.runTimeout(()=> {
        if (!chorus_islands.has(active_gateways.length)) return
        const island = chorus_islands.get(active_gateways.length)
        world.structureManager.place(`end_islands/void`, the_end, {x: arrival.x - 32, z: arrival.z + 16, y: 10})
        world.structureManager.place(`end_islands/${island}`, the_end, {x: arrival.x - 32, z: arrival.z + 16, y: 66})
    }, 20)
    //mark as a phantom island
    if ([2, 12].includes(active_gateways.length)) {
        const phantom_islands = JSON.parse(world.getDynamicProperty('phantom_islands') ?? '[]')
        phantom_islands.push(arrival)
        world.setDynamicProperty('phantom_islands', JSON.stringify(phantom_islands))
    }
}

let the_end, active_gateways
world.afterEvents.worldLoad.subscribe(()=> {
    the_end = world.getDimension('the_end')
    active_gateways = JSON.parse(world.getDynamicProperty('open_gateways') ?? '[]')
    system.runInterval(() => {
        const players = the_end.getPlayers()
        players.forEach(player => {
            if (used_new_gateway(player)) build_far_island(player)
            last_position.set(player.id, player.location)
        })
    })
})