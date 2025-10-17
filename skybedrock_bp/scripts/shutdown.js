import { world, system } from "@minecraft/server"
import { quest_tracker } from "./world/quests"

system.beforeEvents.shutdown.subscribe(() => {
	world.setDynamicProperty('quest_tracker', JSON.stringify(quest_tracker))
})