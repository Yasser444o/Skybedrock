## Notes
- Quest Book is a standalone addon
- Have an api addon and data addons
- Quests Data is send as a stringified object with the initialize command
- Quest IDs and categories are namespaced
- Quests are based on event subscription modal
- The detect button will be the subscribe/unsubscribe button and is renamed to Watch/Unwatch
- Subscribe on:
  - startup (for unlocked quests)
  - completion of parents (when a quest unlocks)
  - watch (for locked quests)
- Unsubscribe on completion, unwatch, revoking of parents
- Watching status and last open page are saved on rejoin
- Do not subscribe to already subscribed quests
- Write quests as local constants and construct them into category objects
```js
	const cobblestone = {}
	skyblock_path = {
		quests: { cobblestone }
	}
```
- Revoking quests will also reset their stats

## Modifications
- Rewire and optimize the quests system of skybedrock
- Use the form body text as a tooltip for the category
- Most stats based quests will use completion steps
- Expand the addon capabilities by making use of molang queries and entity filters
- Add validation warnings and errors for user data addons
- Add an info card which displays the usage of each command
- Add a settings page and move the quests settings out of skybedrock guidebook
- Show the ID of each quest in the its page
- Quests can accept multiple notes, images and bullet lists
- Quest rewards are more visual
- Support indented bullets
- Quests can be written as markdown scripts or js objects

## Commands
- Use `/scriptevent questbook:initialize namespace data` for initializing quests
- Use `/scriptevent questbook:is_loaded` for detecting if the addon is loaded
- Receive `questbook:is_loaded_result` for confirming that the addon is loaded
- `/quests` opens the last visited page 
- `/quests home` takes you to the home page
- `/quests open namespace:name` takes you to a specific quest
- `/quests grant/revoke namespace:id @s` works the same as /ach, require operator permission
  - `namespace:quest` for a specific quest
  - `namespace:category:*` for a whole category
  - `namespace` for a whole addon
  - `*` or empty for all quests
- `/quests list namespace:category @s` lists the completed quests and [number/total]
- `/quests next namespace:category @s` prints the name and description of the next quest
  - `namespace:category` for a specific category
  - `namespace` for a specific addon
  - `*` or empty for all quests

## Integration
- Addons can call the initialize function to send their quests data to Quest Book
- Player data is stored in the Quest Book uuid, not the data addon
- Skybedrock Guidebook Achievements button is renamed to quests and runs `player.runCommand('questbook:quests')`
- Migrate all player quest data from Skybedrock to Quest Book

## Templates
- Add a data addon for showcasing all the custom capabilities of the addon
- Add two data addons for minecraft advancements and achievements
- Write a manual for writing data addons

