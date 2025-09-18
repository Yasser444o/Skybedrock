import { world, system } from "@minecraft/server" ;

world.beforeEvents.entityRemove.subscribe(({removedEntity:entity}) => {
	if (entity.typeId != "minecraft:falling_block") return
	// this aims to make suspicious blocks that fall for to long to drop an item instead of diapeaing
})