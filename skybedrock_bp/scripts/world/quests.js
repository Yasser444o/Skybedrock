import { ActionFormData } from "@minecraft/server-ui" ;
import { world, system } from "@minecraft/server" ;
import { version, categories, queries, check_items, rewards, custom_challenges } from "../achievements.js";
import { bookmark, open_book } from "../items/guidebook.js"

function expand_ach(lines) {
  const find = (prefix) => lines.find(line => line.startsWith(prefix))?.replace(prefix, '')
  return {
    id: lines[0],
    icon: find('icon: '),
    title: find('title: '),
    parent: find('require: '),
    reward: find('reward: '),
	consume: find('consume: '),
	image: find('image: '),
    summary: find('* '),
    steps: lines.filter(line => line.startsWith('- ')).map(step => step.replace('- ', '')),
    note: lines.find(line => line.startsWith('(') && line.endsWith(')'))?.slice(1, -1),
  }
}

function flat_category(categories) {
  const achievements = {}
  Array.from(categories) //map -> [["id", "category"]]
  .map(cat => cat[1][1]) // -> ["categories"]
  .join('\n') // -> "category"
  .split('\n\n') // -> ["achs"]
  .forEach(ach => {
	const lines = ach.split('\n')
	achievements[lines[0]] = expand_ach(lines)
  }); return achievements
}

function is_unlocked(id, completed_achs) {
	const parent = achievements[id].parent
	const ids = Object.keys(achievements)
	if (parent == undefined) return true
	if (completed_achs.includes(id)) return true
	if (ids.includes(parent)) {
		return completed_achs.includes(parent)
	}
	if (parent.includes('&')) {
	  const list = parent.slice(1, -1).split(' & ')
	  if (list.every(ach => ids.includes(ach))) {
	    return list.every(ach => completed_achs.includes(ach))
	  }
	}
	if (parent.includes('|')) {
	  const list = parent.slice(1, -1).split(' | ')
	  if (list.every(ach => ids.includes(ach))) {
	    return list.some(ach => completed_achs.includes(ach))
	  }
	}
	return true
}

function is_disabled(id) {
	const parent = achievements[id].parent
	if (!parent) return
	if (parent.includes('&')) {
	  const list = parent.slice(1, -1).split(' & ')
	  return list.includes('locked')
	}
}

export function complete(player, id) { //load, add, save, announce
  const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')
  if (completed_achs.includes(id)) return
  completed_achs.push(id)
  player.setDynamicProperty("completed_achs", JSON.stringify(completed_achs))
  world.sendMessage({translate: 'achievements.announcement.message', with: [player.nameTag, achievements[id].title]})
}

export function undo(player, id) { //load, remove, save
  let completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')
  completed_achs = completed_achs.filter(i => i != id)
  player.setDynamicProperty("completed_achs", JSON.stringify(completed_achs))
}

function claim(player, id) { //load, add, save, give reward
	if (id in rewards) {
		rewards[id](player)
	} else { //old reward system
		const reward = achievements[id].reward.split(";")[0]
		player.runCommand('gamerule sendcommandfeedback false')
		player.runCommand(reward)
		player.runCommand('gamerule sendcommandfeedback true')
	}
	const claimed_rewards = JSON.parse(player.getDynamicProperty("claimed_rewards") ?? '[]')
	claimed_rewards.push(id)
	player.setDynamicProperty("claimed_rewards", JSON.stringify(claimed_rewards))
}

export const achievements = flat_category(categories)

function detect(player, id) {
	if (!(id in queries)) return
	const query = queries[id]
	if (query.constructor.name == 'AsyncFunction') {
		system.run(async () => { if (await query(player)) complete(player, id)})
	} else if (query(player)) complete(player, id)
}

function submit(player, id) {
	const consumed = achievements[id].consume?.split(';')[0]
	const items = consumed.startsWith('[') ? consumed.replace(/\[|\]/g, '').split(', ') : [consumed]

	if (items.every(item => {
		const [id, count, data] = item.split(' ')
		return check_items(player, id, count, data)
	})) {
		items.forEach(item => {
			const [id, count, data] = item.split(' ')
			player.runCommand(`clear @s ${id} ${data ?? 0} ${count ?? 1}`)
		})
		complete(player, id)
	}
}
//auto detect
system.runInterval(() => {
	if (system.currentTick % [40, 1, 0][world.getDynamicProperty('auto_detection') ?? 0] != 0) return
	world.getAllPlayers().forEach(player => {
		const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')
		Object.keys(queries)
		.filter(id => !completed_achs.includes(id)) //remove completed
		.filter(id => is_unlocked(id, completed_achs)) //remove locked
		.forEach(id => detect(player, id))
	})
})

system.afterEvents.scriptEventReceive.subscribe(({id, message, sourceEntity:player}) => {
	if (id != "skybedrock:quests") return
	complete(player, message)
})

