import { world, system, MolangVariableMap, ItemStack } from "@minecraft/server"
import { stored_items } from "../startup"

function is_entity_in_block(entity, block) {
  const [x, y, z] = ['x', 'y', 'z'].map(axis => Math.floor(entity.location[axis]))
  return (block.x == x && block.y == y && block.z == z)
}

function convert(block, direction, iterations) {
  iterations--
  if (block.typeId == "minecraft:cobblestone") block.setType("minecraft:end_stone")
  if (iterations > 0) system.runTimeout(()=> convert(block[direction](), direction, iterations), 2)
}
function breathe(block, direction, iterations) {
  const molang = new MolangVariableMap()
  molang.setFloat("variable.cloud_lifetime", 1)
  molang.setFloat("variable.cloud_radius", 1)
  molang.setFloat("variable.particle_multiplier", 10)
  iterations--
  block.dimension.spawnParticle("minecraft:dragon_breath_lingering", block.center(), molang)
  if (iterations > 0) system.runTimeout(()=> breathe(block[direction](), direction, iterations), 2)
}

world.afterEvents.pistonActivate.subscribe(({block, piston}) => {
  if (piston.state == "Retracting") return
  //get the piston direction
  const piston_facing = block.permutation.getState("facing_direction")
  const piston_direction = ["below", "above", "south", "north", "east", "west"][piston_facing]
  //is it a dragon head 
  const dragon_head = block[piston_direction]()[piston_direction]()
  if (dragon_head?.typeId != "minecraft:dragon_head") return
  //get the head placement
  const head_facing = dragon_head.permutation.getState("facing_direction") - 1
  let direction = ["ground", "north", "south", "west", "east"][head_facing]
  //get the heads
  //if the head on the ground
  if (direction == "ground") {
    if (!stored_items.dragon_heads) return
    const facing = stored_items.dragon_heads
    .map(head => dragon_head.getItemStack(1, true).isStackableWith(head))
    .indexOf(true)
  //get the head direction
    if (facing == -1) return
    else direction = ["north", "south", "south", "west", "east"][facing]
  }
  //can it breathe
  const mouth = dragon_head[direction]()
  if (mouth.typeId != "minecraft:air") return
  //find a dragon breath item entity
  const dragon_breath = dragon_head.dimension
  .getEntities({location: dragon_head.center(), maxDistance: 2, type: "minecraft:item"})
  .filter(item => is_entity_in_block(item, dragon_head))
  .find(item => item.getComponent('minecraft:item').itemStack.typeId == "minecraft:dragon_breath")
  if (dragon_breath) {
    //consume dragon breath from the ground
    const item_location = dragon_breath.location
    let new_item = dragon_breath.getComponent('minecraft:item').itemStack
    new_item.amount > 1 ? new_item.amount-- : new_item = undefined
    dragon_breath.remove()
    if (new_item) dragon_head.dimension.spawnItem(new_item, item_location).clearVelocity()
  } else if (dragon_head.above().typeId == "minecraft:hopper") {
    //consume dragon breath from a hopper
    const hopper = dragon_head.above()
    if (hopper.permutation.getState("facing_direction") != 0) return
    const hopper_container = hopper.getComponent("inventory").container
    const bottle_slot = hopper_container.find(new ItemStack("minecraft:dragon_breath"))
    if (bottle_slot == undefined) return
    let item = hopper_container.getItem(bottle_slot)
    item.amount > 1 ? item.amount-- : item = undefined
    hopper_container.setItem(bottle_slot, item)
  } else return
  //convert cobblestone to endstone
  breathe(mouth, direction, 7)
  convert(mouth[direction](), direction, 5)
})