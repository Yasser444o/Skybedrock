export const change_logs = {
  "v1.21.13.1": /*{*/`\
- Added a commands section to the how to play screen
- Localized the command descriptions
- Added a missing texture to the map screens
- Fixed some spelling mistakes
- Updated Crafted Trials to version 1.0.1
  `/*}*/,
  "v1.21.13": /*{*/`\
General Changes:
- Added Vibrant Visuals support for end phantoms and their spawning eggs
- Updated the fake Redstone Ores to better match vanilla ores
- Players in creative mode will no longer consume nether stars when creating budding amethyst
- Players in creative mode will no longer consume sky treasure maps when finding treasure
- Players in creative mode no longer need to complete achievements to unlock structures in the structure maps
- Removed the Request trader button from the guidebook. You can use /request_trader instead
- Removed the extra map features from the guidebook settings. use /settings instead
- Empty spawners can no longer be pushed by pistons

Custom Commands:
/recover
- Gives you back the starter islands that you have lost like the bucket or the lava
- This command is added to avoid situations where you have to reset the map or use creative mode in case you have made a mistake
- Please do not abuse this command to obtain more items than you should
- Doesn't require Cheats; can be used by anyone

/inform
- Can be used to tell you your biome or if you are in a slime chunk
- Doesn't require Cheats; can be used by anyone

/quests
- This command allows you to access the achievements screen without a guidebook
- Doesn't require Cheats; can be used by anyone

/request_trader
- Attempts to summon a wandering trader in spawn the next morning
- The attempt might fail if there are no players near spawn, there is already a wandering trader, or if the server restarts
- Doesn't require Cheats; can be used by anyone

/settings
- Use this command to enable or disable extra map features like "Enderman+"
- Doesn't require Cheats; can only be used by operators

/ach
- Can be used to grant or revoke achievements
- Requires cheats; can only be used by operators

/visit
- Can be used to teleport into any island or structure in the map
- Requires cheats; can only be used by operators

/restore
- Restores an island or a structure to its original form
- The ocean island and the ocean monument are currently excluded by this command
- Requires cheats; can only be used by operators

Achievements
- New achievements have been added: Gold for Junk - Ceramist in Training - Slimy Situation
- Updated the aesthetics of the achievements screen
- You can now manually detect achievements you haven't unlocked yet if you have the "see all achievements" setting enabled
- The achievements screen can now be accessed through the /quests command
- Fixed multiple spelling mistakes

Slime Finder
- You can hit a stone block with a stone shovel to find the nearest slime chunk
- More durability is used based on your distance from the slime chunk
- The search will stop if the shovel broke before finding a slime chunk

More Cat Gifts
- Added a new guidebook setting which allows more cats to give you gifts in the morning
- If You feed a tamed cat that is sitting within 8 blocks of your bed and go to sleep, it will give you a cat gift in the morning
- The cat must be tamed to you and making heart particles for this to work
- If your cats bred before you sleep, they won't give you gifts
- You can do this with as many cats as you want
- Visit the cat page in the Minecraft Wiki to see the list of the potential gifts

Enderman+
- updated the Enderman+ feature to fix many of the issues it had before
- Before only half the Endermen that spawn do have pale eyes and can pickup suspicious blocks, frosted ice, and farmland. They could only pick up those blocks and they can only do it once before they convert into regular Endermen
- Now all Endermen can pickup those blocks in addition to the blocks they can pickup normally, and they can do this more than once
- Endermen no longer snap to the center of the block they are standing on after picking up a block
- Fixed a vanilla bug where Enderman can not pick up blocks at all. There is another bug where they can pick up blocks way too often which i couldn't fix. Please upvote this Ticket to bring it to Mojang's attention
- Removed the pale eyes version of the Enderman
- Players and Endermen can not place frosted ice in the nether to avoid making water in that dimension

Crafted Trials
- The ability to create new vaults and ominous vaults has been separated into its own addon
- This addon is added to the map by default
- Added a guide page to this addon which can be accessed by a button right next to the How to Play screen button
- Replaced skybedrock spawner cores with crafted trials spawner cores
- If you have any of these cores laying around you can click them to convert them into the Crafted Trials version
- Cartographers can no longer sell Trial Vault Inscriptions
- Trial Vault Inscriptions have been disabled to be reworked
- Visit the "Crafted Trials" addon page on CurseForge if you want to add it into your survival worlds

World Generation:
- Fixed an error regarding nether void generation
- Added the missing biome tags to the nether biomes
- Removed an unused biome file that was meant to prevent hostile mobs from spawning in the trial chambers but never worked
- This now allows cold variants of animals to spawn on grass around the trial chambers
- Deactivated the last experimental toggle on skybedrock
- Because of this you might see some fake lava and glowstone in the nether if you are playing on a low simulation distance and the time taken to load the nether could be longer in some weak devices

Technical Changes:
- Updated all the map scripts to 2.0 then to 2.1 to unlock more scripting capabilities
- Updated all the entity files to the latest format version to fix their faulty behaviour
- Optimized the end stone script
- The technical blocks like sand support and shade are now hidden from commands
- The technical blocks now react properly to pistons
- Debug sticks can now access the entity properties and components
- Debug sticks can now reveal more of the items data by placing it in the first hotbar slot and the item you want to read in the first inventory slot

Bug Fixes:
- Maces now dismantle trial spawners correctly
- Fixed a bug where coal ore could be crafted using charcoal
- Fixed a bug where the biome detector could hurt the player in extreme scenarios
- Fixed a bug where the sky could stay blue for a few seconds when leaving the overworld
  `/*}*/,
  "v1.21.12": /*{*/`\
General Changes:
- Placed a Dried Ghast in the soul sand island
- Sniffers can now extract nether wart from crimson nylium in the crimson forest
- Sniffers can now extract chorus flowers from end stone in the end
- Sniffers can now extract pink petals in the cherry grove biome
- The reason behind these sniffer changes is to recover those items in case you've lost them
- The How to Play screen can now be better navigated with arrow keys
- Deleted the outdated end map from the How to Play screen
- Enhanced the compatibility of the map with resource packs that edit the HUD and the Inventory screen
- Fixed a bug where budding amethyst could be created outside the overworld
- Fixed a bug where chicken jockeys won't drop Lava Chicken music disc

Achievements:
- Reworked the Farmer Path Achievements and Challenges
- Farmer Achievements now consume your farm products to be completed
- Improved and re-enabled some of the old Farmer Path achievements 
- Challenges require you to do very specific and often difficult tasks and reward you with treasures
- Added "Extinct Dire Wolf", "Pirate Mode", "Sneaky Like a Ninja" to Challenges
- Moved "On the Radar" to Challenges
- Overworld Structures are now unlocked by completing Explorer Path achievements
- Nether Structures are now unlocked by completing "Distant Realm"
- Achievements can no longer be undone
- Fixed a bug where "Villagers Unlocked" would trigger by just approaching the Igloo
- Fixed an oversight where Silence armor trim  was unobtainable

Skybedrock Guidebook:
- Changed the item id of Skybedrock Guidebook (You will be handed the new copy if you update your world)
- Localized some of the guidebook pages. If you want to volunteer and translate them to  your language please contact me
- Skybedrock Guidebook in now handed to the 9th hotbar slot instead of the first
  `/*}*/,
  "v1.21.11": /*{*/`\
- Fixed a bug that prevented ghasts from dropping Tears music disc when the Ghast Soul Soil addon is active
- Added the dried ghast back to the pigins bartering table
- Added 2 new Achievements: Backridden, and Waypoints.
- Increased the chance of catching a junk item while fishing in swamp biomes from 10% to 30%
- Increased the chance of catching a lily pad as a junk item when fishing in swamp biomes from 17% to 50%
- Removed the More Lily Pads addon which increased the chances of catching lily pads regardless of the biome
  `/*}*/,
  "v1.21.10": /*{*/`\
- Added a new section to the guidebook for viewing maps
- Moved the biome maps from the How to Play screen to the maps section
- You can hover over any biome to see its name, where does it start and where does it end
- The structures map has been split into an overworld and a nether map and moved to the maps section
- You can see the biome of each structure by hovering over it on the map
- Added the end map to the maps section
- It shows which end gateways have generated and their features, the status of the end fountain, which end crystals are blown up, and which obsidian pillars have generated
- You can see your location on any map if you are in the same dimension
- Added a new achievement 'Plenty of Obsidian'
- Completed achievements are now ordered from the most recent to the oldest
- Piglins will drop Pigstep music discs when killed by a hoglin instead of a skeleton
- Added silverfish spawners which can be made by using a potion of infestation on an empty spawner
- Silverfish spawners in the stronghold will no longer drop an empty spawner when broken
- Removed the ticking area from the overworld
- The more sand addon can now be used in other worlds
- Fixed a bug where some guidebook pages could pill out of the screen
- Fixed a bug where dragon heads won't inject dragon breath if placed on the ground
  `/*}*/,
  "v1.21.9": /*{*/`\
General Changes:
- Added wildflowers to the birch forest island
- Added dry grass to the desert island
- Added some leaf litter to the dark forest island
- Added some firefly bushes to the swamp island
- Added bushes to the islands
- Added a cactus and a flower to the badlands island
- Added a custom texture for the end phantom spawn egg
- Camels spawning in the desert biome is now a vanilla feature
- You can now use the guidebook to request a wandering trader if you haven't had luck spawning them naturally
- The structure locator will turn off when you leave the world
- The addons on the map won't turn off achievements; However, achievements are still turned off because the world type is a flat world and the map is still using the custom biomes experimental toggle for the nether dimension
Changes to Achievements:
 - Skybedrock achievements will require you to do the objective in order to complete them
 - Achievements will automatically check if they have been completed
 - You can speed up or turn off the automatic detection of achievements in the guidebook settings
 - Added new achievements: "Diamonds!!!" and "Livestock"
 - Added book marks to the achievements screen
 - Achievements can no longer be ignored
 - Moved the claim reward button to a more intuitive location
 - Fixed the description of many achievements
 - Fixed the reward of "Sky Miner": You will c=have to hold a piece of equipment first to be enchanted with mending
Bug Fixes:
- The cold and warm variants of chicken along with their diamond variants can now spawn
- Cartographers can now sell the village maps (they are still useless tho)
- Fixed a false warning message
- Changed the technical blocks Shade and Sand support to be replaceable
- Axolotls have been updated to the 1.21.70 format version
- Fixed a bug where new born axolotls move faster than they should
- Fixed a bug with the debug stick, yes it has been debugged
- Optimized the biome detector
- Fixed the display name of the deep lukewarm ocean
- Updated the biomes map 
  `/*}*/,
  "v1.21.8": /*{*/`\
- Replaced the fake Iron, Gold, Emerald, Diamond, and Quartz ores with the vanilla ores.
- These ores are no longer affected by the fortune enchantment.
- The other fake ores stayed the same.
- Maces can be used to dismantle trial spawners.
- Moved the Sea Pickles to the Ocean Island.
- Reorganized the How to Play screen and added dropdowns to it.
- Disabled the Farmer Path and Adventure Path achievements to be reworked.
- Added a new achievement to teach the player how to make more dirt.
- Updated some achievements to be more accurate.
- Claiming an achievement reward will no longer close the achievements screen.
- Added a new optional addon: Ender Loader; which makes ender pearls tick the chunks around them.
- Updated the enderman entity file to version 1.21.60
- Updated the horse files in Zombie Horses addon  to version 1.21.60
- Fixed a bug that could cause the end dimension to skip an end gateway.
  `/*}*/,
  "v1.21.7": /*{*/`\
Changes to the End dimension:
- Removed the End Border.
- Increased the size of the main end island.
- Removed the Chorus Island and the End City Island.
- Voided the entire end dimension with the exception of the main end island and the end gateways.
- Using an end gateway from the main end island will generate a small end island in the far end.
- An end city island will generate in the far end after using the 1st, 5th, 10th, 15th, and 20th end gateways.
- Each end city is slightly different.
- Added an elytra to the last end city.
- A chorus island will generate in the far end after using the 1st, 9th, and 18th end gateways.
- End Phantoms can naturally spawn around the small end islands generated by the 2nd and 12th end gateways.

End Phantoms:
- Reduced the wait time for end phantoms to spawn around chorus fruit eating players from 1 hour to 20 minutes.
- End phantoms can also spawn naturally within 200 blocks of the 2nd and 12th gateways.
- End phantoms which spawn around chorus fruit eating players are now affected by DoInsomnia game rule.
- Fixed a bug where you can hear fake phantom noises in the end dimension.
- Fixed a bug where you can see a fake end phantom in the end dimension for a split second.
- Fixed a bug that prevented end phantoms from spawning.

Other Changes:
- Added a new section to the How to play screen for the optional addons.
- Breaking a Monster spawner will now drop an empty spawner.
- Renamed the achievement "Invented Gravity" to "Floating Sands"
- Fixed a bug that prevented creakings from spawning in the pale garden island.
- Reduced the size of the structures map to fit in a mobile screen.
- Fixed a missing texture error in the structures map.
  `/*}*/,
  "v1.21.6": /*{*/`\
Pale Garden and Resin:
- Added the pale garden biome.
- Replaced the Windswept island with the pale garden island.
- Added a lava source to the dripstone caves island.
- Added some resin clumps to the woodlands mansion chest.
- Added a crafting recipe for red sand.
- Removed the Red Sand addon.
Skybedrock Guidebook:
- Added the ability to bookmark any page in the guidebook.
- Added a highlight border around the selected book button.
- All the custom user interfaces (the guidebook, the achievements screen, the structures map) can now be navigated with a keyboard or a controller.
- Added an option to enable Keep Inventory in the guidebook settings.
- Added a back button and a bookmark button to the structures map.
Spawners and Vaults:
- Activating monster spawners in now instant.
- Players in creative mode are no longer charged items or levels for activating trial spawners.
- Copper blocks of trial spawner bases no longer need to be waxed.
- Copper blocks and bulbs of the vault altars no longer need to be waxed.
Other Changes:
- Increased the chance for pillager captains to spawn in the pillager outpost.
- Added support to the Desert island, Badlands island, and Ocean island.
Bug Fixes:
- Fixed a bug where the biome detector could damage the player upon using the reload command.
- Fixed some missing textures that broke in the 1.21.50 Minecraft update.
  `/*}*/,
  "v1.21.5": /*{*/`\
- Bone meal can be used to grow corals into coral reefs.
- Crafting Coral addon has been removed.
- Added some new biomes to the map and swapped the locations of some existing biomes:
-- Sunflower Plains on top of Lush Caves
-- Stony Peaks on top of Deep Dark
-- Windswept Hills on top of Dripstone Caves
-- Beach between Desert and Savanna
-- Sparse Jungle between Jungle and Birch Forest
-- Wooded Badlands between Badlands and Savanna
-- Gravelly Mountains between Wooded Badlands and Stony Peaks
-- Frozen River at the Igloo
-- Jungle Edge at the Jungle Temple
-- Modified Badlands at the Mineshaft
- Replaced the structure locator item with the structures map in the guidebook.
- All the structures are now unlocked you can select any structure to start locating it.
- You can also see where you are in the structures map.
- Fixed a bug where controller users can't use the structure locator by adding the player pointer to the structure map.
- Updated the format of the how to play screen to be more informing.
- Ender dragons no longer drop their heads if not killed by a player.
- Optimized the biome detector and separated is as a standalone addon.
- Changed the map icon to be persistent.
- Fixed the description of the budding amethyst feature in the how to play screen.
- Fixed a recurring bug where some icons in the achievements screen and the how to play screen get missed up every update.
- Fixed a bug related to placing natural sculk shriekers where it checked the biome of the player instead of the biome of the shrieker.
- Fixed a bug where random phantom noises can be heard in the end dimension.
- Fixed a bug where eyes of ender get consumed in creative mode.
- Fixed an exploit where a player could keep their xp by disconnecting immediately after activating a spawner. 
  `/*}*/,
  "v1.21.4.1": /*{*/`\
- Fixed the budding amethyst description in the how to play screen.
- Fixed a bug where some item icons in the how to play screen and achievements screen didn't use the correct texture.
- Fixed a bug on servers where players can activate spawners and keep their xp by disconnecting immediately after clicking the spawner.
  `/*}*/,
  "v1.21.4": /*{*/`\
- Added the End Phantom, the living variant of the phantom that spawns in the end dimension.
- End phantoms only spawn around players who haven't eaten anything but chorus fruit for the past 3 days.
- End Phantoms are hostile flying creatures which rarely drop elytra when killed by a player.
- Frogs can no longer eat bees.
- Added a Hardcore version of the map.
- Retextured the How to Play button to make it more noticeable.
- Changed the breaking and placing sounds for the empty spawners and empty vaults.
- Activating a spawner no longer clears the nearby spawners, but it takes longer.
- Activating a spawner will fail if there are other active spawners within the spawner range.
- Different sounds will play when the spawner fails to activate to indicate the cause of failure.
- Added smoke and flame particles to the spawner to indicate failing for succeeding respectively.
- Updated "It's White and Cold" achievement to require a carved pumpkin.
- Improved the Player Heads feature script to be more responsive and portable.
- Making budding amethyst is now done by pressing the "Use" button instead of the "Hit" button.
- Fixed a bug that made the hotbar invisible for mobile players.
- Fixed an exploit where the player could put the totem in a bundle after falling into the void and still get levitation.
- Fixed a bug that prevented cobblestone to end stone conversion in 1.21.40.
- Updated the ender dragon and fishing hook entity files
- Fixed a bug that prevented mobile players from making new guidebooks sometimes. 
  `/*}*/,
  "v1.21.3": /*{*/`\
- Added 3 new Biomes to the overworld: Ice Spikes, Stony Shore, and Frozen Ocean
- Added a second badlands biome to the map in preparation to replace the badlands island
- Revamped and expanded the Mineshaft
- Updated some textures in the how to play screen
- Fixed the textures and names of purpur blocks and petrified oak slabs
- Changed the rarity (name color) of spawner cores, empty spawners and empty vaults
- Added an indicator to completed achievements with unclaimed rewards
- You no longer need to lower distance to 16 chunks, I lowered it for you
- Added a new achievement to remove the render distance limit: On the Radar
- Added 3 new optional Addons: No Trader Llama, Axolotl Feed, and Translucent Pumpkin
- Fixed Enderman+ enderman eyes to glow in darkness
- Updated the Trial Chambers layout
- Organized the addon ui and structure files
  `/*}*/,
  "v1.21.2": /*{*/`\
- Added a custom user interface for the structure locator
- Added a custom user interface for Skybedrock Guidebook
- Spawner Cores can be used to restore vaults 
- Changed the method of obtaining end stone
- Instead of endermites walking on stone, end stone can be created by a piston pushing dragon's breath into a dragon head to make it fire on cobblestone
- Changed the method of making natural sculk shriekers 
- Instead of using an echo shard, place the sculk shrieker in a deep dark biome and it will become natural
- Charged creepers will also drop Otherside if killed by the bogged
- Added a new Achievement: "Undead Knight" 
- Players in creative mode can interact with locked achievements
- Added a return button to the achievements screen
- Added the map history to the guidebook
- Allay cages have been modified
- Added a missing section to the how to play screen
- Totems in the inventory will no longer get consumed before the totems in your hands
- Fixed a bug where the vaults in the trial chambers were unusable
- Fixed the icon for "Electricuted" achievement
  `/*}*/,
  "v1.21.1": /*{*/`\
General
- Skybedrock no longer uses Holiday Creator Features
- Replaced the icons in the Achievement view tabs with text to be less obscure
- Updated the look of the how to play screen and removed the QoL and Extra Items toggles

Gameplay
- Trial Spawners chance of ejecting Creator Music box has been reduced to 5%
- Custom ores will drop items when exploded
- Custom redstone ore will randomly emit particles when lit
- The biome detector item has been removed, and replaced by a player setting
- More Guidebooks can be created by using a book on a grass block instead of crafting
- Bread has been removed from the starter chest and added as an achievement reward
- Custom ores will take longer to break if not mined with the right tool
- Silence armor trim is now an achievement reward instead of a rare drop from the warden
- Totem of Unfalling can be used in any difficulty

Optimization
- Sculk to deepslate conversion has been optimized
- The Achievements screen has been optimized
- Totem of Unfalling has been optimized
- The map scripts has been organized

Spawner Core
- Ominous trial spawners can eject Spawner Cores, a new item used to craft spawers and vaults
- Nether Stars are no longer required to create spawners, trial spawners and vaults

Settings
- Added a settings section to the guidebook
- The biome detector can be toggled in the player settings
- Totem of Unfalling can be toggled in the player settings
- The Spoiler Dismiss button has been moved to the player settings

QoL Addon
- The "QoL" features have been split into independent optional addons most of which are active be default: 
--> Zombie Gravel
--> More Sand
--> More Copper
--> More Coal
--> Magma Blackstone 
--> Blaze Quartz
--> More Glowstone
--> Ghast Soul Soil 
--> Netherrack & Gold
--> Generous Clerics
--> Generous Masons
--> More Glass
--> Coral blocks
--> Red Sand
--> Granite & Diorite
--> More Lily Pads
--> Tuff & Calcite (turned off)
--> More Drowneds (turned off)
- "Valley Skeletons" addon has been added which makes soul sand valley skeletons drop soul sand 
- Wither Skeletons no longer drop soul sand
- Three optional QoL addon have been added: "Ominous Bottle I", "Crafting Bamboo", and "Cheap Trims"

Extra Items Addon
- The "Extra Items" addon features have been split into independent optional addons and world settings all of which are disabled by default:
- Addons:
--> Reinforced Deepslate 
--> Frogspawns
--> Purpur Block
--> Chorus Plants
--> Decay Potions 
--> Infested Blocks 
--> Zombie Horses
- Settings:
--> Player Heads
--> Enderman+
--> Natural Shriekers
--> Renewable Dragon Eggs
- Sculk Shriekers activation method has changed
- Changed the appearance of the endermen affected by the Enderman+ addon
- You can choose which addons or settings to activate or disable in the world behavior packs and the guidebook settings

Bug Fixes
- Fixed a bug that prevented ominous vaults from being created
- Fixed a bug where the structure locator confused the pillager outpost with the woodland mansion
- Fixed a bug that prevented raids from starting
- Fixed a number of spelling mistakes
  `/*}*/,
  "v1.21.0.1": /*{*/`\
- Fixed a bug with the ominous vault.
- Removed a warning on the resource pack.
  `/*}*/,
  "v1.21.0": /*{*/`\
- Trial Chambers have been added.
- Can be located through the structure locator.
- Disabled Hostile mobs spawning inside the trial chambers.
- Disabled Foxes spawning on top of the trial chambers.
- Added copper ingots, Creator music box, Scrape, and Guster pottery sherds to the trial spawner rewards.
- Added oxidized copper and Flow pottery sherds to the ominous trial spawner rewards.
- Added a secret item among the ominous vault rewards.
- New trial spawners can be created by the player.
- New trial chambers vaults can be created by using trial vault inscription on an empty vault placed on a vault altar.
- Trial vault inscriptions are sold by cartographer villagers.
- Empty vaults can be crafted.
- Vault altars are structures built by players to determine the type of vault.
- Empty spawners have been retextured and renamed.
- Added tuff to the stray loot tables.
- Added calcite to the bogged loot tables.
- Enchanted golden apples can no longer be crafted.
- Cave spiders will no longer spawn in badlands.
- Cave spiders will no longer drop cobwebs.
- Blocks placed on the obsidian platform will break instead of disappear when a player crosses the end border.
- Biome detector and structure locator will always turn off instantly
- Fixed a bug where the Played Days don't show up in the chat stack.

Quality of Life addon changes:
- Adjusted redstone drop rate from witches to match vanilla.
- Strays will no longer drop copper ingots.
- Tuff and calcite crafting recipes have been moved to this addon
- Adjusted drowned spawning conditions to match  vanilla.
- Silverfish can no longer spawn in windswept hills.

Extra Items addon changes:
- Added crafting recipes for infested blocks.
- Infested blocks can no longer be obtained by punching silverfish with a stone block.
  `/*}*/,
  "v1.20.13": /*{*/`\
- Moved the biome detector display text from the action bar to the chat stack.
- The structure locator has been reworked (again).
- You can craft it from a compass and lapis lazuli.
- When used, it will open a menu of the discovered structure.
- You can discover structures by using the structure locator in different biomes.
- When you select a structure, a compass pointing towards it will appear in the action bar.
- You can disable the structure locator by using it while sneaking.
- Compacted similar notes together in the How to Play screen.
- Corrected the name of Double Tall Grass in the how to play screen.
  `/*}*/,
  "v1.20.12": /*{*/`\
- More achievements have been added
- Rewards have been added to the achievements system
- Each reward can only be redeemed once
- More rewards will be added later
- The biome detector and structure locator are achievement rewards and removed from the starter chest
- Each player will be handed a guidebook when they join the map for the first time
- Added more features to the woodland mansion
- Added the missing allay back to the woodland mansion
- Added a ticking area around the obsidian platform in the end dimension to ensure the platform will regenerate properly
- The end border will no longer send a command feedback
- Fixed a bug where the elytra was exclusive to the Extra items pack
- Improved performance and added warning messages when the addon is used incorrectly
- Fixed a bug where cleansing sculk will yield no deepslate if the inventory is full
- Fixed a bug where the structure locator didn't work
  `/*}*/,
  "v1.20.11": /*{*/`\
- Players can bonemeal Rooted Dirt for a chance to grow Spore Blossoms
- Sniffers can no longer extract Spore Blossoms in lush caves
- Increased the chance for sniffers to find Small Dripleaves to 80%
- Increased the chance for sniffers to find Large Fern and Tall grass to 30%
- Improved the tables in the How to Play screen
- Added icons to the How to Play screen headers
- Revamped the Achievements UI
- Added more achievements
- Achievements have been farther detailed
- Separated them into 4 categories
- Added view toggle buttons to the Achievements screen
- Achievements have been linked together
- Some Achievements require 1 or more other completed achievements to be unlocked
- Added an Ignore achievement button
- More achievements will be added later
- Fixed a bug where Diamond Chicken could sometimes become normal chicken before they lay their diamond
- Baby Chicken resulting from breeding Diamond Chicken will no longer have a false diamond feather
  `/*}*/,
  "v1.20.10": /*{*/`\
- Added the secret Extra Items pack to Skybedrock, which is disabled by default.
- This pack adds items which are normally unobtainable in survival but were obtainable in Skybedrock like Reinforced Deepslate, Player Heads, Farmlands, Frogspawns and more.
- Separated Quality of Life pack from the main pack subpacks to be compatible with realms.
- It includes features which make obtaining grindy items easier, like more drops from mobs, trades from villagers, and items from crafting.
- Budding Amethyst can be created by hitting Amethyst Blocks with a Nether Star.
- Removed Budding Amethyst crafting recipe.
- Endermen can pickup Farmland, Frosted Ice, and Suspicious Sand and Gravel when Extra Items pack is enabled.
- Removed Farmland crafting recipe.
- Moved the following features to the Extra Items pack: Reinforced Deepslate recipe, Dragon Egg summoning, Potion of Decay recipe, Chiseled and Smooth Purpur recipes, Infested Blocks, Player Heads, Frogspawn drop, Zombie Horse conversion, and Chorus Plants.
- Updated the How to Play Screen. Now you can toggle Quality of Life pack, and Extra Items pack information on or off.
- Collapsed the biome maps and island maps.
- When expanded, they fill up the entire screen height.
- Replaced Wooded badlands island with Forest rocks (they are a placeholder for the Trial Chambers).
- Replaced the Mineshaft with the Badlands variant.
- Changed the biomes to locate and to find in the following structures: Pillager Outpost, Mineshaft, and Forest Rocks.
- Fixed some items in the how to play screen.
- Help buttons will always open the How to Play screen on the recipes page.
- Reduced the size and improved the loading time of the UI.
  `/*}*/,
  "v1.20.9": /*{*/`\
- Changed the biome of pillager outpost to be Old Growth Spruce Taiga biome.
- Added Wooded badlands Island which can be found by the structure locator.
- The other wolf spawning biomes were already available.
- Monster Spawners require 50 levels instead of 100 to activate.
- Sculk Shriekers require 50 levels instead of 100 to naturalize.
- Improved the code for Spawners and Shriekers to be more optimized.
- Improved and optimized the How to Play Screen.
- Added a warning message when joining the world to remind you to play on renderer distance 16 or below.
- You can use the Guidebook to disable this message.
- Quality of Life pack is now a subpack for the main behavior pack.
- Moved Totem of Unfalling from the quality of life subpack to the main subpack. 
- Totem of Unfalling now only works if difficulty is not set to HARD.
- Added a help Button to the pocket UI's inventory.
- Revamped the Achievements section of the guidebook.
- Added added hovering texts for items in the Recipes, Ores, Trading, and Mob Drops sections of the How to Play screen.
- You can hover over any item there to read its name.
- Increased the font size and resolution for the mob drops tables.
- Most Mob faces in the Mob drops tables are now compatible with resource packs.
- Updated the Biome Detector, Structure Locator, End Border, and Endermite infestation of stone to work in the next Minecraft update.
- Molang experimental features and Command Blocks are no longer used in Skybedrock.
- Skybedrock Items can be found in the correct category in the creative menu.
- Fixed the description of the "Beat the Game" achievement.
- Deleted unnecessary files to reduce the map size.
  `/*}*/,
  "v1.20.8": /*{*/`\
- Sky Treasure Maps have been added. 
- They are sold by cartographers instead of normal treasure maps.
- When used, a map will show up with an X mark in a random location in the beach biome.
- When used at the X mark, the map is consumed and a treasure box is given. 
- The treasure box contain a heart of the sea, some chain armor, a little bit of iron, gold, crystals and cooked cod.
- Dolphin will no longer make hearts of the sea.
- Strongholds have been revamped and will no longer generate in the same locations everytime.
- Upon world creation, 3 strongholds are generated at equal angles 1280 blocks away from spawn.
- Structure locators can no longer locate the strongholds.
- Eyes of ender can locate them instead, when used in the overworld, purple particles will lead you to the nearest stronghold.
- the Eyes have a 10% chance of breaking instead of 20%.
- Frogs can only eat bees in the end dimension.
- Fixed a bug where zombies don't anything in hard mode (when QoL pack is disabled).
- Fixed a bug where the the biome detector doesn't work in hard mode.
- Optimized the Biome Detector to be less laggy.
- Changed the size of the biome and island maps to fit better in mobile screens.
- Corrected the color of achievement buttons for mobile.
  `/*}*/,
  "v1.20.7": /*{*/`\
- Achievements Have been added, they can be accessed through the Guidebook. 
- When completed, the achievement is marked as done in the Guidebook. 
- Completing Achievements doesn't affect other players achievements. 
- Hitting a silverfish with a stone block will pickup the silverfish and make the block infested. 
- Frogs will no longer eat silverfish. 
- Infested stone can no longer be used in a stonecutter. 
- Sand or gravel particles will appear in the locations where sand or gravel can become suspicious. 
- Suspicious block regeneration time is now more randomized. 
- Petrified Oak Slab have been renamed and retextured. 
- Vanilla ores have been retextured to indicate that they are affected by fortune, although they are currently unobtainable. Skybedrock ores are kept the same.
- Skybedrock Guide Book has been renamed to Skybedrock Guidebook.
- Using the structure locator will replace the item with a compass instead of deleting it and spawning a compass on the player, leaving no chance for other players to pick it up accidentally.
- How to play screen has been optimized and updated.
- Added lore to the guidebook and structure locator in the startet chest. 
- Added a second chest to the jungle temple. 
  `/*}*/,
  "v1.20.6": /*{*/`\
- Added Zombie Horses; zombies attack untamed horses and convert them into zombie horses. 
- Added a Button to the custom items for mobile devices. 
- Dragon Eggs can no longer be cheated as summoning them is now instant. 
- Structure Spawning has been modified to be compatible with more guardian farm, raid farm, and witch farm designs:
** witches and pillagers can spawn with water at the head level and scaffolding at the feet level. 
** guardians can spawn with glass blocks above them. 
- Fixed the Information Screen due to recent changes to the How to play screen:
** text fits the entire screen weight instead of 75% of it. 
** background is darker now to make text more visible. 
** fixed the ores section. 
** aligned the appropriate texts to the center. 
- Fixed a bug where structure mobs won't spawn on some types of planks, and stone variants. 
- Fixed a bug where different colors of stained glass and glass panes other than white would prevent pillagers and guardians from spawning.
  `/*}*/,
  "v1.20.5": /*{*/`\
- Charged Creepers killed by Skeletons or Strays will drop Otherside Music Disc. 
Normal Creepers will no longer drop Otherside Music Disc. 
The Map Information and Features have been integrated to the How to Play screen instead being pictures in your download folder. 
- Map Information can be accessed in-game by anyone who joined the world and accepted the resource pack. 
- The map Features are described in more details than ever before. 
- End crystals in the end dimension are no longer so easy to break. 
- Fixed a bug where the End Crystals are at the incorrect height in the end dimension. 
- Fixed a bug where an End Gateway can generate inside the End City. 
- Fixed a Bug where using the structure locator may delete blocks. 
- Fixed an error where mobs try to spawn in peaceful difficulty inside the structures. 
- Drowneds should be able to spawn underground in the Dripstone Caves biome when the Quality-of-Life addon is applied. 
  `/*}*/,
  "v1.20.4": /*{*/`\
- Synchronized all Biome Detector items in the yer inventory. 
- The Biome Detector item can indicate the temperature by changing its icon. 
- Walking on, Placing a block on, or starting to mine Redstone Ores will make them light them up and emit particles.
- Structure spawning have been reworked to be less laggy and more responsive.
- Structure mobs can now spawn on any solid block with some exception. 
- Witches try to spawn about every second in the Spawn Hut. 
- Pillagers cycle through all 4 spots of the Pillager Outpost every 4 second and try to spawn on the the selected spot. 
- Guardians try to spawn every forth of a second in a random spot in the Ocean Monument. 
Structure mobs despawn when they are far away from the player.
  `/*}*/,
  "v1.20.3": /*{*/`\
- Sculk Blocks can be used in lava cauldrons to make deepslate
- Sniffers will sniff spore blossoms and small dripleaves in the Lush Caves biome from Clay and the other blocks
- Sniffers will sniff large fern and sweet berries along with the other seeds in the Taiga biomes
- Sniffers will sniff tall grass along with the other seeds in the Savanna biome
- Sniffers will sniff chorus plants in the End dimension only from end stone
- Foxes and llama don't drop large fern and tall grass respectively
- Spore Blossom and Chorus Plant can no longer be Crafted
- Wandering Traders no longer sell Sweet Berries
- Recipes have been updated to work with Recipes Unlock. 
- Mob Spawner recipe is now listed in the recipe guide. 
- Fixed the Nether Dimension so now more bedrock floor can generate.
  `/*}*/,
  "v1.20.2": /*{*/`\
- Fixed the sign in the Igloo
- Removed an additional Item Frame
- Marked a missing spawning spot in the Fortress
- Fixed the Trail Ruins Suspicious Gravel timer
- Fixed a bug where activating Spawners will sometimes consume the item 
- Fixed some errors in the information picures
- Moved Silverfish spawning to the Quality of Life behavior pack
- QoL: Dwoneds spawn in Dripstone caves up to 8 on the surface instead of 2 and up to 8 underground instead of 0 
  `/*}*/,
  "v1.20.1": /*{*/`\
- Structure Locator have been added, it can be used in the correct biome to locate the corresponding structure
- Removed Structure Compasses from the islands
- Wardens rarely drop Silence Armor trim 
- Removed Silence Armor trim from the Ancient City chest
- Switched location of the Swamp biome and the Mangrove Forest
- Stepping on Redstone Ores will make them glow
- Piglins Converted into Brutes will keep their names
- Piglins can Pickup Gold Ores and get angry for breaking them
- Biome Detector won't produce any lag when inactive
- Biome Detector no longer actives for a second upon respawning
- Biome Detector is not disabled by death for now
- Fixed a bug related to obtaining the Player Head
- Fixed a bug that prevented Endermite from generating End Stone
- Skybedrock can be played on realms and servers again
- Removed 5 bread from the starter chest
- QoL: Desert Masons have a chance to sell Sandstone 
- QoL: Savanna Masons have a chance to sell  Red Sandstone
  `/*}*/,
  "v1.20.0": /*{*/`\
- Suspicious blocks of all structures have been fixed to include loot. 
- Fixed a bug that prevented Suspicious blocks from regenerating 
- Suspicious Blocks of the same structure will take the same amount of time to regenerate (15 minutes in the desert well, 30 minutes in the desert temple, 25 minutes in the cold ruins...etc)
- Mob Souls have been removed
- Fixed a bug that prevented Warden Souls from working by simply removing them
- Sculk Shriekers require 100 xp levels instead of Warden kills to be made natural
- Making a Natural Sculk Shrieker will put you in a cooldown for 10 seconds so you don't accidentally spend more levels on the same Shrieker
- Empty Monster Spawners can now be pushed and pulled by Pistons, and won't disappear if broken
- Activating Spawners require 100 xp levels instead of mob kills
- Activating a Spawner will clear all other Spawners around it
- Ore names have been localized
- Redstone ore no longer glows and the lit version have been removed
- Axolotl metal impurification mechanic have been reworked
- The same mechanics apply but the visuals are more appealing
  `/*}*/,
  "v1.19.0": /*{*/`\
- Updated to Minecraft 1.20
- Added Trail Ruins
- Added Ocean Ruins
- Added Shipwreck
- Added Desert Well
- Added a Chest to the the Nether Fortress, End City, and one of the Strongholds
- Added Armor Trim Templates to the Pillager Outpost, Desert Pyramid, Jungle Temple, Ancient City, Woodland Mansion, and the Bastion
- Added Netherite Upgrade Templates to the Ruined Portals loot
- Added Cherry Grove Biome
- Replaced the Flower Forest Island with the Cherry Island
- Suspicious Sand and Gravel can regenerate after being Brushed
- Camels can spawn in the Desert Biome
- Added Petrified Oak Slab to the Desert Well Suspicious Sand loot
- Added a Unique Biome to each structure
- Added all biomes to the Biome Detector
- Diamonds can no longer be crafted from Nether Stars
- Removed Dead Bush Smelting Recipe

- Replaced Weakness Potion With Weakness Arrows
- Deleted Unnecessary Structures
- Skulk Shriekers activate with block states
  `/*}*/,
  "v1.18.0": /*{*/`\
- The map addon has been separated into 2 packs: the main pack, and the quality of life pack
- The Quality of Life pack is active by default, you can deactivate it to make the map more challenging
- The Quality of life pack includes features like better villager trades, extra mob drops, and better crafting recipes.
- Decreased file size
- Fixed the front left corner of the Ocean Monument
- Adjusted the information pictures to be easier to print
- Random tick speed is no longer set to 3 for the first 10 days
  `/*}*/,
  "v1.17.1": /*{*/`\
- Fixed a bug that stopped structures from spawning mobs after 10 days of playing
  `/*}*/,
  "v1.17.0": /*{*/`\
- Added mob spawner crafting recipe
- Spawners can be activated with Souls
- Added Souls, new items can be obtained by killing mobs
- Ocean Monument, Pillager Outpost, and Swamp Hut, have been fixed. Mobs should be able to spawn in them again
- Changed the Ocean Monument from a pool to a pyramid
- Custom vanilla ores have been added
- Gems and Minerals have been removed (if you have any gems and minerals craft ores with them before updating)
- Nether Barrier have been removed
- the Nether dimension has infinite void generation with biomes and structure bounding boxes
- Biome Detector is now an item, can be toggled on or off, it deactivate upon dying
- Biome detector can be crafted
- Old method of activating the Biome Detector have been removed
- Sculk Shriekers can be activated with Warden Souls
- Diamond Chicken lay 1 diamond
- Jungle Temple have been tweaked
- 10 days of increased random tick speed have been fixed
- Totems of Unfalling will work more accurately
- Added sound and particles for Piglin Brute Conversation 
- Chicken can be breed and drop loot again
- Ancient city is dark now
- Player Head Can also be obtained if a lightning struck an Armor Stand wearing a Skeleton or Zombie head
  `/*}*/,
  "v1.16.0": /*{*/`\
- Added textures to Smooth and Chiseled Purpur
- Added New Items: Coal Rock, Copper Mineral, Iron Mineral, Gold Mineral, Emerald Gem, Diamond Gem, Quartz Gem
- All Ores except Lapis and Redstone have been Added
- Fixed some bugs related to mobs behavior
- You can fish Glow Lichen in Dripstone Biome
- Fox no longer Spawn with Glow Lichen
- Silverfish can naturally spawn in Windswept Hills Biome below ground
- fixed a bug that prevented cave spiders from spawning
- Spiders will no longer spawn in Badlands or Windswept Hills
- Fixed a Bug with the Ender Dragon behavior
- Chicken no longer Lay Diamonds
  `/*}*/,
  "v1.15.0": /*{*/`\
- Smooth and Chiseled Purpur have been added
- Player Head has been added
- The Swamp Hut, The Igloo, and The Mineshaft have been tweaked
- Biome Detector Activation method has been changed
- Endermites will transform Stone into End Stone if they walk on it in the End dimension
- Endermen will no longer Convert Nearby Stone into End Stone
- Warden drop rates have been adjusted
- Cobweb can no longer be crafted into String
- Piglens will only convert to Piglen Brutes when they have one HP
- Dying no longer make Players lose half their hunger
- Frogs will spit Infested Deepslate when they Silverfish below Y=0
- Infested Stone can no longer be smelted into Infested Deepslate
- Nether Barrier is now harder to escape
- Information pictures have been updated to a new look
- Information pictures have the size of A4 making them easier to print
- Zombified Piglens that spawned in the Overworld will no Longer Drop Netherrack
- Biome Detector has been fixed again
- Fixed some issues with the end border
- It will no longer rain in the first day
- Glow Lichen have been back added to the Dripstone Island
- Swamp Hut Compass have been added back to the Swamp Island
  `/*}*/,
  "v1.14.0": /*{*/`\
- Totems save players from falling in the void again
- Players spawn in half their hunger again
- Deleted a random nether portal in the nether
- Deleted unnecessary chunks
- Added a goat horn to the pillager outpost chest
- Fixed some spelling issues in the information pictures
  `/*}*/,
  "v1.13.0": /*{*/`\
- Updated to Minecraft 1.19
- The Ancient City has been added
- It has Natural Sculk Shriekers that summon Wardens
- You can fish Swift Sneak Books in the Deep Dark Biome
- Wardens drop Music Disc Fragments and Echo Shards if killed by Players
- Added a crafting recipe for Reinforced Deepslate
- Added Sculk to the Deep Dark island
- Added all 3 Cave Biomes
- Added 5 new Mountain biomes
- Replaced Birch Hills Biome with Mangrove Swamp Biome
- Replaced the Oak tree in the Swamp island with Mangrove tree
- Pregnant Frogs have a chance to drop Frogspawns
- Added 2 Allays to the Woodland Mansion
- Silverfish eaten by Warm Frogs drop Infested Cobblestone
- Silverfish eaten by Temperate Frogs drop Infested Stone
- Silverfish eaten by Cold Frogs drop Infested Mossy Stone Bricks
- Silverfish will no longer drop Infested stone when they die and will give xp again
- Bees eaten by frogs have a slight chance to drop broken Elytra
- Leather Workers will no longer sell Elytra
- Spawning spots in the Nether Fortress are now visible
- Axolotls will only spawn in Lush Caves
- Goats will only spawn in Mountains
- Tropical Fish and Pufferfish will only spawn in their regular biomes
- Infested Stone can no longer be crafted into Infested Mossy Stone Bricks using a stonecutter
- Drowneds will no longer drop Clay Balls
- Fixed All Ocean Biomes
- Fixed Some Typos
- The Biome Detector has been moved to the Behavior Pack of the map
- Fixed all issues related to the Biome Detector
  `/*}*/,
  "v1.12.0": /*{*/`\
- Replaced shulker cloning mechanics that existed in the map with the new vanilla mechanics
- Shulkers are not guaranteed to drop 2 shells anymore
- Added Buried treasure map to the cartographer trade table
- Removed Coral Fans crafting recipe since you can get them by Bonemeal
- Added loot chests to some structures
- Fixed fish can't spawn below y=50
- Fixed a typo in the information files
  `/*}*/,
  "v1.11.1": /*{*/`\
- Fixed an issue where Piglins don't barter
  `/*}*/,
  "v1.11.0": /*{*/`\
- Fixed all bugs related to command blocks
  `/*}*/,
  "v1.10.1": /*{*/`\
- Fixed a bug where you get teleported to 100 50 0 in the overworld if you passed 400 blocks away from spawn
  `/*}*/,
  "v1.10.0": /*{*/`\
- Zombified Piglins Drop Netherrack in the Nether only
- Wandering Traders and Librarians trades are fixed
- Pufferfish and Tropical fish spawn in the correct height
- Cave Spiders spawn in the correct light level
- Zombie Villagers no longer drop Gravel
- Ender Dragon will drop their head again
- Shulker Duplication works again
- Weak Pandas no longer drop Slime Balls (Slimes can spawn in slime chunks)
  `/*}*/,
  "v1.9.0": /*{*/`\
- Updated to Minecraft 1.18
- Changed the method for obtaining hearts of the sea
- Moved the deep island to y -32
- Added Otherside music disc
- Improved the nether barrier
- Improved shulker duplication
  `/*}*/,
  "v1.8.0": /*{*/`\
- Changed the structure locators from paper to compasses
- Changed tropical fish and pufferfish spawning to make them obtainable
- Changed the recipes for large fern and tall grass into rare mob drops
- Fixed a bug with gilded blackstone
- Fixed a bug with raw ores
- Fixed a bug with weak pandas
  `/*}*/,
  "v1.7.0": /*{*/`\
- Updated piglin brute conversion
- Added the biome detector to the nether
- Added cave spiders to the badlands biome
- Changed the map into a mcworld file
- Fixed a bug with silverfish
- Fixed some spelling mistakes
  `/*}*/,
  "v1.6.0": /*{*/`\
- Added raw ores
- Added glow berries to the mineshaft
- Added glow lichen to foxes
- Improved the Totem of Unfalling
- Fixed a bug with weak pandas
  `/*}*/,
  "v1.5.0": /*{*/`\
- Updated to Minecraft 1.17
- Added the Lush Island, Dripstone Island, Geode Island, and Deep Island
- Changed mob drop rates
- Added a Hunger penalty for dying
- Added recipes for Budding Amethyst, Tuff, Calcite, and Spore Blossom
- Added copper to strays
- Added dripstone blocks to stone masons
- Added infested deepslate
- Improved the cut copper recipes
  `/*}*/,
  "v1.4.2": /*{*/`\
- Librarians sell more glass
- Random tick speed will change to normal after passing the 10th day
- Updated the information pictures
  `/*}*/,
  "v1.4.1": /*{*/`\
- Added the end city island
- Updated shulker spawning
- Made slime balls obtainable through pandas
- Added sweet berries to the wandering trader
- Added diamond chicken
- Fixed the nether barrier
- Removed the magma cream recipe
  `/*}*/,
  "v1.4.0": /*{*/`\
- Dolphins can slowly generate hearts of the sea
- Updated elder guardian conversion
- Added Totem of Unfalling
- Fixed the nether barrier
- Fixed a bug with piglins
- Increased the glowstone and redstone dropped by witches
- Added dragon Heads
- Added gilded blackstone
- Updated the information pictures
  `/*}*/,
  "v1.3.0": /*{*/`\
- Updated to Minecraft 1.16.200
- Added an achievements PDF
- Changed the nether wart location
  `/*}*/,
  "v1.2.1": /*{*/`\
- Added recipes for farmland, tall grass, large fern and chorus plants
- Added Bamboo
- Removed the obsidian pillars
- Added Dragon Egg Regeneration
- Updated the information pictures
  `/*}*/,
  "v1.2.0": /*{*/`\
- Updated to Minecraft 1.16.100
- Added the ability to toggle off the biome detector
- Added the nether roof
- Updated piglin bartering
  `/*}*/,
  "v1.1.2": /*{*/`\
- Improved Stone Mason trades
- Added more structure locators
- Added sea pickles
- Updated the information pictures
  `/*}*/,
  "v1.1.1": /*{*/`\
- Added the behavior pack to the map
- Added a recipe for decay potions
- Fixed fire coral recipe
  `/*}*/,
  "v1.1.0": /*{*/`\
- Updated to Minecraft 1.16.20
- Added piglin brute conversion
- Fixed clerics glowstone trade
- Fixed the stronghold structure
  `/*}*/,
  "v1.0.3": /*{*/`\
- The first version of Skybedrock
  `/*}*/,
}

