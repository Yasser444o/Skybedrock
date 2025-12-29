import { world, system, ItemStack } from "@minecraft/server"

const axolotls = [
    {
        ingot: "minecraft:copper_ingot",
        raw: "minecraft:raw_copper"
    },
    {
        ingot: "minecraft:iron_ingot",
        raw: "minecraft:raw_iron"
    },
    {
        ingot: "minecraft:gold_ingot",
        raw: "minecraft:raw_gold"
    },
    {
        ingot: "minecraft:netherite_scrap",
        raw: "minecraft:ancient_debris"
    }
]
world.afterEvents.playerInteractWithEntity.subscribe(({ beforeItemStack, target:axolotl}) => {
    if (axolotl.typeId != "minecraft:axolotl") return
    const {location, dimension} = axolotl
    const variant = axolotl.getComponent("minecraft:variant").value
    if (beforeItemStack?.typeId != axolotls[variant].ingot) return
    if (Math.random() < 0.8) {
        dimension.playSound('mob.frog.eat', location)
        axolotl.triggerEvent("start_processing")
    } else try {
        dimension.spawnItem(new ItemStack(axolotls[variant].ingot), location)
        dimension.playSound('mob.axolotl.hurt', location)
        dimension.spawnParticle('minecraft:basic_smoke_particle', {...location, y: location.y + 0.5})
        axolotl.triggerEvent("start_recovering")
    } catch {null}
})

system.afterEvents.scriptEventReceive.subscribe(({id, sourceEntity:axolotl}) => {
    if (id != "skybedrock:spit_raw_ore") return
    if (axolotl.typeId != "minecraft:axolotl") return
    const {location, dimension} = axolotl
    const variant = axolotl.getComponent("minecraft:variant").value
    try {
        dimension.spawnItem(new ItemStack(axolotls[variant].raw), location)
        dimension.playSound('random.eat', location)
        dimension.spawnParticle('minecraft:critical_hit_emitter', {...location, y: location.y + 0.5})
    } catch {null}
})