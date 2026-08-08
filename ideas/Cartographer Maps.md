## Map Mechanics
- Detect when a world map item with no data is used
- Choose a random xz offset from -512 to 512
- Each structure type has a constant y value, size, and number range of spots
- Try again if the location is within 4 chunks of generated structure
- Try again if the location is within 1 chunk of a placed structure
- Fail with a warning when using in the wrong dimension
- Fail with a warning when using inside the biome map
- Fail with a warning if 32 attempts have failed
- Save the player location as the center of the map and the structure location
- Save the data on the item dynamic properties
- Play a map writing sound
- Open a 1024 x 1024 map screen
- Put a waypoint on the structure location
- Display the generated and placed structures in gray
- Display the outline of the biomes map in brown
- Reset the map data for free if a structure got added within 1 chunk of the structure location
- When the player is within 3 chunks, display the confirm and scrap buttons
- Confirming costs build items and scrapping costs a compass
- Highlight the build location
- On confirmation:
  - Consume the build cost items
  - Thy include sand or gravel, and sherds from the structure
  - Add the structure to placed_structures
  - Play a build sound
  - Place a cobblestone platform beneath the structure if the player is riding a happy ghast
  - Consume the map item
  - Add the structure to to the guidebook and announce that
- On Cancellation:
  - Consume a compass
  - Change the structure location but keep the map center
- Placed structures can be removed from the guidebook

## Structure Mechanics
- Placed Structures do not have blocks
- `placed_structures` is a dynamic array of objects
- Each object has a type, unique id, origin, and a list of xz offsets
- Each type has a random number of suspicious locations and a constant size
- Desert well (5 - 7), Trail Ruins (18-25), ...
- To generate the offsets, generate n number of xz offsets (0-size)
- Repeat the repeated offsets until reaching n (up to 16 tries)
- Save the dynamic array whenever a structure is placed or removed
- Sync the dynamic property with placed_structures on reload

## Regeneration Mechanics
- Each spot has a due date for regeneration
- Check if the structure is loaded
- Check if each spot is loaded
- Compare the due date with the current tick
- Check the block type at the regeneration spot
- Place a suspicious block

## API Changes:
- Add a pop-up function that pauses the actionbar for 5 seconds to display a message
- Suspicious blocks no longer use a scoreboard
- Add a world map upgrade for viewing the placed structures

## Guidebook Maps
- Add a placed structures map to the guidebook
- You can click a structure to set a waypoint for it
- Add an edit toggle for removing placed structures
- Add a button for listing all the placed structures

## Unfinished
- Enable the remaining map trades in the cartographer trade table
- Change the item icons for the maps (in 1.26.50)
- Add names and functions to the swamp, jungle, ocean and woodland maps
- When the woodland mansion map is added, change num_to_select to 2
- Add custom maps for abandoned camps
- Add a custom map for ancient cities and mineshafts