export const feature_history = { 
  "Achievements": /*{*/`\
1.3.0: Added an achievements PDF file to the map download

(Removed that PDF file at some point)

1.20.7: Added the achievements screen to the guidebook

1.20.8: Fixed the color of the achievement buttons

1.20.9: Revamped the Achievements screen

1.20.11:
- Revamped the Achievements UI
- Added more achievements
- Achievements have been farther detailed
- Separated the achievements into categories
- Added view all, view locked and view completed buttons
- Linked the achievements together
- Added a button to ignore achievements

1.20.12:
- More achievements have been added
- Added a reward system

1.21.1:
- Replaced the icons in the Achievement view tabs with text to be less obscure
- Added more achievement rewards
- The Achievements screen has been optimized

1.21.2: 
- Players in creative mode can interact with locked achievements
- Added a return button to the achievements screen
  `/*}*/,
  "Archaeology": /*{*/`\
1.19.0:
- Added suspicious blocks to some of the structures, which regenerate over time after being brushed
- Added petrified oak slabs to the desert well loot

1.20.0:
- Fixed a bug where the suspicious blocks didn't contain loot initially
- Fixed a bug where suspicious blocks did not regenerate
- Adjusted the duration for suspicious blocks to regenerate to be more consistant

1.20.2: Fixed a bug that prevented some suspicious gravel in the trail ruins from regenerating

1.20.7:
- Added dust particles to the locations where suspicious blocks are supposed to regenerate
- regeneration time is now more randomized
- Petrified Oak Slab have been given a unique name and a texture
  `/*}*/,
  "Biome Detector": /*{*/`\
1.0.3: Added the biome to the action bar

1.2.0: The biome detector can be activated by standing on a lily of the valley and disabled by standing on a dead bush

1.7.0: Works in the nether now

1.13.0:
- It no longer uses command blocks
- It tells the actual biome now and works anywhere in the world

1.15.0:
- It now activates by looking down while holding a flower, and deactivates by looking down while holding a dead bush
- Fixed a bug that prevented the biome detector from working

1.17.0:
- It can now be toggled with a custom item instead of a flower and a dead bush
- It deactivates upon dying
- The biome detector item can be crafted with copper, a lily of the valley, and a dead bush

1.19.0: Added all the biomes to the biome detector

1.20.1:
- Optimized the biome detector
- Fixed a bug where the biome detector activates for a second upon respawning
- It is no longer disabled by death

1.20.4:
- All biome detector items in the inventory will turn on if it's turned on
- The biome detector item can also tell the temperature by changing its icon

1.20.8: Fixed a bug where the biome detector does not work without the QoL addon

1.20.9: This feature no longer relays on experimental molang queries

1.20.12: Moved the biome detector from the starter chest to achievement rewards

1.20.13: Moved the biome detector display text from the action bar to the chat stack.

1.21.0: Improved the biome detector response time

1.21.1:
- The biome detector item has been removed
- It can be activated by the guidebook settings
`/*}*/,
  "Budding Amethyst": /*{*/`\
1.5.0: Added a crafting recipe for budding amethyst

1.20.10:
- Removed the crafting recipe
- Budding Amethyst can be created by hitting amethyst blocks with a nether star
  `/*}*/,
  "Cave Spiders": /*{*/`\
1.0.3:
- Added a cave spider spawner to the mesa island
- Cave spiders will drop cobwebs instead of string

1.7.0:
- Removed the cave spider spawner
- Cave spiders can spawn in badlands biome

1.10.0: Fixed a bug where cave spiders couldn't spawn in natural darkness 

1.15.0: Discovered and removed the cobweb to string recipe

1.16.0: Regular spiders no longer spawn in badlands

1.21.0:
- Cave spiders will no longer spawn in badlands
(Use trial spawners or monster spawners to spawn them)
- Cave spiders will no longer drop cobwebs
(Use weaving potions to farm it)
  `/*}*/,
  "Copper Ingots": /*{*/`\
1.5.0
- Increased drowneds chance to drop copper
- Changed strays to drop copper when killed
- Cut copper can be crafted using 4 copper ingots
- Copper blocks can be cut into 2 cut copper in a stonecutter

(At some point Mojang improved the copper crafting recipes, so my recipes have been retired)

1.18.0:
- Moved the increased copper chance from drowneds into the QoL addon
- Moved the copper from strays into the QoL addon

1.21.0:
- Added copper ingots and oxidized copper to the trial spawner loot
- Strays will no longer drop copper ingots

1.21.1: Moved the increased copper chance from drowneds into its own addon
  `/*}*/,
  "Coral & Tropical Fish": /*{*/`\
1.0.3: Added crafting recipes for coral blocks and coral fans

1.1.1: Fixed the crafting recipe for fire coral

1.8.0: Changed tropical fish and pufferfish to be able to spawn in regular ocean biomes
(I wasn' able to add the warm ocean biome at the time)

1.10.0: Fixed the height at which fish can spawn

1.12.0:
- Removed the coral fan recipes
- Fixed a bug where fish can't spawn below y 50

1.13.0:
- Warm ocean has been added
- Tropical fish and pufferfish will no longer spawn in normal oceans

1.18.0: Moved the coral recipes to the QoL addon

1.21.1: Moved the coral recipes to a their own addon
  `/*}*/,
  "Decay Potions": /*{*/`\
1.1.1: Added a brewing recipe for decay potions

1.20.10: Moved this feature to the Extra Items addon

1.21.1: Separated this feature from the Extra Items addon
  `/*}*/,
  "Diamond Chicken": /*{*/`\
1.0.3: Nether stars can be crafted into 4 diamonds

1.4.1: Chickens can very slowly lay diamonds

1.16.0:
- Normal Chickens will only lay eggs
- Diamond Chickens have been added
- They lay a single diamond gem and convert to normal chicken

1.17.0:
- Diamond Chickens will lay diamonds instead of diamond gems
- Fixed a bug that prevented chickens from breeding and dropping items

1.19.0: Diamonds can no longer be crafted, can be found in suspicious sand instead

1.20.11:
- Fixed a bug where Diamond Chicken could sometimes become normal chicken without laying a diamond
- Baby chicken resulting from breeding diamond chicken will no longer have a false diamond feather
  `/*}*/,
  "Documentation": /*{*/`\
1.0.3: Added a folder to the map download containing information pictures

1.1.2: Separated the biome maps from the rest of the information pictures and changed the format

1.4.0: Updated the look of the information pictures

1.15.0: Updated the information pictures to have a new look and the size of A4

1.18.0: Adjusted the information pictures to be easier to print

1.20.2: Fixed some errors

1.20.5:
- Information pictures have been removed
- Modified the How to Play screen to include information about all the the map features

1.20.6: Fixed some issues with the How to play screen

1.20.7: Updated and optimized the how to play screen

1.20.8: Adjusted the size of the biomes and islands maps

1.20.9:
- Added a help Button to the pocket UI's inventory
- Added hovering texts for items in the How to Play screen
- Revamped the mob drops table
- Improved and optimized the How to Play Screen

1.20.10:
- Added toggles to the how to play screen, to display the QoL features and Extra Items features
- Added buttons to view the biome maps and island maps instead of being always displayed
- Fixed some errors with the the help button and the screen itself

1.20.11:
- Improved all the tables
- Added icons to the headers

1.20.13: Added mini books to the how to play screen

1.21.1: Updated the look of the how to play screen and removed the QoL and Extra Items toggles
`/*}*/,
  "Dragon Eggs": /*{*/`\
1.2.1: Dragon eggs can be summoned on the end fountain using 4 blocks of netherite

1.20.6: Optimized this feature

1.20.10: Moved this feature to the Extra Items addon

1.21.1: Merged this feature with the main addon, can be activated with the guidebook
  `/*}*/,  
  "Dripstone Drowneds": /*{*/`\
1.20.2:
- Increased Drowned spawn rates in dripstone caves, and made them spawn in caves
- Added this feature to the QoL addon

1.20.5: ??? I guess something happened

1.21.0: This feature has been removed

1.21.1: This feature has been added back as an optional addon
  `/*}*/,
  "End Stone": /*{*/`\
1.0.3: Endermen can convert nearby stone into end stone in the end dimension

1.15.0:
- Enderman can no longer make end stone
- Endermites can convert stone into end stone if they walk on it in the end dimension

1.21.0: Fixed a bug that broke this feature

1.20.9: This feature no longer relays on experimental molang queries

1.21.2:
- Endermites will no longer convert stone into end stone
- Dragon breath can be pumped through a dragon head by a piston onto cobblestone to convert it into end stone
  `/*}*/,
  "Enderman+": /*{*/`\
1.2.1: Added a crafting recipe for farmland

1.20.10:
- Removed farmland crafting recipe
- Endermen can pickup Farmland, Frosted Ice, and Suspicious Sand and Gravel
- Moved this feature to the Extra Items addon

1.21.1:
- Merged this feature with the main addon, can be activated with the guidebook
- Endermen affected by this feature have a different appearance than normal endermen
  `/*}*/,
  "Exotic Herbs": /*{*/`\
1.2.1: Added crafting recipes for tall grass, large fern, and chorus plants

1.4.1: Wandering traders can sell sweet berries

1.6.0: Added glow berries to the mineshaft loot

1.8.0:
- Tall grass and large fern are no longer craftable
- Llamas rarely drop tall grass
- Foxes rarely drop large fern

1.20.3: 
- Foxes and Llamas no longer drop large fern and tall grass
- Removed the chorus plant crafting recipe
- Sniffers can extract tall grass in savanna, large fern and sweet berries in taiga, and chorus plants in the end
- Wandering traders no longer sell sweet berries

1.20.10: Moved chorus plants to the Extra Items addon

1.20.11: Increased the chance for sniffers to find large fern and tall grass

1.21.1: Separated chorus plants from the Extra Items addon
  `/*}*/,
  "Fake Ores": /*{*/`\
1.0.3: Added crafting recipes for iron and gold ore, and ancient debris

1.5.0: Removed those crafting recipes

1.16.0:
- Custom crafting materials have been added to allow for ore crafting
--> Coal Rocks: from black cats
--> Iron Minerals: from scraping iron golem
--> Gold Minerals: from zombified piglins
--> Copper Minerals: from dripstone drowneds
--> Emerald Gems: from foxes
--> Diamond Gems: from diamond chicken
--> Quartz Gems: from striders
--> Redstone and Lapis Gems: from Hero of the Village gifts (but hero of the village gifts were never added)

1.17.0:
- Gems and minirals have been removed
§7(yes, in the very next update, I hated them that much)§r
- Added fake ores which can be crafted with ore drops
- Fake ores look and act exactly like vanilla ores except that they drop one item and are not affected by fortune

1.20.0:
- Ore names have been localized
- Removed the lit version of redstone ore

1.20.1:
- Stepping on redstone ore will make it glow
- Piglins can hord the fake gold ores just like vanilla gold ores

1.20.4: Redstone ore will glow and emit particles when intercated with

1.20.7: Vanilla ores have been retextured

1.21.1:
- Custom ores will drop items when exploded
- Custom redstone ore will randomly emit particles when lit
- Custom ores will take longer to break if not mined with the right tool
  `/*}*/,
  "Glow Lichen": /*{*/`\
1.5.0: Glow lichen have been added to the deepslate island

1.6.0: Foxes can spawn with glow lichen

1.13.0: The deepslate island has been replaced with the deep dark island and glow lichen got accidentally removed

1.15.0: Added glow lichen to the dripstone island

1.16.0:
- Foxes can no longer spawn with glow lichen
- Added glow lichen to the dripstone caves fishing table
  `/*}*/,
  "Gold & Netherrack": /*{*/`\
1.0.3: Zombified piglins can drop netherrack and more gold nuggets

1.10.0: Zombified piglins will drop netherrack in the nether only

1.15.0: Fixed a bug where zombified piglins can drop netherrack if spawned in the overworld and sent to the nether

1.18.0: Moved this feature to the QoL addon

1.21.1: Separated this feature from the QoL addon
  `/*}*/,
  "Guidebook": /*{*/`\
1.20.6: Skybedrock Guidebook has been added

1.20.7:
- Achievements have been added to the guidebook
- Fixed the name of the guidebook

1.20.12: Each player will be handed a guidebook when they join the map for the first time

1.21.1:
- Changed the way for obtaining the guidebook from crafting to using a book on a grass block
- Added a settings section to the guidebook

1.21.2:
- Added a custom user interface
- Added the map history to the guidebook
  `/*}*/,
  "Heart of the Sea": /*{*/`\
1.0.3: Added the heart of the sea as a rare dolphin drop

1.4.0: Dolphins will instead generate a heart of the sea every 30 minutes to one hour

1.9.0: Dolphins will instead make a heart of the sea when fed too much raw cod

1.12.0: Added a plain buried treasure map to the cartographer trade table, which doesn't do anything yet

1.20.8:
- Added the sky treasure map
- It can be purchaced by cartographers
- It can be used to find treasure chests
- Dolphins can no longer make hears of the sea
`/*}*/,
  "Hunger Penalty": /*{*/`\
1.5.0: The player will lose 5 hunger points upon respawning

1.14.0: Fixed a bug that stopped this feature from working

1.15.0: Hunger penalty has been removed
(This feature was intended to stop 'hunger reset' but it wasn't fair for the players who died to natural causes so it was removed)
  `/*}*/,
  "§.Infested Blocks": /*{*/`\
1.0.3:
- Silverfish can drop infested stone or cobblestone
- Added stonecutter recipes for infested regular/mossy/cracked/chiseled stone bricks

1.5.0: Added a smelting recipe for infested deepslate

1.7.0: Fixed a bug where silverfish dropped xp

1.13.0
- Silverfish will drop only xp again
- Frogs can eat silverfish and spit infested blocks
--> warm frog > infested cobblestone
--> temperate frog > infested stone
--> cold frog > infested mossy stone bricks
- Infested mossy stone bricks can no longer be made in a stonecutter

1.15.0:
- Frogs will spit infested deepslate when they eat silverfish below y 0
- Infested stone can no longer be smelted into infested deepslate

1.16.0: Silverfish can naturally spawn in windswept hills biome instead of spiders

1.20.2: Silverfish spawning in windswept hills has been pushed to the QoL addon

1.20.7:
- Infested blocks can be obtained by hitting a silverfish with a stone block
- Frogs will no longer eat silverfish. 
- Infested stone can no longer be used in a stonecutter

1.20.10: Moved this feature to the Extra Items addon

1.21.0:
- Added crafting recipes for infested blocks
- Infested blocks can no longer be obtained by hitting silverfish with a stone block
- Silverfish can no longer spawn in windswept hills

1.21.1: Separated this feature from the Extra Items addon
`/*}*/,
  "Music discs": /*{*/`\
1.0.3: Piglins shot by skeletons drop Pigstep

1.9.0: Creepers shot by strays can drop Otherside

1.13.0: Added disc 5 fragments and echo shards to the warden loot

1.20.5: Charged Creepers killed by Skeletons or Strays will drop Otherside Music Discs instead of normal creepers which are killed by strays

1.21.0: Added Creator music box, Scrape, and Guster pottery sherds to the trial spawner loot

1.21.1: Adjusted the chance for obtaining Creator music box

1.21.2: Charged creepers will also drop Otherside if killed by the bogged
  `/*}*/,
  "Natural Shriekers": /*{*/`\
1.17.0: Sculk Shriekers can be turned natural by using warden souls on them

1.19.0: Changed the structure command to a setblock command for this feature

1.20.0:
- Warden souls have been removed
- Sculk shriekers require 100 xp levels to spawn wardens
- Added a 10 seconds cooldown to stop you from accidentally wasting levels on the same shrieker

1.20.9:
- Redused the xp cost from 100 levels to 50
- This feature has been optimized

1.21.1:
- Merged this feature with the main addon, can be activated with the guidebook
- Echo shards can be used directly on the shrieker now

1.21.2:
- Echo shards and xp are no longer required to make natural sculk shriekers
- Shriekers placed by the player in a deep dark biome are natural
  `/*}*/,
  "Panda Slime": /*{*/`\
1.4.1:
- Slime stopped spawning in flat worlds
- Weak pandas will drop slime balls to make them obtainable again

1.6.0: Fixed a bug where weak pandas didn't drop bamboo

1.8.0: Fixed a bug where weak pandas forget that they are supposed to drop slime balls after relog

1.10.0:
- Slimes started spawning in slime chunks again
- Weak pandas will no longer drop slime balls
  `/*}*/,
  "Piglin Brutes": /*{*/`\
1.1.0: When piglins stand on gold blocks, the gold block disappears and the piglin becomes a piglin brute

1.4.0: Piglin brutes are supposed to drop gilded blackstone

1.7.0: Piglins will convert into brutes if you feed them golden apples instead of standing on gold blocks

1.8.0: Piglin brutes acually drop gilded blackstone now

1.15.0: Piglins require to be on one HP for the conversion to be successful

1.17.0: Added sound and particles to the conversion 

1.20.1: Piglins converted into brutes will keep their names
  `/*}*/,
  "Player Head": /*{*/`\
1.15.0: Player heads can be obtained if a lightning struck a player wearing a zombie or a skeleton head

1.17.0: Lightning can hit armor stands as well to obtain them

1.20.1: Fixed a bug that prevented obtaining the player head

1.20.10: Moved this feature to the Extra Items addon

1.21.1: Merged this feature with the main addon, can be activated with the guidebook
  `/*}*/,
  "Purpur Blocks": /*{*/`\
1.15.0:
- Purpur can be smelted into smooth purpur
- Purpur can be stonecut into chiseled purpur

1.16.0: Added textures and names for the hidden purpur blocks

1.20.10: Moved this feature to the Extra Items addon

1.21.1: Separated this feature from the Extra Items addon
  `/*}*/,
  "Quick Start": /*{*/`\
1.0.3: Changed the Random Tick Speed to 3

1.4.2: Random tick speed will reset to 1 after the 10th day

1.17.0: Fixed a bug that let the random tick speed reset

1.17.1: Fixed a bug that stopped all command blocks after the 10th day

1.18.0: This feature has been removed
  `/*}*/,
  "Raw Ores": /*{*/`\
1.6.0: Axolotls can convert ingots into raw ores and netherite scraps into ancient debris

1.8.0: Fixed a bug that resulted in axolotls converting ingots into the wrong raw ore

1.20.0: Improved the visuals of this mechanic
  `/*}*/,
  "Shulker Duplication": /*{*/`\
1.0.3:
- Shulkers can be spawned by putting poped purpur and dragon breath in a chest in the end dimension and standing on it.
- Shulkers always drop two shulker shells

1.4.1:
- Shulkers can no longer be summoned.
- Shulkers will duplicate when hit by a shulker bullet.

1.9.0: Fixed a bug where the duplicated shulkers didn't always teleport

1.10.0: Fixed a bug where shulkers couldn't duplicate

1.12.0:
- Shulkers can duplicate in vanilla Minecraft now, thus this feature has been removed
- Shulkers no longer always drop 2 shells
  `/*}*/,
  "Spawners and Vaults": /*{*/`\
1.17.0:
- Added Monster Spawners
- Can be crafted with chains and nether stars
- Can be activated with mob souls
- Added Mob Souls, which can be obtained by killing mobs

1.20.0:
- Mob Souls have been removed
- Monster spawners require 100 xp levels to be activated 
- Activating a spawner will clear all the nearby spawners
- Empty spawners can be mined and pushed by pistons

1.20.2: Activating a spawner will no longer consume the item used to activate it

1.20.9:
- Redused the xp cost for activating Monster Spawners from 100 to 50 levels
- This feature has been optimized

1.21.0:
- Added a way to build new trial spawners and vaults
- Added the Trial vault inscription, a new item sold cartographers
- Added a crafting recipe for empty vaults
- Renamed and retextured the empty spawners

1.21.1:
- Added the Spawner Core, a new item dropped by ominous trial spawners
- It can be used to craft empty spawers and empty vaults
- Nether Stars are no longer required to create monster spawners, trial spawners and vaults
- Fixed a bug that prevented ominous vaults from being created

1.21.2:
- Spawner Cores can be used to restore vaults
- Fixed a bug where the vaults in the trial chambers were unusable
`/*}*/,
  "Spore Blossoms": /*{*/`\
1.5.0: Added a crafting recipe for spore blossoms

1.20.3:
- Removed that crafting recipe
- Sniffers can extract spore blossoms and small dripleaves in lush caves

1.20.11:
- Players can bonemeal rooted dirt for a chance to grow spore blossoms
- Sniffers can no longer extract spore blossoms in lush caves
- Increased the chance for sniffers to find small dripleaves
  `/*}*/,
  "Strongholds": /*{*/`\
1.0.3: Added 3 strongholds to the overworld, the first one was at 1000, 32, 0

1.1.0: Fixed a bug where one of the strongholds was made out of infested blocks

At some point: Added a lodestone compass to the starter chest, pointing towards the first stronghold location

1.20.1:
- Removed the lodestone compass from the starter chest
- The structure locator can locate the stronghold

1.20.8:
- The structure locator can no longer be used to locate the strongholds
- They will now generate in random locations
- Eyes of ender can be used to locate the nearest stronghold
  `/*}*/,
  "Structure Locator": /*{*/`\
1.0.3: The coordinates of each structure were written on paper placed in item frames in each island

1.1.2: Added locators for the Nether Fortress and the Bastion remnants

1.8.0: Changed the structure locators from paper to lodestone compasses

1.15.0: Fixed a bug where the spawm hut compass was missing

1.20.1:
- Removed the lodestone compasses from the islands
- Added the structure locator item to the starter chest
- When used in a biome, it converts into a lodestone compass pointing towards the matching structure

1.20.5: Fixed a Bug where using the structure locator may delete blocks

1.20.7: Fixed a bug where the structure locator could be picked up by other players when used

1.20.9: This feature no longer relays on experimental molang queries

1.20.12:
- Moved the structure locator from the starter chest to achievement rewards
- Fixed a bug where the structure locator didn't work

1.20.13:
- You can craft it from a compass and lapis lazuli.
- The structure locator will open a menu to select a structure when used instead of giving a lodestone compass
- You can add more structures to the menu by using it in different biomes
- Added a little compass that points towards the selected structure to the action bar
- It can be disabled by using it while sneaking

1.21.0: Improved the response time of the  structure locator

1.21.1: Fixed a bug where the structure locator confused the pillager outpost with the woodland mansion

1.21.2: Added a custom user interface
  `/*}*/,
  "Structure Spawning": /*{*/`\
1.0.3: Added a working pillager outpost, swamp hut, ocean monument, and a nether fortress

1.3.0: Nether wart has been moved to the nether fortress

1.13.0: Marked the spawning spots in the nether fortress with cracked nether bricks

(At some point, overworld structures stopped spawning mobs in all flat worlds)

1.17.0:
- Made mobs spawn again in the pillager outpost, ocean monument, and swamp hut, with command blocks
- Ocean monument has been changed from a pool to a proper structure

1.20.4:
- Structure mobs can despawn now
- Optimized the structure spawning by using scripts instead of command blocks
- Structure mobs can spawn on more blocks
- Spawning duration have changed to be more consistant

1.20.5: Fixed a bug where structure mobs try to spawn in peaceful difficulty

1.20.6:
- Modified the spawning rules to better match vanilla
- Fixed a bug where structure mobs won't spawn on some variants of planks and stone
- Fixed a bug where  pillagers and guardians won't spawn inside stained glass and stained glass panes
`/*}*/,
  "The Elytra": /*{*/`\
1.0.3: Master level leather workers can sell the elytra for 54 emeralds

1.13.0:
- Leather workers no longer sell the elytra
- Frogs can spit a broken elytra when they eat bees

1.20.8: Frogs will only eat bees if they are in the end dimension

1.20.12: Fixed a bug where this feature was exclusive to the Extra Items addon
  `/*}*/,
  "The End Dimension": /*{*/`\
1.0.3: 
- The end island is made of a circular layer of endstone with obsidian pillars and the end fountain
- Added the chorus island to the left of the main island
- The end dimension is surrounded by a 400 blocks border, any player who passes the border will get teleported to the obsidian platform

1.2.1: The obsidian pillars have been removed

1.4.1: Added the end city island

1.10.1: Fixed a bug where the end border affected the overworld 

1.15.0: Fixed some issues with the end border

1.20.5:
- Fixed a bug where the end crystals were placed at the wrong height
- Added an obsidian layer below the end crystals to make them harder to hit
- Fixed a bug where an end gateway can generate inside the end city

1.20.9: The end border no longer relays on experimental molang queries

1.20.12:
- Added a ticking area around the obsidian platform in the end dimension
- The end border will no longer send a teleport message

1.21.0: Blocks placed on the obsidian platform will break instead of disappear when a player crosses the end border
`/*}*/,
  "The Nether Barrier": /*{*/`\
1.0.3: Added a 320 by 320 barriar block border around the nether dimension

1.2.1: Added a bedrock roof to the nether to allow for mob spawning

1.4.0: Plugged a hole in the nether barrier

1.4.1:
- Added a bedrock border around the normal nether
- Vexes will spawn when a player escapes the barrier

1.9.0: 
- Escaping the nether barrier will no longer spawn vexes
- It will apply blindness and instant damage to the player

1.15.0: The nether barrier will negate the effect of enchanted golden apples

1.17.0:
- The nether barrier have been removed
- Added infinite void generation with biomes and structure bounding boxes to the nether dimension

(At some point a Minecraft update brought back patches of the bedrock floor to the nether)

1.20.3: Fixed that bug and removed the bedrock floor entirely
  `/*}*/,
  "Totem of Unfalling": /*{*/`\
1.4.0: Totems will give you levitation and slow falling when the player goes below y 0

1.6.0: This feature no longer uses command blocks

1.14.0: Fixed a bug that broke this feature

1.17.0: Totem of Unfalling has been optimized

1.18.0: Moved this feature to the QoL addon

1.20.9: Merged this feature with the main addon, but it can not be used in HARD difficulty

1.21.1:
- This feature once again works in hard difficulty
- It can be turned off by the guidebook settings
- The totem will break once the player is safely outside the void
- This feature has been optimized

1.21.2: Totems in the inventory will no longer get consumed before the totems in your hands
`/*}*/,
  "Tuff & Calcite": /*{*/`\
1.5.0: Added crafting recipes for tuff and calcite

1.21.0
- Tuff and calcite recipes have been moved to QoL addon
- Added tuff to the stray loot
- Added calcite to the bogged loot

1.21.1: Tuff and calcite recipes have been split from to QoL addon
  `/*}*/,
  "Villager Trading": /*{*/`\
1.0.3:
- Clerics will sell 4 redstone dust instead of 2 and 5 lapis lazuli instead of 1
- Leather workers sell elytra for 54 emeralds at Master level

1.1.0: Clerics will sell glowstone blocks instead of glowstone dust
(This has been added later to vanilla Minecraft)

1.1.2:
- Masons have 4 stained/glazed terracotta trades and sell 4 blocks for 1 emerald instead of 1
- Masons sell 4 quartz blocks for 4 emeralds instead of 1 for 1

1.4.2: Librarians sell 6 glass instead of 4

1.5.0: Fixed Masons so they can sell dripstone blocks

1.10.0: Fixed librarian and wandering trader trades

1.13.0: Leather workers no longer sell elytra

1.18.0: These features have been pushed to the QoL addon

1.20.1: Desert and savanna masons can sell sandstone and red sandstone respectively

1.21.1: Separated these features from the QoL addon into 3 addons: Generous Clerics, Generous Masons, and More Glass.
  `/*}*/,
  "Witches Loot": /*{*/`\
1.4.0: Added more redstone and glowstone to the witch loot

1.18.0: Moved this feature to the QoL addon

1.21.0: Witches will drop the normal amount of redstone

1.21.1: This feature has been separated from the QoL addon into the More Glowstone addon
  `/*}*/,
  "Zombie Horses": /*{*/`\
1.20.6: Zombies can convert wild horses into zombie horses

1.20.10: Moved this feature to the Extra Items addon

1.21.1: Separated this feature from the Extra Items addon
  `/*}*/,
}