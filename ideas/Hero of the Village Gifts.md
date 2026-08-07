## Cycle
- Run every 20 ticks
- Get all the players
- Remove the ones without hero of the village effect
- Remove the ones outside a village
  - If not possible with API, use a custom entity and an entity filter
- If possible, use the options parameter to filter the players
- Choose one random player
- Get all villagers within 6 blocks
- Remove the ones without direct line of sight to the player
  - Cast a ray from the villager eyes to the player's eyes
- Remove the sleeping villagers
- Remove the breeding villagers
- Remove the ones in gifts_cooldown
- Get the villager profession and biome
- Decrement all cooldowns by one second
- Put the villagers in gifts_cooldown with a cooldown of 45 seconds
- Spawn a loot in the villager position 
- Apply impulse to the item towards the player

## Data:
- Copy the loot tables from java
- Convert them into bedrock loot tables
- Add biome unique loot and baby unique loot
- Add an achievement for receiving a gift
- Document this in the How to Play screen
  
## Publicity
- Update planet minecraft gallery images to include this feature