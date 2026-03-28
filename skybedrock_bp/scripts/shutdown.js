import { world, system } from "@minecraft/server"
import { quest_tracker } from "./world/quests"
import { chunks as geode_chunks, new_chunks as new_geode_chunks } from "./world/amethyst_geodes"

system.beforeEvents.shutdown.subscribe(() => {
	world.setDynamicProperty('quest_tracker', JSON.stringify(quest_tracker))
	world.setDynamicProperty('geode_chunks', JSON.stringify(Array.from(geode_chunks).concat(new_geode_chunks)))
})