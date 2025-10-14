import { ActionFormData } from "@minecraft/server-ui" ;
import { world, system } from "@minecraft/server" ;
import { version, categories, quests, check_items } from "../achievements.js";
import { bookmark, open_book } from "../items/guidebook.js"

function is_unlocked(id, completed_achs) {
	const {parent} = quests[id]
	if (parent == undefined) return true   // doesn't have dependencies
	if (completed_achs.includes(id)) return true  // the quest itself is completed
	if (parent in quests) {
		return completed_achs.includes(parent)  // completed its one dependency
	}
	if (parent.includes('&')) {
	  const list = parent.slice(1, -1).split(' & ')
	  if (list.every(ach => ach in quests)) {
	    return list.every(ach => completed_achs.includes(ach)) // completed all of its dependencies
	  }
	}
	if (parent.includes('|')) {
	  const list = parent.slice(1, -1).split(' | ')
	  if (list.every(ach => ach in quests)) {
	    return list.some(ach => completed_achs.includes(ach)) // completed any of its dependencies
	  }
	}
	return true  // if the parent is malformed (for debugging)
}

export function complete(player, id) {
  const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')  // load
  if (completed_achs.includes(id)) return  // skip if completed
  completed_achs.push(id)  // add
  player.setDynamicProperty("completed_achs", JSON.stringify(completed_achs))  // save
  world.sendMessage({translate: 'achievements.announcement.message', with: [player.nameTag, quests[id].title]}) // announce
}

export function undo(player, id) {
  let completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')  // load
  completed_achs = completed_achs.filter(i => i != id)  // remove
  player.setDynamicProperty("completed_achs", JSON.stringify(completed_achs))  // save
}

function claim(player, id) {
	const reward = quests[id].reward[1]
	if (typeof reward == 'function') reward(player)  // execute the reward function
	else if (typeof reward == 'string') { // run the reward command
		player.runCommand('gamerule sendcommandfeedback false')
		player.runCommand(reward)
		player.runCommand('gamerule sendcommandfeedback true')
	}
	const claimed_rewards = JSON.parse(player.getDynamicProperty("claimed_rewards") ?? '[]')  // load
	claimed_rewards.push(id)  // add
	player.setDynamicProperty("claimed_rewards", JSON.stringify(claimed_rewards))  // save
}

function detect(player, id) {
	if (!('query' in quests[id])) return  // skip if it doesn't have a query
	const {query} = quests[id]
	if (query.constructor.name == 'AsyncFunction') {  // execute async queries
		system.run(async () => { if (await query(player)) complete(player, id)})
	} else if (query(player)) complete(player, id)  // execute the query function
}

function submit(player, id) {
	const consumed = quests[id].consume[1]
	const items = consumed.startsWith('[') ? consumed.replace(/\[|\]/g, '').split(', ') : [consumed]

	if (items.every(item => {  // if the player has every item
		const [id, count, data] = item.split(' ')
		return check_items(player, id, count, data)
	})) {
		items.forEach(item => {  // clear all of those items
			const [id, count, data] = item.split(' ')
			player.runCommand(`clear @s ${id} ${data ?? 0} ${count ?? 1}`)
		})
		complete(player, id)  // and complete the quest
	}
}

const active_challenges = {}
function start_challenge(player, id) {
	const {event, timer, callback} = quests[id].challenge
	if (event) active_challenges[`${player.id} ${id}`] = event.subscribe(callback(player, id))
	if (timer) active_challenges[`${player.id} ${id}`] = system.runInterval(callback(player, id, timer.time), timer.interval)
}

export function stop_challenge(player, id) {
	const {event, timer} = quests[id].challenge
	const run_id = active_challenges[`${player.id} ${id}`]
	if (event) event.unsubscribe(run_id)
	if (timer) system.clearRun(run_id)
	delete active_challenges[`${player.id} ${id}`]
}

system.runInterval(() => {  // detect quests automatically
	if (system.currentTick % [40, 1, 0][world.getDynamicProperty('auto_detection') ?? 0] != 0) return
	world.getAllPlayers().forEach(player => {
		const completed_achs = JSON.parse(player.getDynamicProperty("completed_achs") ?? '[]')
		Object.keys(quests)
		.filter(id => quests[id].query) // quest has a query
		.filter(id => !completed_achs.includes(id)) // quest isn't completed
		.filter(id => is_unlocked(id, completed_achs)) // quest is unlocked
		.forEach(id => detect(player, id))
	})
})

// allow other addons to complete quests
system.afterEvents.scriptEventReceive.subscribe(({id, message, sourceEntity:player}) => {
	if (id != "skybedrock:quests") return
	complete(player, message)
})

export function quests_menu(player, book) {
	const saved_category = player.getDynamicProperty("selected_ach_category")
	const category_id = saved_category && saved_category in categories ? saved_category : "skyblock"
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

	Object.entries(categories).forEach(([id, {icon}]) => {
		form.button({rawtext: [
			{text: `§${id == category_id ? 'selected_' : ''}category§`},
			{translate: `quests.category.${id}`}
		]}, `${icon}`)
	})

	const listed_quests = categories[category_id].list // get the quests text
	.split('\n') // get the quest ids
	.map(id => id.replaceAll('	', ''))
	.filter(id => id != '')
	.filter(id => view == "locked" ? !completed_achs.includes(id) : true)
	.filter(id => view == "done" ? completed_achs.includes(id) : true)
	.sort((a, b) => view == "done" ? completed_achs.indexOf(a) - completed_achs.indexOf(b) : 0)
	.filter(id => see_locked || is_unlocked(id, completed_achs))
	
	listed_quests.forEach(id => {
		const {title, icon, reward} = quests[id]
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
		const category_ids = Object.keys(categories)
		if (selection > 9 && selection - 10 < category_ids.length) {  // select a category
			player.setDynamicProperty("selected_ach_category", category_ids[selection - 10])
		}
		const id = listed_quests[selection - (category_ids.length + 10)]
		if (selection > category_ids.length + 9) {
		  	quest_screen(player, id, book) // view the quest
		} else quests_menu(player, book)
	}))
}

export function quest_screen(player, id, book) {
	const {title, icon, summary, reward, steps, note, consume, image, checkmark, query, challenge} = quests[id]
	const dynamic_list = (name) => JSON.parse(player.getDynamicProperty(name) ?? '[]')
	const is_done = dynamic_list("completed_achs").includes(id)
	const is_claimed = dynamic_list("claimed_rewards").includes(id)
	const is_locked = !is_unlocked(id, dynamic_list("completed_achs"))
	const background = is_done ? 'gold' : is_locked ? 'gray' : 'blue'
	
	const action =
	is_done ? reward && !is_claimed ? 'claim' : undefined :
	query ? 'detect' :
	consume ? 'submit' :
	challenge ? active_challenges[`${player.id} ${id}`] ? 'stop' : 'start' :
	checkmark ? 'complete' : undefined

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
	if (consume) form.label('§text§' + '§cSubmit:§r ' + consume[0])
	if (reward) form.label('§text§' + '§aReward:§r ' + reward[0])
		
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
				case 'start': start_challenge(player, id); break
				case 'stop': stop_challenge(player, id); break
				case "complete": complete(player, id); break
				case 'claim': claim(player, id); break
			}; quest_screen(player, id, book)
		}
	}))
}