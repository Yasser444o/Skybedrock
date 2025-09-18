import { world, system, ItemStack} from "@minecraft/server"

world.afterEvents.entityHurt.subscribe(({hurtEntity:player, damageSource:{cause}}) => {
  if (!world.getDynamicProperty("player_heads")) return
  if (cause != "lightning") return
  const equipment = player.getComponent('minecraft:equippable')
  const head = equipment.getEquipment('Head')?.typeId?.split(':')?.[1]
  if (!['skeleton_skull', 'zombie_head'].includes(head)) return
  equipment.setEquipment('Head', new ItemStack('player_head'))
}, {entityTypes: ["minecraft:player"]})

system.afterEvents.scriptEventReceive.subscribe(({id, sourceEntity:armor_stand}) => {
  if (id != "yasser444:player_heads") return
  if (!world.getDynamicProperty("player_heads")) return
  armor_stand.runCommand("replaceitem entity @s slot.armor.head 0 player_head")
})