export function quests_menu(player, book) {
	const saved_category = player.getDynamicProperty("selected_ach_category")
	const category_id = saved_category && categories.has(saved_category) ? saved_category : "skyblock"
	const view = player.getDynamicProperty("ach_view") ?? "all"
	const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]').reverse()
	const claimed_rewards = JSON.parse(player.getDynamicProperty("claimed_rewards") ?? '[]')
	const see_locked = player.getDynamicProperty("see_locked_achs")

	const form = new ActionFormData()
	.title({rawtext: [
		{text: '§quests_ui§' + '§4'},
		{translate: `guidebook.achievements.button`},
		{text: ' - §8'},
		{translate: `quests.category.${category_id}`},
		{text: ` §9- ${version}`}
	]})

	.button(book ? 'home' : '').button('').button(book ? 'bookmark' : '')
	.button('all').button('locked').button('done')
	.button('').button('').button('').button('')

	categories.forEach(([icon], category) => {
		form.button({rawtext: [
			{text: `§${category == category_id ? 'selected_' : ''}category§`},
			{translate: `quests.category.${category}`}
		]}, `${icon}`)
	})

	const quests = categories.get(category_id)[1] // get the quests text
	.split('\n\n') // separate the quests
	.map(quest => quest.split('\n')) //separate the quest lines
	.map(quest => quest[0]) // get the quest id
	.filter(id => view == "locked" ? !completed_achs.includes(id) : true)
	.filter(id => view == "done" ? completed_achs.includes(id) : true)
	.sort((a, b) => view == "done" ? completed_achs.indexOf(a) - completed_achs.indexOf(b) : 0)
	.filter(id => see_locked || is_unlocked(id, completed_achs))
	.filter(id => !is_disabled(id))
	
	quests.forEach(id => {
		const {title, icon, reward} = achievements[id]
		const is_done = completed_achs.includes(id)
		const is_locked = !is_unlocked(id, completed_achs)
		const has_reward = !claimed_rewards.includes(id) && is_done && reward
		form.button({rawtext: [
			{text: "§quest§"},
			{text: is_done ? "§done§" : is_locked ? "§locked§" : '§unlocked§'},
			{text: has_reward ? "§reward§" : ''},
			{text: title}
		]}, icon)
	})

	system.run(()=> form.show(player).then(({canceled, selection}) => {
		if (canceled) return
		switch (selection) {
			case 0: book ? open_book(player) : null; return // home
			case 2: book ? bookmark(player, 'Achievements') : null; return // bookmark
			case 3: player.setDynamicProperty("ach_view", "all"); break // all
			case 4: player.setDynamicProperty("ach_view", "locked"); break // locked
			case 5: player.setDynamicProperty("ach_view", "done"); break // done
		}
		if (selection > 9 && selection - 10 < categories.size) {  // select a category
			player.setDynamicProperty("selected_ach_category", Array.from(categories).map(id => id[0])[selection - 10])
		}
		const id = quests[selection - (categories.size + 10)]
		if (selection > categories.size + 9) { // view the quest
		  	book ? quest_screen(player, id, book) : quest_screen(player, id, book)
		} else quests_menu(player, book)
	}))
}

export function quest_screen(player, id, book) {
	const {title, icon, summary, reward, steps, note, consume, image} = achievements[id]
	const dynamic_list = (name) => JSON.parse(player.getDynamicProperty(name) ?? '[]')
	const is_done = dynamic_list("completed_achs").includes(id)
	const is_claimed = dynamic_list("claimed_rewards").includes(id)
	const is_locked = !is_unlocked(id, dynamic_list("completed_achs"))
	const background = is_done ? 'gold' : is_locked ? 'gray' : 'blue'
	
	const action =
	is_done ? reward && !is_claimed ? 'claim' : undefined :
	id in queries ? 'detect' :
	consume ? 'submit' :
	id in custom_challenges ? 'start' : 'complete'
	

	const form = new ActionFormData()
	.title("§quest_screen§" + title)
	.button(book ? 'home' : '').button('back').button(book ? 'bookmark' : '')
	.button('').button('').button('').button('').button('').button('').button('')

	.header(icon).header(background)
	.body(summary + (summary.endsWith(':') ? '' : '.'))
	
	if (action) form.button({rawtext: [
		{text: '§action§'},
		{translate: `quests.action.${action}`}
	]})

	
	if (steps.length) {
		form.divider()
		steps.forEach(step => form.label('§step§' + step))
	}
	
	if (note) form.label('§note§' + note)
	
	if (consume || reward) form.divider()
	if (consume) form.label('§text§' + '§cSubmit:§r ' + consume.split('; ')[1])
	if (reward) form.label('§text§' + '§aReward:§r ' + (rewards[id] ? reward : reward.split('; ')[1]))
		
	if (image) form.divider().label("§image§" + image)

	system.run(()=> form.show(player).then(({canceled, selection}) => {
		if (canceled) return
		switch(selection) {
			case 0: book ? open_book(player) : null; return // home
			case 1: quests_menu(player, book); return // back
			case 2: book ? bookmark(player, 'A: ' + title) : null; return // bookmark
			case 10: switch(action) {
				case 'detect': detect(player, id); break
				case 'submit': submit(player, id); break
				case 'start': custom_challenges[id](player); break
				case "complete": complete(player, id); break
				case 'claim': claim(player, id); break
			}; quest_screen(player, id, book)
		}
	}))
}