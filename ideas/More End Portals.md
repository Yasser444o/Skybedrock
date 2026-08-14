## Notes
- Add 128 end portals to the overworld
- From the second ring onward, place end portals instead strongholds
- On first the eye throw, generate All the portal locations

## Generate Mechanics
- Generate a random angle for each ring
- Offset the portals of each ring equally
- Save all the locations in a 2D array [[{x1, z1}, {x2, z2}], [{x3, z3}, {x4, z4}]]
- Format the coords as "x,z"
- Join the coords with spaces " "
- Join the rings with two spaces "  "
- Save in a dynamic property

## Locate Mechanics
- Get the player location
- Find the nearest 2 rings
- Find the nearest end portal of the 2 rings
- Measure the distance between the player and the nearest portal
- If the player is within less than 4 chunks, generate:
  - If First Ring: a stronghold
  - Else: an end portal
- Find the 12 portal frames
- Place a random number of eyes of ender
- Never place 12 eyes

## Rings
- First: 3 strongholds at 1280
- Second: 6 portals within 4352
- Third: 10 portals within 7424
- Fourth: 15 portals within 10496
- Fifth: 21 portals within 13568
- Sixth: 28 portals within 16640
- Seventh: 36 portals within 19712
- Eighth: 9 portals within 22784
