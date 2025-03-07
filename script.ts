//Definitely
// [x] tending to cat/dog takes too long as you progress.
// [x] keyboard icon not rendered correctly when added to person 'has' -- add .icon class
// [x] level of observation training should be shown....
// [x] level of self-starter behaviour should be shown...
// [ ] Self-starter -- should be infinite but with a big delay. Delay is smaller at higher levels.
// [ ] chain observations onto each self start 
// [ ] are observations now chained with self-start? seems too extreme.
// [ ] 🐛when in the store: only store messages should be shown
// [ ] indicate # items in a column if more than a minimum
// [no] Add icons to columns to make required skill clearer (tried it, couldn't make it work neatly on small mobile screens)
// [ ] Add to store: 
//  - headphones 🎧 
//  - Desk plant 🌳
//  - Desk cactus 🌵
//  - Games console 🕹
//  - Deluxe Games console 🎮
//  - Desk A/C ❄
//  - cookie 🍪
// [ ] Personal robot 🤖: 10000+ -- same as infinite self starter  - literally adds infinity symbol to self-starter icon?
// [ ] for dev/ba/test: If level > 9 -- use infinity symbol not a number
// [ ] 🐛Words wrap in store
// [ ] 🐛Icons and help icon are not vertically centered in store (other content is?)
// [ ] more technical names for tasks
// [ ] show (but disabled) buy dev / buy tester button when first starting
// [ ] keybinding -- letters to people

let testMode = false;//true;
let storeFeatureFlag = true;//testMode;
let debugOutput = (testMode || getParameterByName('debug') == "true");
let avgDuration = testMode ? 4 : 600; 
let startingMoney = testMode ? 100 : 100;
let game: Game;
if (debugOutput) {
  $id('debug').classList.remove('hidden');
  log('debug mode detected');
}

enum ItemCode {
  cat = 1,
  dog,
  upskillTest, 
  upskillDev, 
  upskillBA,
  observe,
  selfstart,
  seat, 
  coffee, 
  coffeemachine,
  cupcake,
  donut,
  pizza,
  banana,
  toast,
  keyboard,
  x_bafortest,//TODO: defer cross skilling items
  x_bafordev,//TODO: defer cross skilling items
  x_testforba,//TODO: defer cross skilling items
  x_testfordev,//TODO: defer cross skilling items
  x_devforba,//TODO: defer cross skilling items
  x_devfortest,//TODO: defer cross skilling items
  
  poster,//TODO: simple bling 
  crystalball,//TODO: simple bling 
  statue,//TODO: simple bling 
  statue2//TODO: simple bling 
  
}

function getAllLevelItems(): { [id: string]: StoreItem[]; } {
  //These are the items that become available in the store at each level.
  // Note that skillneeded includes the special value "any" which means it can be applied to any person.
  // TODO: ?? There could be a 'must not have skill' property... e.g. Beginning Development (only for non-developers)
  //The 'code' property is used in `function useIt` to decide how the card affects the player.
  let allItems: { [id: string]: StoreItem[]; } = 
      { "l2": //Level 2 Items
       [{id:10,name:'Tasty donut', price:5, icon:"🍩", skillneeded:"any", busy:false, code:ItemCode.donut, activeDuration:10, description: 'A sugary fix will speed you up... but not for long.', enabled:false},
       {id:12,name:'Mechanical keyboard upgrade', price:400, icon:"⌨", skillneeded:"any", busy:false, code:ItemCode.keyboard, activeDuration:30, description: 'This mechanical keyboard upgrade will boost your speed at every task.', enabled:false},
       ],
        "l3": //Level 3 Items
       [{id:20,name:'Upskill Developer: Efficiency Development Series', price:120, icon:"📗", skillneeded:"dev", busy:false, code:ItemCode.upskillDev, activeDuration:0, description:'Already a developer? This advanced training course will reduce the number of bugs you create.', enabled:false},
        {id:40,name:'Cup of coffee', price:10, icon:"☕", skillneeded:"any", busy:false, code:ItemCode.coffee, activeDuration:30, description: 'A cup of joe will speed up any worker ...if only for a little while.', enabled:false},      
       ],
        "l4":
       [
        {id:50,name:'Upskill Tester: Fast and Thorough Book Series', price:70, icon:"📘", skillneeded:"test", busy:false, code:ItemCode.upskillTest, activeDuration:0, description:'Already a tester? Be a better tester!', enabled:false},

        //{id:60,name:'Cross Skill: Tester to BA', price:300, icon:"📕", skillneeded:"test", busy:false, code:ItemCode.bafortest, activeDuration:50, description:'Any tester can learn to be a business analysis with this exciting new course from Thinkstra™.', enabled:false},
        {id:90,name:'Pizza', price:50, icon:"🍕", skillneeded:"any", busy:false, code:ItemCode.pizza, activeDuration:50, description: 'Trap your workers in the office by giving them no reason to leave', enabled:false},
        {id:100,name:'Banana', price:25, icon:"🍌", skillneeded:"any", busy:false, code:ItemCode.banana, activeDuration:20, description: 'This healthy snack gives a short-lived energy boost', enabled:false},
        {id:105,name:'Cupcake', price:100, icon:"🧁", skillneeded:"any", busy:false, code:ItemCode.cupcake, activeDuration:10, description: 'A cupcake to enjoy. Increase motivation, but not for long.', enabled:false},

      ],
        "l5":
       [
        {id:107,name:'Upskill BA: Powerful communication book series', price:70, icon:"📕", skillneeded:"ba", busy:false, code:ItemCode.upskillBA, activeDuration:0, description:'Improves your Business Analysis Skills, for faster better work!', enabled:false},
        {id:110,name:'Self-Starter', price:500, icon:"🚀", skillneeded:"any", busy:false, code:ItemCode.selfstart, activeDuration:0, description: 'When you\'re idle, go and check the board to see if there is anything you can do.', enabled:false},

        {id:120,name:'Office Cat', price:5000, icon:"🐱", skillneeded:"any", busy:false, code:ItemCode.cat, activeDuration:200, description:'This friendly feline will vastly improve the quality of one person\'s work at a time.', enabled:false},
        {id:130,name:'Observation Training', price:200, icon:"🕵️‍♀️", skillneeded:"any", busy:false, code:ItemCode.observe, activeDuration:0, description:'When a person finishes a card, train them to look for another card. If trained multiple times, they will look for multiple cards.', enabled:false},
        
       ],
        "l6":
       [
        {id:150,name:'Seat upgrade', price:400, icon:"💺", skillneeded:"any", busy:false, code:ItemCode.seat, activeDuration:0, description: 'A comfortable seat upgrade makes any worker more efficient.', enabled:false},

       ],
       "l7":
       [
        {id:160,name:'Office Dog', price:6000, icon:"🐶", skillneeded:"any", busy:false, code:ItemCode.dog, activeDuration:200, description:'Bring joy and efficiency to the workplace. Care for a dog and double your speed', enabled:false},
 
       ],
       "l8":
       [
        {id:170,name:'Piece of Toast', price:10, icon:"🍞", skillneeded:"any", busy:false, code:ItemCode.toast, activeDuration:15, description: 'It\'s a piece of toast. How much could it be?', enabled:false},

       ],
       "l9":
       [

       ],
       "l10":
       [
        {id:180,name:'Coffee machine', price:4000, icon:"⛽", skillneeded:"any", busy:false, code:ItemCode.coffeemachine, activeDuration:30, description: 'A coffee machine at your desk, your performance will be irreparably improved.', enabled:false},

       ],
       "l11":
       [
        {id:200,name:'Inspirational poster', price:30000, icon:"🌄", skillneeded:"any", busy:false, code:ItemCode.poster, activeDuration:0, description: 'Enhance your cubicle and improve your concentration.', enabled:false},

       ],
       "l12":
       [

       ],
       "l13":
       [

       ],
       "l14":
       [

       ],
       "l15":
       [
        {id:220,name:'Mystical Statue', price:40000, icon:"🗿", skillneeded:"any", busy:false, code:ItemCode.statue2, activeDuration:0, description: 'Mystical statue improves your workplace.', enabled:false},
       ],
       "l16":
       [
       ],
       "l17":
       [

       ],
       "l18":
       [
        {id:300,name:'Awe inspiring statue', price:80000, icon:"🗽", skillneeded:"any", busy:false, code:ItemCode.statue, activeDuration:0, description: 'Can this statue fill your workplace with wonder, joy and hard work?', enabled:false},

       ],
       "l19":
       [

       ],
       "l20":
       [

       ],
       "l21":
       [
        {id:350,name:'Crystal ball', price:100000, icon:"🔮", skillneeded:"any", busy:false, code:ItemCode.crystalball, activeDuration:0, description: 'This crystal ball does not tell the future, but it\'s a nice desk ornament.', enabled:false},

       ],
      };

  return allItems;
}

/*
 defer: some things like a packet of cookies or a packet of donuts -- have a qty... 


  🍔🥗🍪
  

    - Desk bling 💎
    - Stuffed flatbread 🥙
    - Desk ornament 
		- Personal Robot 🤖
	
		- Fax machine 📠
		- Printer 🖨


*/


interface PersonType {
  skill: string;
  price: number;
  icon: string;
  title: string;
}

function getAllPeopleTypes() : { [id:string]: PersonType; } {
  return { 
      "dev": { skill: "dev", price: 150, icon:"💻", title: "dev"},
      "test": {skill: "test", price: 200, icon:"🔬", title: "tester"},
      "ba": {skill: "ba", price:250, icon:"🗣", title: "business analyst"}
    };
}
class Game {
  constructor(startingMoney: number) {
    this.Money = startingMoney;
    this.HighestMoney = startingMoney;
    this.Inflation = testMode? 1.3 : 1.3; // 30 %
    this.SmallInflation = testMode? 1.05 : 1.05; // 5 %
    this.MediumInflation = testMode? 1.10 : 1.10; // 10 %
    this.HyperInflation = testMode? 3 : 3; //300%
    this.Level = 1;
    this.XP = 0;
    this.TotalXP = 0;
    this.LevelUpXP = testMode ? 40 : 40; //this grows by game.Inflation % each time (in function LevelUp)
    this.PointPrice = 25;
    this.ProjectSize = 6;
    this.LeadPrice = 100;
    this.NextId = 0;
    this.People = {};
    this.Stories = {};
    this.Projects = {};

    this.AllLevelItems = getAllLevelItems();
    this.StoreItems = {};
    for(var k in this.AllLevelItems){
      for(var x in this.AllLevelItems[k]){
        this.StoreItems[this.AllLevelItems[k][x].id] = this.AllLevelItems[k][x];
      }
    }
    
    //this.StoreItems =  getAllLevelitems().each()
    

    this.AllPeopleTypes = getAllPeopleTypes();
    this.Items = {};
    this.SelectedDoer = null;
    this.SelectedReceiver = null;
    this.DefaultSelfStartDelay = testMode? 100 : 3000; //3 second pause between polling the board.
    this.AnimalTendingDelay = 2600;
  }
  Money: number;
  HighestMoney: number;
  Inflation: number;
  SmallInflation: number;
  MediumInflation: number;
  HyperInflation: number; 
  Level: number;
  XP: number;
  LevelUpXP: number;
  PointPrice: number; // how many $'s paid for one point? (increases as game progresses.)
  ProjectSize: number; // how many points is a project generally worth (at the current level)
  LeadPrice: number;
  TotalXP: number;
  NextId: number; // TODO: private. used for determining primary key of staff members (inside the 'nextId' function)
  People: { [id: string] : Person; }; //id's start with "p"
  Projects: { [id: string] : Project; } // id's start with "r"
  Stories: { [id: string] : Story; };// id's start with "r"
  AllLevelItems: { [id: string]: StoreItem[]; } // all possible store items, grouped by the level where they become available
  AllPeopleTypes: { [id:string]: PersonType; } // the skills
  StoreItems: { [id:string]: StoreItem;} // the items that are currently available in the store.
  Items: { [id: string]: StoreItem; } //all items that have been purchased and added to the game, start with "i"
  SelectedDoer: string; //id of selected person
  SelectedReceiver: string; //id of selected story
  DefaultSelfStartDelay: number;
  AnimalTendingDelay: number; // how long does it take to settle an animal down at your desk. (Can this involve the following emoji? 💩)
}


interface SkillDetail {
  level:number;
}


interface Person {
  id: number;
  //skills: string[];
  skills: { [id:string]: SkillDetail;}
  name: string;
  summary: string;
  icon: string;
  //efficiency: number;
  XP: number;
  busy: boolean;
  observantLevel: number; // how observant is this person?
  observeNow: number; // this number counts down from observantLevel to 0, each time an extra story is grabbed off the board.
  selfStarterLevel: number;
  selfStartNow: number; // this number counts down from selfStartLevel to 0, each time they are looking for work to do.
  selfStartDelay:number; //how long they wait between polling the board (shorter numbers are faster)
  seatLevel: number; //how good is your seat?
  keyboardLevel: number; //how good is your keyboard?
  has: { [id:string] : StoreItem; } // coffee, donuts and puppies go here.
}

interface IReceiver {
  skillneeded:string;
  busy:boolean;
}


interface Story {
  person: string;
  id: number;
  skillneeded: string;
  //column: string;
  status: string;
  busy: boolean;
  summary: string;
  points: number;
  logo: string; //logo from the project.
  icon: string; //icon from the person.
  hasBug: boolean;
  hasSpecBug: boolean;
  customerFoundBug: boolean;
  rework: boolean;  // when a card is being reworked due to a found bug or spec bug, it is rework. (And is less time than the original work). 
  projectId: string; //contains 'r'
  pointPrice: number;
}

interface StoreItem {
  id: number;
  name: string;
  price: number;
  icon: string;
  skillneeded: string;
  busy: boolean;
  code: ItemCode; //'code' is a short, readable, ID, such as 'dog' that is used in a switch statement somewhere for all the deep logic/capabilities of StoreItems... as they can ultimately do anything. TODO: consider an enum for this.
  //skillBoost: string; 
  //category: training/equipment
  description: string;
  activeDuration: number; //how long does the item act on the person? (0 for indefinitely)
  enabled:boolean;
}

class Project {
  constructor(lead: Story){
    this.lead = lead;
    this.stories = [];
  }
  lead: Story; // the sales lead that sparked this project
  stories: string[] = []; //storyid's of the subsequent stories created by the BA (start with 'r')
}

function initGameState():void
{
  game = new Game(startingMoney);
  let allSkills = 
    {
      "dev": { level: 1},
      "test": {level: 1},
      "ba": {level: 1}
    };
  
  let player: Person = { id: nextId(), skills: allSkills, name: "Founder", summary: "💤", icon:"🤔", XP: 0, busy: false, observantLevel: 0, selfStarterLevel: 0, selfStartNow: 0, observeNow: 0, has: {}, seatLevel: 0, keyboardLevel:0, selfStartDelay: game.DefaultSelfStartDelay};
  game.People['p' + player.id] = player;
  incrementXP(0);
  incrementMoney(0);
}

// todo: put this function onto the game object
function nextId():number {
  return ++game.NextId;
}

function drawRoom():void {
  drawPeople(game.People);
  drawStories(game.Stories);
  drawMoney(game.Money);
  drawButtons();
}

function drawButtons():void {
//  <div class='button getLead hidden' onclick='getNewLead();' title='Advertise and find a project to do!'>🎁 find project (💲100)</div>
  let getLead = $id('getLead');
  getLead.innerHTML = `🎁 find project (💲${game.LeadPrice})`;

  for(let[key, value] of Object.entries(game.AllPeopleTypes)) {
    let d = $id(`get${value.skill}`);
    if (d != undefined) {
      d.innerHTML = `<span class='icon'>${value.icon}</span> hire ${value.title} (💲${value.price})`;
      d.setAttribute('onclick', `getNewPerson("${value.skill}");`);    
    }
  }
  
}

function drawMoney(money: number):void {
  let s = document.getElementById('money');
  if (money < 0) {
    s.classList.add("negative");
  } else {
    s.classList.remove("negative");
  }
  s.innerText = "💲" + money;
}

function drawXP(xp: number, levelUpXP:number, level: number):void {
  let s = document.getElementById('xp');
  if (xp < 0) {
    s.classList.add("negative");
  } else {
    s.classList.remove("negative");
  }

  s.innerText = "" + xp + "/" + levelUpXP + "🥓";

  let s2 = document.getElementById('level');
  s2.innerText = "" + level + "🥑";
}

function removeStory(key: string):void {
  const el = document.getElementById('kanbanboard');
  let s = el.querySelector('#' + key);
  s.parentNode.removeChild(s);
}

function drawStory(key: string, stories: { [x: string]: Story; }, top: boolean):void {
  const el = document.getElementById('kanbanboard');
  let s = el.querySelector('#' + key);
  let avatar = "";
  let busy = "";
  let story = stories[key];
  if (story.icon != undefined) {
    avatar = "<span class='avatar'>" + story.icon + "</span>";
  }
  let logo = `<span class='logo'>${story.logo}</span>`;
  if (debugOutput) {
    logo += `<span class='secrets'>${story.hasBug? "🐛":""}${story.hasSpecBug? "💥":""}</span>`;
  }
  if (story.busy) {
    busy = " busy";
  }

  let points = "<span class='points'>" + story.points + "</span>";

  //if the story is done, don't add a click handler.
  let handler = story.skillneeded == "done" ? "" : `onclick='clickReceiver(\"${key}\");'`;

  let shtml = `<span class='story receiver ${story.skillneeded}${busy}' id='${key}' ${handler}><span class='story-detail'>${logo} ${story.summary}</span>${avatar}${points}</span>`;

  if (s != null) {
    s.outerHTML = shtml;
  } else {
    let column = el.querySelector("td#" + story.skillneeded + " .inner");
    let newstory = htmlToElement(shtml);
    if (top) {
      column.insertBefore(newstory, column.firstChild)
    } else {
      column.appendChild(newstory);
    }
  }
}

function drawStories(stories: {[id: string] : Story}):void {
  for(const key in stories) {
    drawStory(key, stories, stories[key].rework);
  }
}

function drawInboxItem(key: string, item: StoreItem):void {
  let el = $id('kanbanboard')
  let s = el.querySelector('#' + key);

  let shtml = `<span class='storeItem receiver ${item.skillneeded}' id='${key}' onclick="clickReceiver(\'${key}\');"><span class='storeitem-icon'>${item.icon}</span> ${item.name}</span>`;
  if (s != null) {
    s.outerHTML = shtml;
  } else {
    let column = el.querySelector("td#ba .inner");
    let newInboxItem = htmlToElement(shtml);
    // put it at the top of the inbox column (the 'ba' column)
    column.insertBefore(newInboxItem, column.firstChild)
  }
}

function drawPerson(key: string, people: { [x: string]: Person; }):void {
  let el = document.getElementById('people');
  let p = el.querySelector('#' + key);
  //if the person is listed in #id already then update it.
  let newPerson = true;
  if (p != null) {
    newPerson = false;
  }
  let busy = "";
  let person = people[key];
  if (person.busy) {
    busy = " busy";
  }
  let skillsDiv = getSkillsDiv(person.skills);
  let itemsHtml = getItemsHtml(person);
  
  let phtml = "<span class='person doer" + busy + "' id='" + key + "' onclick='clickDoer(\"" + key + "\");'><span class='avatar2'>" + person.icon + "</span><div class='name'>" + person.name + "</div>" + skillsDiv + " " + itemsHtml + "<div class='summary'>" + person.summary + "</div></span>";
  let newPersonElement = htmlToElement(phtml);

  for (let key of Object.keys(person.skills)) {
    newPersonElement.classList.add(key);
  }
  
  if (newPerson) {
    el.appendChild(newPersonElement);
  } else {
    p.outerHTML = newPersonElement.outerHTML;
  }
}

function getItemsHtml(person:Person):string{
  //was: return = Object.keys(items).map(k => items[k].icon).join(" ");
  let result = '';
  
  for(const itemKey of Object.keys(person.has)) {
    let item = person.has[itemKey];
    let levelAttribute = '';
    if (item.code == ItemCode.seat) levelAttribute=` data-level='${person.seatLevel}'`;
    if (item.code == ItemCode.observe) levelAttribute=` data-level='${person.observantLevel}'`;
    if (item.code == ItemCode.selfstart) levelAttribute=` data-level='${person.selfStarterLevel}'`;
    if (item.code == ItemCode.keyboard) levelAttribute=` data-level='${person.keyboardLevel}'`;


    result += `<span class='icon'${levelAttribute}>${item.icon}</span>`;
  }
  if (result === '') return result;

  return `<div class='itemList'>${result}</div>`;
}

function getSkillsDiv(skills: {[id:string]: SkillDetail}):string {
  let result = "";
  for (let[key, value] of Object.entries(skills)) {
    let s1 = "";
    switch(key) {
      case "dev": s1 = `<span class='skill dev dev-${value.level}' data-level='${value.level}' title='developer'>💻</span>`;
        break;
      case "test": s1= `<span class='skill test test-${value.level}' data-level='${value.level}' title='tester'>🔬</span>`;
        break;
      case "ba": s1 = `<span class='skill ba ba-${value.level}' data-level='${value.level}' title='business analyst'>🗣</span>`;
        break;
    }

    result += s1;
  }
  return "<div class='skills'>" + result + "</div>";
}

function drawPeople(people: { [id: string] : Person; }):void {
  for(const key in people) {
     drawPerson(key, people);
  }
}

function go():void {
  initGameState();
  drawRoom();
  $id('start').classList.add("hidden");   //hide 'start' button
  removeClass('#getLead', 'hidden'); //show 'purchase sales lead' button
  addClass(".getPerson", 'hidden'); //hide 'buy dev/test/ba' buttons. (They are re-enabled when total >= 300)
  drawMessage("STEP 1: press '🎁 find project'");
}

function getNewLead():void {
  
  DeSelectDoerAndReceiver();

  let price = game.LeadPrice;
  
  if (game.Money < 0) {
    drawMessage("Will need to go FURTHER into debt to get this lead.");
  } else if (game.Money < price) {
    drawMessage("Will need to go into debt to get this lead.");
  }

  incrementMoney(price * -1);
  incrementXP(5);
  // TODO: instead of 10 points and value 1000....
  // should be based on current level... some randomness.
  let newLead = { id: nextId(), points:game.ProjectSize, pointPrice:game.PointPrice, value:1000, status:"lead", skillneeded:"ba", summary:projectName(), logo: getLogo() , person: null, busy: false, icon: null, hasBug: false, hasSpecBug: false, customerFoundBug: null, projectId: null, rework:false};
  if (isEmpty(game.Stories)) {
    // this was the first lead ever! give them a tip...
    drawMessage("STEP 2: Click the project " + newLead.logo + ", then click the Founder " + game.People["p1"].icon + " (or vice-versa)");
  }

  game.Stories['r' + newLead.id] = newLead;
  drawStory('r' + newLead.id, game.Stories, false);
  game.LeadPrice = Inflate(game.SmallInflation, game.LeadPrice);

  let roi = (game.ProjectSize * game.PointPrice * 1.5) / game.LeadPrice;
  if (roi < 2 || roi > 4.5) {
    log(`Roi was ${roi}, from: return = ${Math.floor(game.ProjectSize * game.PointPrice * 1.5)}, investment = ${game.LeadPrice}... so it has been adjusted.`);
    game.LeadPrice = Math.floor((game.ProjectSize * game.PointPrice * 1.5) / 2.5);
  } else {
    log(`Roi is ${roi}`);
  }

  drawButtons();

}


function DeSelectDoerAndReceiver():void {
  deselectDoer();
  deselectReceiver();
}

function getNewPerson(skill: string):void {
  DeSelectDoerAndReceiver();

  let personType = game.AllPeopleTypes[skill];
  if (game.Money < personType.price) {
    drawMessage(`Cannot afford a new ${personType.title}.`);
    return;
  }
  
  removeClass('.getPerson.' + skill, 'hint');

  incrementMoney(personType.price * -1);
  incrementXP(10);
  let id = nextId();
  let skillo = {};
  skillo[skill] = { level: 1};
  let newEmployee: Person = { id: id, skills: skillo, summary: "💤", icon: getIcon(), name: getName(), XP: 0, busy: false, observantLevel: 0, selfStarterLevel: 0, selfStartNow: 0, observeNow: 0, has: {}, seatLevel: 0, keyboardLevel:0, selfStartDelay: game.DefaultSelfStartDelay};
  game.People['p' + id] = newEmployee;
  drawPerson('p' + id, game.People);
  // Every time you hire a person the price for that type inflates by a LOT.
  personType.price = Inflate(game.HyperInflation, personType.price);
  drawButtons();

}

function clickFirstAvailableCard(column:string):void{
  let columnCards = $(`#${column} .inner .receiver:not(.busy)`);
  if (columnCards && columnCards.length > 0) {
    clickReceiver(columnCards[0].id);
  }
}

document.onkeypress = function(e):void {
  switch (e.key) {
    case "1":
      clickFirstAvailableCard('ba');
      break;
    case "2":
      clickFirstAvailableCard('dev');
      break;
    case "3":
      break;
    case "4":
      clickFirstAvailableCard('test');
      break;
    case "5":
      break;
  }
}

function updatePossible():void {
  if (game.SelectedDoer != undefined && game.SelectedDoer != null) {
    //As a 'doer' -- highlight everything I can do.  (where not busy)
    let skills = game.People[game.SelectedDoer].skills;
    //for(const skill of game.People[game.SelectedDoer].skills) {
    for(let key of Object.keys(skills)) {
      log(key);
      addClass("." + key + ".receiver:not(.busy)", 'possible');
    }

    addClass(".any.receiver:not(.busy)", 'possible');
  }

  // As a 'receiver' -- highlight everything that can do this (where not busy)
  if (game.SelectedReceiver != undefined && game.SelectedReceiver != null) {
    let receiver:IReceiver = game.Stories[game.SelectedReceiver] || game.Items[game.SelectedReceiver];
    if (receiver.skillneeded == "any") {
      addClass(".doer:not(.busy)", 'possible');
    } else {
      //alert(receiver.skillneeded);
      addClass("." + receiver.skillneeded + ".doer:not(.busy)", 'possible');
    }
  }
}

function deselectDoer():void {
  if (game.SelectedDoer == undefined || game.SelectedDoer == null) return;

  let doer = $id(game.SelectedDoer);

  game.SelectedDoer = null;
  
  if (doer == undefined) return;

  doer.classList.remove('selected');
  removeAllClass("possible");
  updatePossible();
}

function selectDoer():void {
  $id(game.SelectedDoer).classList.add('selected');
  updatePossible();
}

function clickDoer(id: string) {
  
  // can't select (or deselect) a busy person.
  if (game.People[id].busy) {
    log("can't select (or deselect) a busy item. (" + game.People[id].name + " " + game.People[id].icon + ")");
    return;
  }

  if (game.SelectedDoer == id) {
    deselectDoer();
    return;
  }

  if (game.SelectedDoer != undefined) {
    deselectDoer();
  }

  game.SelectedDoer = id;
  selectDoer();

  if (game.SelectedReceiver != undefined && game.SelectedDoer != undefined) {
    tryDo(game.SelectedDoer, game.SelectedReceiver, true);
  }
}

function deselectReceiver():void {
  if (game.SelectedReceiver == undefined || game.SelectedReceiver == null) return;

  let receiver = $id(game.SelectedReceiver);

  game.SelectedReceiver = null;

  if (receiver == undefined) return;
  
  receiver.classList.remove('selected');

  removeAllClass("possible");
  updatePossible();
}

function selectReceiver() {
  $id(game.SelectedReceiver).classList.add('selected');
  updatePossible();
}

function clickReceiver(id: string) {

  let clickedReceiver = game.Stories[id] || game.Items[id];
  if (clickedReceiver.busy == true) {
    log("can't select (or deselect) a busy item. (" + clickedReceiver.icon + ")");
    return;
  }

  if (game.SelectedReceiver == id) {
    deselectReceiver();
    return;
  }

  if (game.SelectedReceiver != undefined) {
    deselectReceiver();
  }

  game.SelectedReceiver = id;
  selectReceiver();
  
  if (game.SelectedReceiver != undefined && game.SelectedDoer != undefined) {
    tryDo(game.SelectedDoer, game.SelectedReceiver, false);
  }
}

function tryDo(doId: string, receiverId: string, viaDoer: boolean) {
  let doer = game.People[doId];
  let receiver = game.Stories[receiverId] || game.Items[receiverId];
  
  if (receiver.skillneeded != "any" && !Object.keys(doer.skills).includes(receiver.skillneeded)) {
    if (viaDoer) {
      deselectReceiver();
    } else {
      deselectDoer();
    }
    return;
  }

  if (doer.busy) {
    console.log("doer is busy");
  }
  if (receiver.busy) {
    console.log("receiver is busy");
  }

  if (doer.busy || receiver.busy) {
    return;
  }

  //doer will now do the receiver thing.
  $id(game.SelectedReceiver).classList.remove('selected');
  $id(game.SelectedDoer).classList.remove('selected');
  removeAllClass("possible");
  game.SelectedReceiver = null;
  game.SelectedDoer = null;


  doer.selfStartNow = doer.selfStarterLevel;
  doer.observeNow = doer.observantLevel;

  doIt(doId, receiverId);
}

function useIt(doId: string, item: StoreItem){
  let person = game.People[doId];
  //drawMessage(`${person.name} ${person.icon} is gonna use ${item.name} ${item.icon}`);
  //log(`${person.name} ${person.icon} is gonna use ${item.name} ${item.icon}`);
  //alert('person ' + doId + ' is gonna use the ' + JSON.stringify(item));
  applyItem(person, item);
  drawPerson('p' + person.id, game.People);
  removeStory('i' + item.id);
}

function applyItem(person:Person, item:StoreItem) {
  switch(item.code){
    case ItemCode.observe:
      person.observantLevel++;
      if (person.observantLevel == 1){
        person.has['i'+item.id] = item;
        drawMessage(`${person.name} ${person.icon} is now observant 🔍.`);
      } else {
        drawMessage(`${person.name} ${person.icon} is now more observant 🔍 (level ${person.observantLevel}).`);
      }
      break;
    case ItemCode.selfstart:
      person.selfStarterLevel++;
      if (person.selfStarterLevel == 1) {
        person.has['i'+item.id] = item;
        drawMessage(`${person.name} ${person.icon} is now a self-starter.`);
      } else {
        drawMessage(`${person.name} ${person.icon} is now a self-starter (level ${person.selfStarterLevel}).`);
      }
      person.selfStartNow = person.selfStarterLevel;
      if (person.busy == false) {
        personFree(person);
      }
      break;
    case ItemCode.seat:  
      person.seatLevel++;
      if (person.seatLevel == 1) {
        person.has['i'+item.id] = item;
      }
      break;
    case ItemCode.keyboard:
      person.keyboardLevel++;
      if (person.keyboardLevel == 1) {
        person.has['i'+item.id] = item;
      }
      break;
    case ItemCode.upskillTest:
      if (person.skills["test"] != undefined) {
        person.skills["test"].level++;
      } else {
        person.skills["test"] = { level: 1};
      }
      break;
    case ItemCode.upskillDev:
      if (person.skills["dev"] != undefined) {
        person.skills["dev"].level++;
      } else {
        person.skills["dev"] = { level: 1};
      }
      break; 
    case ItemCode.upskillBA:
        if (person.skills["ba"] != undefined) {
          person.skills["ba"].level++;
        } else {
          person.skills["ba"] = { level: 1};
        }
        break;
    case ItemCode.dog:
    case ItemCode.cat:
      //dog and cat make you busy....
      if (item.code == ItemCode.cat) item.icon = randomItem(catIcons);
      if (item.code == ItemCode.dog) item.icon = randomItem(dogIcons);

      person.busy = true;
      person.summary = `Tending to the ${item.name}` ;
      drawMessage(`${person.name} ${person.icon} has the ${item.icon} ${item.name}`);
      setTimeout(function() { usingFinishedBusyPhase(person, item);}, game.AnimalTendingDelay); 
      setTimeout(function() { usingFinished(person, item);}, item.activeDuration*500);
      
      // length of time cat/dog spends with someone increase each time they visit. (Controversial?)
      item.activeDuration *= 1.25;
      person.has['i'+item.id] = item;
      break;
    case ItemCode.banana:
    case ItemCode.toast:
    case ItemCode.coffee:
    case ItemCode.coffeemachine:
    case ItemCode.cupcake:
    case ItemCode.donut:
    case ItemCode.pizza:
    case ItemCode.crystalball:
    case ItemCode.poster:
    case ItemCode.statue:
    case ItemCode.statue2:
      person.has['i'+item.id] = item;
      if (item.activeDuration > 0) {
        setTimeout(function() { usingFinished(person, item);}, item.activeDuration*1000);
      }
      break;
    default:
      log("Unhandled item type! " + item.icon + " " + item.code + " " + item.name);    
  }
}

// Some items (like the dog and the cat) have a short initially 'busy' phase after you grab them. 
// Once that finishes, 
function usingFinishedBusyPhase(person:Person, item:StoreItem) {
  person.busy = false;
  person.summary = "💤";
  drawPerson('p' + person.id, game.People);
  personFree(person);
}

function personFree(person:Person) {
  log(`${person.name} ${person.icon} is now free`);
  if (person.selfStarterLevel > 0 && person.selfStartNow > 0) {
    // show this many eyes, that count down each time they check the board...
    person.summary = "👁".repeat(person.selfStartNow);
    drawPerson('p' + person.id, game.People);
    let delay = person.selfStartDelay;
    if (personHas(person, ItemCode.dog)) delay = delay / 2;
    log(`Will check board in ${delay}`);
    setTimeout(function() { selfStart(person);}, delay);
  }
}


function columnName(skill:string):string{
  switch(skill) {
    case "ba": return "inbox";
    case "dev": return "backlog";
    case "dev0": return "dev";
    case "test": return "test";
    case "done": return "done";
  }
}
function selfStart(person:Person){
  //Now I will go and see if there are any cards on the board that I believe are worthy of my attention.
  //TODO:
  log("Self starter is awake...");
  log(person.name + " " + person.icon + " is busy? " + person.busy + "; Start now? " + person.selfStartNow);
  if (!person.busy && person.selfStartNow > 0) {
    person.selfStartNow--;
    log(`${person.name} ${person.icon} is checking the board now....`);
    //TODO: implement this. And log above instead of 'drawmessage'  
    //TODO: get accurate skillneeded.... and make it a story
    let columns:string[] = [];

    // we prioritise self-starting from the back of the board.
    if (person.skills["test"] && person.skills["test"].level > 0) {
      columns.push("test");
    }
    if (person.skills["dev"] && person.skills["dev"].level > 0) {
      columns.push("dev");
    }
    if (person.skills["ba"] && person.skills["ba"].level > 0) {
      columns.push("ba");
    }

    if (columns.length == 0)  log(`${person.name} ${person.icon} has no skills worth a damn, apparently!`);

    //check each column in the order of the array columns.
    for(let column of columns) {
      let nextCards = $(`#${column} .inner .story.receiver:not(.busy)`);
      if (nextCards.length > 0) {
        let nextCardId = nextCards[0].id;
        log(`${person.name} ${person.icon} is doing ${game.Stories[nextCardId].summary}`);
        doIt('p' + person.id, nextCardId);
        break;
      }
    }
    
  }

  if (!person.busy) {
    if (person.selfStartNow > 0) {
      // show this many eyes, that count down each time they check the board...
      person.summary = "👁".repeat(person.selfStartNow);
      let delay = person.selfStartDelay;
      if (personHas(person, ItemCode.dog)) delay = delay/2;
      log(`Will check board in ${person.selfStartDelay}`);
      setTimeout(function() { selfStart(person);}, delay);
    } else {
      person.summary = "💤";
    }

    drawPerson('p' + person.id, game.People);
  }
}

function usingFinished(person:Person, item:StoreItem) {
  //person.has['i'+item.id] = undefined;
  //jalert(person.has);
  delete person.has['i'+item.id];
  //jalert(person.has);
  
  // the office cat and the office dog return to the in-tray when you are finished with them.
  switch(item.code){
    case ItemCode.dog:
    case ItemCode.cat:
        drawInboxItem('i' + item.id, item);
        drawMessage(item.name + ' ' + item.icon + ' has left ' + person.name + ' ' + person.icon + ' and is back to the inbox');
        break;
  } 

  drawPerson('p' + person.id, game.People);

}

function doIt(doId: string, receiverId: string) {
  let story = game.Stories[receiverId];
  if (story == undefined) {
    let item = game.Items[receiverId];
    if (item == undefined) {
      log("Cannot work out what the receiver is!");
      return;
    }

    useIt(doId, item);
    return;
  }

  
  let person = game.People[doId];


  story.busy = true;
  story.icon = person.icon;
  story.person = doId;
  person.busy = true;
  person.summary = getSummary(story);
  drawMessage(person.name + " is " + person.summary);
  drawPerson(doId, game.People);
  drawStory(receiverId, game.Stories, story.rework);
  let duration = getDuration(person, story);
  
  log("Duration: of " + story.summary + " " + story.skillneeded + ": " + Math.floor(duration));
  setTimeout(function() { done(receiverId);}, duration);
}

function getBuginess(person:Person, skill:string):number {
  // see also function canFindBug
  let efficiency = getEfficiency(person, skill);
  // efficiency is from 0.3 to 0.999
  let result = 1 - (0.57 + (efficiency * 3/7));
  // efficiency = 0.3 gives buginess of 0.3
  // efficiency = 0.999 gives buginess of 0.005
  return result;
}

function getEfficiency(person:Person, skill:string):number {
  log("skill:" + skill);
  let level = 0;
  if (skill == "dev0") skill = "dev";

  if (!person.skills[skill]) return 0.3; //skill not found? same as level 1

  level = person.skills[skill].level;

  level += person.seatLevel;
  level += person.keyboardLevel;
  if (personHas(person, ItemCode.cupcake)) level++;
  if (personHas(person, ItemCode.donut)) level++;
  if (personHas(person, ItemCode.pizza)) level++;
  if (personHas(person, ItemCode.banana)) level++;
  if (personHas(person, ItemCode.keyboard)) level++;
  //twice the power!!
  if (personHas(person, ItemCode.coffee) || personHas(person, ItemCode.coffeemachine)) level = level + 2;
  
  switch (level) {
    case 0: return 0;
    case 1 : return 0.3;
    case 2 : return 0.4;
    case 3 : return 0.5;
    case 4 : return 0.6;
    case 5 : return 0.77;
    case 6 : return 0.83;
    case 7 : return 0.90;
    case 8 : return 0.95;
    case 9 : return 0.99;
    default: return 0.999;
  }
}
// how long will this task take this person?
function getDuration(person:Person, story:Story):number {
  let duration = story.points * avgDuration * (1.0 / getEfficiency(person, story.skillneeded)) * getTaskFactor(story.skillneeded);


  // All rework is faster. This is a little over-simplified, but it will do.
  // rework also has a lower chance of introducing fresh bugs (that is covered elsewhere)
  if (story.rework && (story.skillneeded == "ba" || story.skillneeded == "dev")) {
    duration = duration /2;
  }
  
  if (personHas(person, ItemCode.dog)) {
    // A person in possession of a dog works twice as fast. No-one understands why.
    log("Faster work when you have that 🐶, " + person.name + "!")
    duration = duration / 2;
  }

  return duration;
}

function personHas(person:Person, code:ItemCode):boolean {
  return Object.keys(person.has).filter(k => person.has[k].code == code).length > 0;
}

function getSummary(story: Story) {
  return getTaskVerb(story.skillneeded) + " '" + story.summary + "'...";
}


// Consider: these verbs could be randomly drawn from list, e.g
function getTaskVerb(skill: string) {
  switch(skill) {
    case "ba": return "analyzing"; //scribing, breaking-down, encarding
    case "dev": return "designing"; //envisioning, grasping, comprehending, studying, 
    case "dev0": return "developing"; //"hacking", "coding", "developing", 
    case "test": return "testing"; //inspecting
  }
}

// this is the relative time it takes to do each step.
function getTaskFactor(skill: string){
  switch(skill) {
    case "ba": return 0.5;
    case "dev": return 0.25;
    case "dev0": return 1.0;
    case "test": return 0.5;
  }
}

function done(receiveId: string) {
  let story = game.Stories[receiveId];
  story.busy = false;
  let person = game.People[story.person];
  person.busy = false;
  person.XP += 1;
  incrementXP(1);
  drawMessage(person.name + " finished " + person.summary.replace('...','') + " " + story.logo + ".");
  $id('p' + game.People[story.person].id).classList.remove("busy");

  let skillNeeded = story.skillneeded;

  switch(skillNeeded){
    case "ba":
      //okay -- we've done the ba work on it.
      //now we add a bunch of cards to the backlog.
      doneBa(receiveId);
      break;
    case "dev":
      //okay -- we've done the ba work on it.
      //now we add a bunch of cards to the backlog.
      doneDev(receiveId);
      break;
    case "dev0":
      //okay -- we've done the ba work on it.
      //now we add a bunch of cards to the backlog.
      doneDev0(receiveId);
      break;
    case "test":
      doneTest(receiveId);
      break;
    default:
      drawMessage('unrecognised ' + skillNeeded);
  }

  //now that that's done....
  if (!person.busy && person.observeNow > 0){
    //check if there's anything in the column where this came from....
    let skillToCheck = skillNeeded;
    if (skillToCheck == "dev0") skillToCheck = "dev";

    drawMessage(`${person.name} is going to check the ${columnName(skillToCheck)} column...`);
    let columnCards = $(`#${skillToCheck} .inner .story.receiver:not(.busy):not(.selected)`);
    if (columnCards && columnCards.length > 0) {
      drawMessage(`${person.name} will do... ${columnCards[0].innerText}`);
      person.observeNow--;
      doIt('p'+person.id, columnCards[0].id);
    } else {
      drawMessage(`${person.name} found nothing to do in the ${columnName(skillToCheck)} column.`);
      person.observeNow = 0;
    }
  }

  //made it to here without being assigned a task? then the person is now free!
  if (!person.busy ) personFree(person);
}

function doneBa(storyId: string) {
  //okay -- we've done the ba work on it.
  //now we add a bunch of cards to the backlog.
  let oldStory = game.Stories[storyId];
  let person = game.People[oldStory.person];

  if (oldStory.status == "story") {

    oldStory.person = null;
    oldStory.skillneeded = "dev"; //it goes into backlog, with bug fixed.

    oldStory.hasSpecBug = false; //if it was a spec bug, it is now fixed.
    oldStory.hasBug = false; //If it was a regular bug, the further development will resolve it.
    oldStory.icon = null; //remove the icon... 
    log("Fixed the bug (or spec bug)");
    removeStory(storyId); //remove the story from the Inbox...
    drawStory(storyId, game.Stories, true); //top of the backlog... race it through

    person.busy = false;
    person.summary = "💤";
    drawPerson('p' + person.id, game.People);
  
    return;
  }

  oldStory.status = 'done';
  game.Projects[storyId] = new Project(oldStory);

  let newCards = ElaborateProject(oldStory, person);
  
  person.busy = false;
  person.summary = "💤";
  drawPerson('p' + person.id, game.People);
  
  //The original lead is removed from the board.
  removeStory(storyId);
  //The new stories are added (to the 'backlog' column)
  for(const cc of newCards) {
    drawStory('r' + cc.id, game.Stories, false);
  }
}

function determineIfAddingSkillBug(person: Person, story: Story, skill:string):boolean { 
  
  let skillPointBugLikelihood = 100.0 * getBuginess(person, skill);
  if (story.rework) {
    // an item being reworked is quicker to work on (handled elsewhere), and has MUCH less chance of new bugs being introduced.
    skillPointBugLikelihood = skillPointBugLikelihood / 2.5;
  }

  // it is a truth universally told that a person in possession of a cat is half as likely to create a spec bug.
  if (personHas(person, ItemCode.cat)) {
    log("Lower likelihood of " + skill + " bugs when you have that 😸!")
    skillPointBugLikelihood = skillPointBugLikelihood / 2;
  }

  log(`A ${skill} bug is ${Math.floor(skillPointBugLikelihood)}% likely on each point of this ${story.points} point card`);

  for(let i:number = 0; i < story.points; i++) {
    if (Math.floor(Math.random() * 100) < skillPointBugLikelihood) {
      return true;
    }
  }

  return false;
}


function ElaborateProject(story: Story, person: Person): Story[] {
  let numCards = Math.floor(story.points / 3) + 1;
  log("Lead: " + story.summary + " " + story.logo + " has been analyzed. " + numCards + " stories are being created.");
  
  let remainingPointsToAllocate = story.points;
  let newCards = [];
  
  // Deal out starting cards worth 1 point each.
  for(let i = 0; i<numCards; i++) {
    let summary = getTask();
    let newCard = { id: nextId(), pointPrice:story.pointPrice, points: 1, value: 200, status:"story", skillneeded:"dev", summary: summary, logo:story.logo, projectId: 'r' + story.id, person: null, icon: null, busy: false, hasBug: false, hasSpecBug: false, customerFoundBug: null, rework:false };

    game.Stories['r' + newCard.id] = newCard;
    newCards.push(newCard);
    //Add this new card to the list of stories for that project.
    game.Projects['r' + story.id].stories.push('r' + newCard.id);
  }
  //okay we've given a point to each card.
  remainingPointsToAllocate -= numCards;

  //randomly allocate remaining points to card.
  while (remainingPointsToAllocate > 0) {
    let card = randomItem(newCards); //draw a card from the deck
    card.points += 1;
    remainingPointsToAllocate--;
  }

  for (let cardId of game.Projects['r' + story.id].stories) {
    let hasSpecBug = false;
    //jalert(cardId);
    let card = game.Stories[cardId];
    //chance of adding a bug relates to effectiveness of ba, and size of story. (and whether or not they have... a cat)
    if (determineIfAddingSkillBug(person, card, "ba")) {
      hasSpecBug = true;
      log("Spec bug 💥 added to '" + card.summary + "'");
    }

    card.hasSpecBug = hasSpecBug;
  }

  return newCards;
}

function doneDev(storyId: string) {
  //okay -- it's done being in the backlog
  //either add it to dev -- or send it back to be clarified (if you find a spec bug)
  let person = game.People[game.Stories[storyId].person];
  let story = game.Stories[storyId];
  
  // no spec bugs can be found until level 3.
  if (game.Level > 2 && story.hasSpecBug) {
    let percentChanceOfFindingSpecBug:number = 100.0 * canFindBug(person, "dev");
    log("Story " + story.summary + " has a spec bug 💥, there is a " + Math.floor(percentChanceOfFindingSpecBug) + "% chance of the developer finding it.");
    let foundSpecBug = (Math.floor(Math.random() * 100) < percentChanceOfFindingSpecBug);
    if (foundSpecBug) {
    
      person.busy = false;
      person.summary = "💤";
      drawPerson('p' + person.id, game.People);
	
      drawMessage(person.name + " discovered a spec bug 💥 in story '" + story.summary + "'");
      story.person = null;
      story.hasBug = null;
      story.icon = "💥";
      story.skillneeded = "ba";
      story.rework = true;
      removeStory(storyId);
      drawStory(storyId, game.Stories, true);
      return;
    }
  }

  removeStory(storyId);
  story.skillneeded = "dev0";
  doIt(story.person, storyId);
}

function doneDev0(storyId: string) {
  //okay -- development is done
  //Add it to test
  let story = game.Stories[storyId];
  let person = game.People[story.person];
  
  //chance of adding a bug relates to effectiveness of ba, and size of story. (and whether or not they have... a cat)
  if (determineIfAddingSkillBug(person, story, "dev")) {
    story.hasBug = true;
    // Note the bug may or may not be found later. If tester doesn't find it, the customer *will* find it.
    log(`A bug 🐛 was added to ${story.summary}`);
  }

  removeStory(storyId);
  story.skillneeded = "test";
  story.person = null;
  story.icon = null;
  log("Story: " + story.summary + " is ready for testing.");
  drawStory(storyId, game.Stories, story.rework);
  person.busy = false;
  person.summary = "💤";
  drawPerson('p' + person.id, game.People);
}

function doneTest(storyId: string) {
  //okay -- test is done
  removeStory(storyId);
  let story = game.Stories[storyId];
  let person = game.People[story.person];
  person.busy = false;
  person.summary = "💤";
  drawPerson('p' + person.id, game.People);
  let tester = game.People[story.person];

  //no bugs can be found until level 2.
  if (game.Level > 1 && story.hasBug) {
    let percentChanceOfFindingBug:number  = 100.0 * canFindBug(person, "test");
    log("Story " + story.summary + " has a bug, there is a " + Math.floor(percentChanceOfFindingBug) + "% chance of finding it while testing.");
    let foundBug = (Math.floor(Math.random() * 100) < percentChanceOfFindingBug);
    if (foundBug) {
      drawMessage(tester.name + " found a bug 🐛 in story '" + story.summary + "'");
      story.person = null;
      story.hasBug = null;
      story.hasSpecBug = null;
      story.icon = "🐛";
      story.skillneeded = "dev";
      story.rework = true;
      drawStory(storyId, game.Stories, true);
      return;
    }
  }

  // no spec bugs can be found until level 3.
  if (game.Level > 2 && story.hasSpecBug) {
    let percentChanceOfFindingSpecBug:number = 100.0 * canFindBug(tester, "test");
    log("Story: " + story.summary + " has a spec bug 💥, there is a " + Math.floor(percentChanceOfFindingSpecBug) + "% chance of finding it while testing.");
    let foundSpecBug = (Math.floor(Math.random() * 100) < percentChanceOfFindingSpecBug);
    if (foundSpecBug) {
      drawMessage(tester.name + " found a spec bug 💥 in story '" + story.summary + "'");
      story.person = null;
      story.hasBug = null;
      story.hasSpecBug = null;
      story.icon = "💥";
      story.skillneeded = "ba";
      story.rework = true;
      drawStory(storyId, game.Stories, true);
      return;
    }
  }
  story.person = null;
  story.icon = null;
  log("Story: " + story.summary + " passed testing. Done!");
  story.skillneeded = "done";
  story.icon = "✔";
  drawStory(storyId, game.Stories, story.rework);
  //the 'done' card dissappears after a while.
  setTimeout(function() { bankStory(storyId);}, avgDuration*5);
}

function canFindBug(person:Person, skill:string){
  // see also `function getBuginess`

  // at level 1 -- efficiency is 0.3
  // at level 10 -- efficiency is 0.99
  let efficiency = getEfficiency(person, skill);
  // that's good enough, we'll just use the efficiency directly.
  log('Efficiency of ' + person.name + ' at ' + skill + ' is ' + efficiency);
  let chanceOfFindingBug = efficiency;
  return chanceOfFindingBug;
}

function bankStory(storyId: string) {
  let story = game.Stories[storyId];

  //If story has a bug... customer will definitely find it! (it got past testing!)
  //and it will go all the way back to the ba column, even if it wasn't a spec bug!

  //no bugs can be found until level 2, no spec bugs until level 3
  if ((game.Level > 1 && story.hasBug) || (game.Level > 2 && story.hasSpecBug)) {
    //remove from board
    removeStory(storyId);
    drawMessage(`Oops! The customer found a bug 🐞 in story '${story.summary}'`);
    story.customerFoundBug = true;
    //HALVE the amount this card is worth! (hope the customer doesn't find ANOTHER bug in this one......)
    story.pointPrice = story.pointPrice / 2;
    story.person = null;
    story.icon = "🐞";
    story.skillneeded = "ba"; //goes all the way back to the BA column.
    story.rework = true;
    drawStory(storyId, game.Stories, true); //at the top.
    return;
  }
  //But if there is no bug .. money will be paid... and if the project is thus completed, a completion payment is made.
  //TODO: set appropriate price based on # points.
  let price = Math.floor(story.points * story.pointPrice);
  let message2 = ` for '${story.summary}'`;
  incrementXP(5);

  if (story.customerFoundBug) {
    //price = Math.floor(price/2);
    message2 += " (reduced as customer found that bug)";
    //price is reduced because customer previously found a bug in this!.
  }
  let projectId = game.Stories[storyId].projectId;
  //remove the story from the project it belongs to.
  let project = game.Projects[projectId];
  let bonus = 0;

  if (project.stories.includes(storyId)) {
    project.stories.splice(project.stories.indexOf(storyId), 1);
    //if there are no stories remaining then a project completion bonus is paid.
    if (project.stories.length == 0) {
      bonus = Math.ceil(project.lead.points * project.lead.pointPrice / 2);
      message2 += ` plus 💲${bonus} for completing '${project.lead.summary} ${project.lead.logo}'!`;
      for(const s in project.stories){
        delete game.Stories[s];
      }
      delete game.Projects[projectId];
      incrementXP(10);
    }
  }

  incrementMoney(price + bonus);
  drawMoney(game.Money);
  drawMessage(`Earned 💲${price}${message2}`);
  removeStory(storyId);
}

/* utility functions */
function htmlToElement(html: string): HTMLElement {
  let template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return <HTMLElement>(template.content.firstChild);
}

function $(selector: string): HTMLElement[] {
  return <any>document.querySelectorAll(selector);
}

function $id(id: string): HTMLElement {
  return document.getElementById(id);
}

function isEmpty(obj: { constructor?: any; }) {
 return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

//add the class of className to all elements that match the selector
function addClass(selector: string, className: string) {
  for(const example of $(selector)) {
    example.classList.add(className);
  }
}

//remove the class className from all elements that match the selector
function removeClass(selector: string, className: string) {
  for(const example of $(selector)) {
    example.classList.remove(className);
  }
}

// remove the class of className from all elements that have a class of className
function removeAllClass(className: string) {
  for(const example of $("." + className)) {
    example.classList.remove(className);
  }
}

function getParameterByName(name: string) {
  let url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function drawMessage(message: string) {
  log('m:' + message);
  $id('message').innerText = message;
}

function randomItem(list: any[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// names from https://introcs.cs.princeton.edu/java/data/

let names = ['Aaron','Abbie','Abbott','Abbra','Abby','Abe','Abel','Abeni','Abia','Abiba','Abie','Abigail','Abner','Abraham','Abram','Abrianna','Abrienda','Abril','Absolom','Abu','Acacia','Ace','Ada','Adah','Adair','Adalia','Adam','Adamina','Adamma','Adara','Addison','Ade','Adela','Adelaide','Adele','Adeline','Adelio','Adelle','Adem','Aden','Aderes','Adie','Adiel','Adila','Adina','Adita','Adlai','Adli','Adolfo','Adolph','Adonai','Adonia','Adora','Adrian','Adriana','Adriano','Adrienne','Ady','Aelan','Affrica','Afra','Afric','Africa','Afton','Agamemnon','Agatha','Aggie','Agnes','Ah Cy','Ahava','Ai','Aida','Aidan','Aiko','Aileen','Ailis','Ailish','Aimee','Aine','Ainsley','Aisling','Aislinn','Aizza','Aja','Ajani','Ajay','Akili','Akuji','Al','Alair','Alake','Alan','Alana','Alanna','Alastair','Alaura','Alban','Albany','Albert','Alberta','Alberto','Albin','Albina','Alda','Aldan','Alden','Aldon','Aldona','Alec','Alejandro','Alem','Alena','Aleta','Aletha','Alethea','Aletta','Alex','Alexa','Alexander','Alexandra','Alexandria','Alexia','Alexis','Alfonso','Alfred','Algeron','Ali','Alia','Alice','Alicia','Alijah','Alika','Alima','Alina','Alisha','Alison','Alissa','Alize','Alka','Allegra','Allen','Allene','Allie','Allison','Allyson','Alma','Almeda','Alohilani','Alphonse','Alsatia','Althea','Alva','Alvin','Alyn','Alyson','Alyssa','Amadeus','Amador','Amalia','Amalie','Aman','Amana','Amanda','Amandla','Amara','Amaranta','Amarante','Amaranth','Amaris','Amaryllis','Amaya','Amber','Ambrose','Amelia','Amena','Ami','Amiel','Amina','Amir','Amiri','Amity','Amma','Amorina','Amos','Amy','An','Ana','Anais','Analiese','Analise','Anana','Anando','Anastasia','Anatola','Anatole','Ande','Andra','Andralyn','Andre','Andrea','Andreas','Andres','Andrew','Andy','Anemone','Anevay','Angel','Angela','Angelica','Angelina','Angelo','Angie','Angus','Ani','Anika','Anila','Anisa','Anita','Anitra','Anja','Anlon','Ann','Anna','Annalise','Annamika','Anne','Anneke','Annette','Annice','Annick','Annis','Annissa','Annora','Anthea','Anthony','Antionette','Antoinette','Antonia','Antonie','Antony','Anwar','Anya','Aoko','Aolani','Aphrodite','Apollo','Appollo','Apria','April','Arabela','Arabella','Aram','Aran','Archibald','Archie','Aren','Aretha','Argus','Ari','Aria','Ariana','Ariel','Ariella','Arielle','Arien','Arissa','Arista','Ariza','Arlen','Arlene','Arlo','Arlynda','Armand','Armande','Armando','Armina','Arnaud','Arne','Arnie','Arnold','Aron','Art','Artemis','Arthur','Artie','Arty','Arvid','Arvin','Asa','Asabi','Asalie','Asasia','Ash','Asha','Ashby','Ashley','Ashling','Ashlyn','Ashton','Ashtyn','Asis','Asli','Asnee','Asta','Asthore','Astin','Astra','Astrid','Atalo','Athalia','Athena','Atira','Auberta','Aubrey','Aubrianna','Audi','Audra','Audrey','August','Augustin','Augustus','Aulii','Aure','Aurelia','Aurora','Aurorette','Austin','Autumn','Ava','Avalon','Avel','Aveline','Avery','Avi','Avis','Aviv','Aviva','Avongara','Axel','Axelle','Aya','Ayame','Ayanna','Ayla','Ayoka','Aysha','Azana','Aziza','Azize','Azra','Azriel','Azuka','Azura','Baba','Babette','Bahari','Bailey','Baird','Bairn','Bakula','Ballard','Balthasar','Bambi','Banji','Barake','Barb','Barbara','Barbie','Barclay','Barke','Barnabas','Barnard','Barney','Barny','Barr','Barran','Barretta','Barry','Bart','Barth','Bartholemew','Barton','Baruch','Bary','Bash','Basil','Bast','Bastien','Baxter','Bayard','Bayen','Baylee','Bayo','Bea','Beata','Beate','Beatrice','Beatriz','Beau','Beauregard','Bebe','Bebhin','Becca','Beck','Becka','Becky','Bel','Bela','Belay','Belden','Belinda','Belita','Bell','Bella','Belle','Bellini','Ben','Bena','Benard','Benedict','Benen','Benita','Benjamin','Benjy','Bennett','Benny','Benson','Berdine','Berke','Bern','Bernadette','Bernadine','Bernard','Berne','Bernice','Bernie','Berny','Bert','Bertha','Bertille','Beryl','Bess','Bessie','Beth','Bethan','Bethany','Betsy','Bette','Betty','Beulah','Bevan','Beverly','Bevis','Beyla','Biana','Bianca','Bibiane','Bidelia','Bikita','Bilen','Bill','Billy','Bin','Bina','Bing','Bingham','Birch','Bisbee','Bishop','Biton','Bjorn','Blade','Blaine','Blair','Blake','Blanche','Blaze','Blenda','Blinda','Bliss','Blithe','Blodwyn','Blossom','Blum','Bluma','Blythe','Bo','Boaz','Bob','Bona','Bonaventure','Bond','Bonita','Bonnie','Bono','Boone','Boris','Bowen','Bowie','Boyd','Bracha','Brad','Braden','Bradford','Bradley','Braeden','Braima','Bran','Brand','Brandee','Brandie','Brandon','Brant','Braxton','Brayden','Brazil','Breanna','Breckin','Brede','Bree','Brein','Brend','Brenda','Brendan','Brenna','Brennan','Brent','Brett','Brewster','Brian','Briana','Brianna','Brianne','Briar','Brice','Brick','Bridget','Bridgit','Brielle','Brier','Brigham','Brighton','Brigit','Brigitte','Brilane','Brilliant','Brina','Brinly','Brit','Brita','Britain','Britannia','Britany','Brittania','Brittany','Brittnee','Brock','Brody','Brone','Bronson','Bronwen','Brooke','Brooklyn','Brooks','Bruce','Bruno','Bryan','Bryanne','Bryant','Bryce','Brygid','Brynn','Bryony','Bryton','Buck','Bud','Buddy','Buffy','Bunny','Burdette','Burke','Burt','Burton','Butterfly','Buzz','Byrd','Byron','Cade','Cadee','Cadence','Cady','Cael','Caelan','Caesar','Cai','Cailean','Caimile','Cain','Caine','Cairbre','Cairo','Cais','Caitlin','Caitlyn','Cal','Cala','Calais','Calandra','Calantha','Calder','Cale','Caleb','Caley','Calhoun','Calix','Calixte','Calla','Callia','Calliope','Callista','Callum','Calvin','Calvine','Cam','Camdyn','Cameron','Camilla','Camille','Camlin','Cana','Candace','Candice','Candida','Candide','Candie','Candy','Cara','Caralee','Caresse','Carha','Carina','Carl','Carla','Carleton','Carlisle','Carlos','Carlota','Carlotta','Carlton','Carly','Carmel','Carmela','Carmelita','Carmen','Carmine','Carol','Carolena','Caroline','Carolyn','Caron','Carr','Carrick','Carrie','Carrieann','Carson','Carsyn','Carter','Carver','Cary','Casey','Cashlin','Casimir','Casondra','Caspar','Casper','Cassandra','Cassia','Cassidy','Cassius','Catherine','Cathy','Catrin','Cayla','Ceana','Cearo','Cece','Cecil','Cecile','Cecilia','Cecily','Cedric','Celeste','Celestyn','Celia','Celina','Celine','Cerise','Cesar','Chad','Chaela','Chaeli','Chailyn','Chaim','Chalsie','Chana','Chance','Chancellor','Chandler','Chandra','Channon','Chantal','Chantel','Charis','Charisse','Charity','Charla','Charlee','Charleigh','Charlene','Charles','Charlot','Charlotte','Charmaine','Charo','Chars','Chas','Chase','Chastity','Chauncey','Chava','Chavi','Chaylse','Cheche','Chelsa','Chelsea','Chelsi','Chelsia','Chen','Cheney','Chenoa','Cher','Cheri','Cherie','Cherlin','Cherry','Cheryl','Chesna','Chester','Chet','Cheyenne','Cheyne','Chezarina','Chhaya','Chick','Chico','Chill','Chilton','Chimelu','China','Chip','Chipo','Chloe','Chloris','Chris','Chrissy','Christa','Christian','Christiana','Christina','Christine','Christopher','Christy','Chuck','Chumani','Chun','Chyna','Chynna','Cian','Cianna','Ciara','Cicely','Cicero','Cicily','Cid','Ciel','Cindy','Cira','Cirila','Ciro','Cirocco','Cissy','Claire','Clara','Claral','Clare','Clarence','Clarissa','Clark','Clarke','Claude','Claudia','Clay','Clayland','Clayton','Clea','Cleantha','Cleatus','Cleavant','Cleave','Cleavon','Clem','Clemens','Clement','Clementine','Cleo','Cleta','Cleveland','Cliff','Clifford','Clifton','Clint','Clinton','Clio','Clitus','Clive','Clodia','Cloris','Clove','Clover','Cocheta','Cody','Cole','Colette','Coligny','Colin','Colista','Colleen','Collice','Collin','Colm','Colman','Colton','Columbia','Comfort','Conan','Conlan','Conley','Conner','Connie','Connley','Connor','Conor','Conrad','Constance','Constantine','Consuela','Consuelo','Content','Conway','Conyers','Cooper','Cora','Coral','Coralia','Coralie','Corbin','Corby','Cordelia','Corentine','Corey','Corin','Corina','Corine','Corinna','Corinne','Corliss','Cornelia','Cornelius','Cornell','Cort','Cory','Cosette','Cosima','Cosmo','Coty','Courtney','Coy','Coye','Craig','Creighton','Creola','Crescent','Crete','Crevan','Crispin','Cristy','Crystal','Cullen','Curry','Curt','Curtis','Cuthbert','Cutler','Cutter','Cy','Cybele','Cybil','Cybill','Cyd','Cyma','Cyndi','Cynthia','Cyrah','Cyril','Cyrus','D\'lorah','Da-xia','Dacey','Dafydd','Dagan','Dagmar','Dahlia','Daisy','Dakota','Dale','Dalia','Dalila','Dalit','Dallas','Dallin','Dalton','Dalva','Damian','Damita','Damon','Dan','Dana','Danae','Dane','Dani','Danica','Daniel','Daniela','Danielle','Danika','Danil','Danniell','Danny','Dante','Danton','Danyl','Daphne','Dara','Daray','Darby','Darcy','Dard','Daria','Darian','Darin','Dario','Darla','Darlene','Darnell','Darrell','Darren','Darrin','Darrion','Darrius','Darryl','Darshan','Darwin','Daryl','Dasan','Dasha','Davan','Dave','David','Davida','Davin','Davina','Davis','Davu','Dawn','Dayton','Dea','Dean','Deandra','Deanna','Deanne','Debbie','Debby','Deborah','Debra','Deidra','Deiondre','Deirdra','Deiter','Dejah','Deka','Del','Delaine','Delaney','Delbert','Delfina','Delia','Delila','Delilah','Deliz','Della','Delores','Delphine','Delta','Delu','Dembe','Demetria','Demetrius','Demi','Demitrius','Dempster','Den\'e','Dena','Denali','Denis','Denise','Denna','Dennis','Denver','Deo','Deon','Derby','Derek','Derex','Derica','Dermot','Derora','Derrick','Derron','Derry','Des','Desana','Desdemona','Desi','Desiderio','Desiree','Desmond','Dessa','Destiny','Deva','Devaki','Devi','Devin','Devon','Devorah','Devorit','Dewey','Dewitt','Dexter','Dextra','Diallo','Diana','Diane','Dianne','Diantha','Dianthe','Diata','Dick','Didier','Didrika','Diego','Dillan','Dillian','Dillon','Dina','Dinah','Dino','Dion','Dionne','Dionysius','Dionysus','Dior','Dirk','Dixie','Dixon','Dmitri','Doane','Doctor','Doda','Doi','Dolly','Dolores','Dolph','Dom','Domani','Dominic','Dominick','Dominique','Dominy','Don','Donagh','Donahi','Donal','Donald','Donat','Donelle','Donna','Donnel','Donnica','Donny','Donovan','Dora','Dorcas','Dore','Dori','Doria','Dorian','Dorie','Dorinda','Doris','Dorit','Dorothea','Dorothy','Dorset','Dorsey','Dory','Dot','Dotty','Doug','Dougal','Douglas','Douglass','Doyle','Doyt','Drake','Dreama','Drew','Dru','Duane','Duc','Dudley','Duena','Duff','Dugan','Duka','Duke','Dulce','Dulcea','Dulcina','Dulcinea','Dumi','Duncan','Dunixi','Dunja','Dunn','Dunne','Duscha','Dustin','Dusty','Dwayne','Dwight','Dyan','Dyani','Dyanne','Dylan','Dyllis','Dyre','Dysis','Eadoin','Eamon','Earl','Earlene','Earnest','Easter','Eavan','Ebony','Echo','Ed','Edalene','Edaline','Edana','Edda','Eddie','Eddy','Edeline','Eden','Edena','Edgar','Edie','Edison','Edita','Edith','Edmund','Edna','Edric','Edward','Edwardo','Edwin','Edwina','Edythe','Effie','Efrat','Efrem','Egan','Eileen','Eilis','Eitan','Ela','Elaine','Elan','Elana','Elani','Elata','Elda','Elden','Eldon','Eldora','Eleanor','Electra','Elena','Elephteria','Elgin','Eli','Elia','Elias','Elie','Elijah','Elin','Eliora','Eliot','Elise','Elisha','Elita','Eliza','Elizabeth','Eljah','Elkan','Elke','Ella','Ellard','Elle','Ellema','Ellen','Ellery','Ellie','Elliot','Elliott','Ellis','Elmo','Eloise','Elsa','Elsie','Elspeth','Elton','Elu','Elvin','Elvina','Elvira','Elvis','Ely','Elysia','Emanuel','Emanuele','Emele','Emene','Emera','Emerald','Emery','Emil','Emilia','Emilie','Emilio','Emily','Emma','Emmanuel','Emmet','Emmett','Emmly','Enid','Ennis','Enos','Enrico','Eolande','Ephraim','Epifanio','Er','Erasmus','Eri','Eric','Erica','Erik','Erika','Erimentha','Erin','Eris','Erland','Erma','Erme','Ermin','Erna','Ernest','Ernie','Erno','Eron','Eros','Errin','Errol','Erv','Ervin','Erwin','Eryk','Esben','Eshe','Esma','Esmerelda','Esteban','Estelle','Ester','Esther','Estralita','Etan','Etana','Eternity','Ethan','Ethel','Ethelda','Etta','Eudora','Eugene','Eulalia','Eulalie','Eupemia','Euphemia','Euridice','Eva','Evan','Evane','Evangeline','Evania','Eve','Evelia','Evelien','Evelyn','Everett','Evette','Evie','Evita','Evonne','Ewa','Eyal','Eydie','Ezekiel','Ezra','Fabian','Fabienne','Fabiola','Fabrizio','Fabunni','Fairfax','Fairly','Faith','Fala','Fale','Fallon','Fanchon','Farica','Faris','Farley','Farrah','Farrell','Fatima','Fausta','Faustine','Favian','Fawn','Fay','Faye','Faylinn','Fedora','Feivel','Feleti','Felicia','Felicity','Felimy','Felix','Fell','Felton','Fennella','Feoras','Ferdinand','Fergal','Fergus','Ferguson','Fern','Fernando','Ferris','Ferrol','Fiachra','Fico','Fidel','Fidelia','Fidelio','Fidella','Field','Filbert','Filia','Filipina','Fineen','Finley','Finn','Finna','Finola','Fiona','Fionan','Fionn','Fionnula','Fiorenza','Fisk','Fisseha','Flan','Flannery','Flavian','Fletcher','Fleur','Flint','Flo','Flora','Floramaria','Florence','Floria','Floriane','Florida','Florrie','Flower','Floyd','Flynn','Fola','Fonda','Fondea','Forbes','Ford','Fordon','Forrest','Forrester','Forster','Fortune','Foster','Fountain','Fox','Foy','Fraley','Fran','Frances','Francesca','Francis','Frank','Franklin','Franz','Frasier','Frayne','Fred','Freddy','Frederica','Frederick','Fredrica','Freed','Freeman','Freja','Fremont','Freya','Frieda','Fritz','Fritzi','Fronde','Fruma','Frye','Fulbright','Fuller','Fynn','Gabby','Gabe','Gabi','Gabriel','Gabriela','Gabriella','Gabrielle','Gaby','Gaetan','Gaetane','Gafna','Gage','Gail','Gaille','Gainell','Gaius','Gale','Galen','Galeno','Gali','Gallagher','Gallia','Galvin','Gamada','Gamal','Gamaliel','Ganit','Gannon','Ganya','Gardner','Gareth','Garfield','Garren','Garret','Garrett','Garrick','Garrison','Garron','Garry','Garson','Garth','Garvey','Gary','Gates','Gaurav','Gautier','Gavan','Gavin','Gavivi','Gavril','Gay','Gaye','Gayle','Gaylord','Gaynell','Gazali','Gazelle','Gazit','Gella','Gelsey','Gemma','Gene','Genet','Geneva','Genevieve','Genna','Gent','Geoff','Geoffrey','Geordi','George','Georgette','Georgia','Georgina','Gerald','Geraldene','Geraldine','Geraldo','Gerard','Gerda','Geri','Gerik','Germain','Germaine','Gerodi','Gerry','Gershom','Gertrude','Ghita','Giacomo','Gianna','Gibson','Gideon','Gigi','Gil','Gilbert','Gilda','Giles','Gili','Gillespie','Gillian','Gin','Gina','Ginacarlo','Ginata','Ginger','Ginny','Gino','Giolla','Giorgio','Giovanni','Gisela','Giselle','Gita','Gitano','Gitel','Gittel','Giulio','Giuseppe','Giva','Giza','Gladys','Glen','Glenda','Glenn','Glenna','Glennis','Glenys','Glora','Gloria','Glory','Glyn','Glynis','Glynnis','Godana','Godfrey','Golda','Goldie','Goldy','Gomer','Gordon','Gordy','Grace','Gracie','Grady','Graham','Gram','Grania','Grant','Granville','Gratia','Gratiana','Grayson','Grazia','Greer','Greg','Gregg','Gregory','Greta','Gretchen','Gretel','Griffin','Griselda','Grizelda','Grover','Guadalupe','Gualtier','Guban','Guenevere','Guido','Guinevere','Gunnar','Gunther','Gur','Gure','Guri','Gustav','Guy','Gwen','Gwendolyn','Gwyn','Gwyneth','Gypsy','Haben','Habib','Hada','Hadar','Hadassah','Hadley','Haile','Haines','Hajari','Hal','Halen','Haley','Hali','Halona','Ham','Hamal','Hamilton','Hamlet','Hamlin','Hampton','Hana','Hank','Hanley','Hanna','Hannah','Hannelore','Hans','Hanzila','Hao','Haracha','Harlan','Harley','Harlow','Harmon','Harmony','Harold','Haroun','Harper','Harriet','Harrison','Harry','Hart','Hartwell','Haru','Haruki','Haruko','Haruni','Harva','Harvey','Hasad','Hasana','Hastin','Hateya','Haven','Hawa','Hayden','Hayley','Hayward','Hazel','Hazelle','Hazina','Heath','Heather','Heavynne','Hector','Hedda','Hedia','Hedva','Hedwig','Hedy','Hedya','Heidi','Heinz','Helaine','Helen','Helena','Helene','Helga','Helia','Heller','Heloise','Henri','Henrietta','Henrik','Henry','Hera','Herb','Herbert','Herbst','Heremon','Herman','Herschel','Hertz','Hesper','Hester','Hestia','Hewitt','Hidalgo','Hidi','Hiero','Hija','Hila','Hilaire','Hilary','Hilda','Hilde','Hillary','Hilzarie','Hina','Hinda','Hiroko','Hirsi','Holden','Holiday','Hollace','Holli','Hollis','Holly','Hollye','Holt','Homer','Honey','Honora','Honoria','Hope','Horace','Horus','Hosea','Hoshi','Hoshiko','Houston','Howard','Howe','Howell','Howie','Hubert','Hue','Huela','Huey','Hugh','Hugo','Humphrey','Hunter','Huso','Hussein','Hy','Hyacinth','Hyman','Hyroniemus','Ian','Ianna','Ianthe','Ida','Idalee','Idalia','Idana','Idande','Idania','Idra','Ife','Ige','Iggi','Iggy','Ignatius','Ike','Ilana','Ilario','Ilit','Ilo','Ilom','Ilori','Ilse','Ilyssa','Imogene','Ina','Inari','Independence','India','Indira','Indra','Inez','Infinity','Inga','Inge','Ingrid','Inoke','Iokina','Iola','Iolani','Ion','Iona','Ipo','Ira','Iram','Irene','Iria','Irina','Iris','Irisa','Irma','Irving','Iryl','Isaac','Isabel','Isabis','Isadora','Isaiah','Isha','Isi','Isis','Isleen','Ismaela','Ismail','Ismet','Isolde','Isra','Israel','Issay','Ita','Italia','Ivan','Ivi','Ivie','Ivo','Ivria','Ivrit','Ivy','Izefia','Izellah','Ja','Jaali','Jabari','Jabilo','Jabir','Jabulani','Jace','Jacinta','Jack','Jackie','Jackson','Jaclyn','Jacob','Jacoba','Jacqueline','Jacques','Jacqui','Jada','Jade','Jaden','Jadon','Jadyn','Jadzia','Jael','Jafaru','Jaime','Jaimie','Jake','Jalen','Jalene','Jalil','James','Jamese','Jamie','Jamila','Jan','Jana','Janae','Jane','Janel','Janelle','Janet','Janette','Jania','Janice','Janina','Janine','Japheth','Jara','Jared','Jariath','Jarrett','Jarvis','Jasmine','Jason','Jasper','Javen','Jay','Jayden','Jayme','Jazlynn','Jean','Jeanine','Jeanne','Jeb','Jeff','Jefferson','Jeffrey','Jemima','Jengo','Jenis','Jenna','Jennelle','Jennessa','Jennie','Jennifer','Jenny','Jens','Jensen','Jered','Jeremiah','Jeremy','Jeri','Jerica','Jericho','Jerod','Jeroen','Jerold','Jerom','Jerome','Jerommeke','Jerrell','Jerrick','Jerry','Jerusha','Jess','Jesse','Jessica','Jessie','Jesus','Jethro','Jett','Jewel','Jewell','Jezebel','Jianna','Jihan','Jill','Jillian','Jim','Jimmy','Jin','Jira','Jiro','Joan','Joann','Joanna','Joanne','Job','Jocasta','Jocelyn','Jock','Jodi','Jodie','Jody','Joe','Joel','Joelle','Joey','Johanna','John','Johnny','Joie','Jola','Jolene','Jolie','Jon','Jonah','Jonathan','Jonny','Jordan','Joren','Jorge','Jorn','Jorryn','Jory','Jose','Josef','Joseph','Josephine','Josh','Joshua','Joshwa','Josiah','Josie','Josue','Jovan','Jovianne','Jovita','Joy','Joyce','Joylyn','Juan','Juana','Juandalynn','Juanita','Jubal','Jud','Judah','Judd','Jude','Judith','Judson','Judy','Juji','Jules','Julia','Julian','Juliana','Julianna','Julianne','Julie','Juliet','Julio','Julisha','July','Jumoke','Jun','June','Junior','Justin','Justine','Justise','Kabibe','Kabili','Kacela','Kachina','Kacy','Kadeem','Kael','Kaelin','Kaethe','Kahlilia','Kai','Kaikura','Kailey','Kaitlyn','Kalea','Kalei','Kaleigh','Kaley','Kali','Kalin','Kalinda','Kalista','Kalli','Kamal','Kamali','Kame','Kamella','Kameryn','Kamilia','Kande','Kane','Kara','Karan','Kare','Kareem','Karen','Karena','Kari','Karik','Karim','Karimah','Karina','Karis','Karl','Karla','Karli','Karma','Karmina','Karna','Karston','Kaseko','Kasi','Kasim','Kaspar','Kassia','Kat','Kata','Kate','Katelin','Katharine','Katherine','Kathie','Kathleen','Kathryn','Kathy','Katie','Katina','Kato','Katrina','Katungi','Katy','Kaula','Kawena','Kay','Kaya','Kaycee','Kayla','Kaylana','Kaylee','Kayo','Kayonga','Kaz','Kazi','Kazu','Keagan','Keaira','Keb','Kedem','Kedma','Keefe','Keefer','Keegan','Keelan','Keelia','Keely','Keena','Keenan','Keene','Keeya','Kefira','Kei','Keiji','Keiki','Keir','Keira','Keiran','Keita','Keitaro','Keith','Kelby','Kelda','Kele','Kelii','Kelila','Kellan','Kellee','Kellen','Kelley','Kelli','Kellsie','Kelly','Kelsey','Kelton','Kelvin','Ken','Kenda','Kendall','Kendi','Kendis','Kendra','Kenisha','Kenley','Kenna','Kennan','Kennedi','Kennedy','Kenneth','Kenny','Kent','Kenton','Kenyi','Kenyon','Kenzie','Keola','Keon','Kerda','Keren','Kermit','Kern','Kerr','Kerri','Kerry','Kesin','Ketara','Kevin','Kevina','Keyanna','Khalida','Khalil','Khalipha','Khiry','Kia','Kiah','Kiana','Kiandra','Kibibe','Kiden','Kieran','Kiersten','Kiho','Kiki','Kiley','Killian','Kim','Kimball','Kimberly','Kimi','Kimmy','Kin','Kina','Kinfe','King','Kingston','Kinipela','Kioko','Kione','Kiora','Kipling','Kipp','Kira','Kirabo','Kiral','Kirby','Kiri','Kiril','Kirk','Kiros','Kirra','Kirsi','Kirsten','Kisha','Kishi','Kita','Kitoko','Kitra','Kitty','Kiyoshi','Kizzy','Klaus','Klitos','Knut','Koda','Koen','Koko','Kolton','Konane','Koren','Korene','Kori','Kory','Kostya','Koto','Kourtney','Kozue','Kris','Krista','Kristen','Kristin','Kristina','Kristine','Kristopher','Krystyn','Kuma','Kumi','Kumiko','Kura','Kuri','Kuron','Kurt','Kwanita','Kyla','Kyle','Kyleigh','Kylene','Kyler','Kylia','Kylie','Kyna','Kynan','Kynthia','Kyra','Kyrene','Kyria','L\'pree','La Don','Lacey','Lachlan','Lacy','Laddie','Lael','Lahela','Laina','Laird','Lajuan','Lajuana','Lakin','Lale','Laleh','Lali','Lalita','Lalo','Lamar','Lamont','Lan','Lana','Lanai','Lanaya','Lance','Lancelot','Landen','Landers','Landis','Landon','Landry','Lane','Lanelle','Lang','Langer','Langston','Lani','Lankston','Lanza','Laqueta','Lara','Laraine','Lareina','Larissa','Lark','Larry','Lars','Larue','Larvall','Lasca','Lassie','Laszlo','Latanya','Latham','Lathrop','Latika','Latimer','Latisha','Laura','Lauren','Laurence','Laurie','Laval','Lave','Laverne','Lavey','Lavi','Lavonn','Lavonne','Lawanda','Lawrence','Lawrencia','Layla','Layne','Lazar','Lazarus','Lea','Leah','Leal','Leala','Leander','Leane','Leanna','Leanne','Leavitt','Lecea','Leda','Ledell','Lee','Leena','Leeto','Lehana','Leia','Leif','Leigh','Leila','Leilani','Leimomi','Lel','Lela','Leland','Lelia','Lemuel','Lena','Lencho','Lenka','Lenora','Lenore','Lente','Leo','Leola','Leoma','Leon','Leona','Leonard','Leone','Leonie','Leonora','Leonzal','Leopold','Leora','Lerato','Leroy','Les','Lesa','Lesley','Leslie','Lester','Letitia','Lev','Levana','Leverett','Levi','Levia','Levon','Lewa','Lewis','Lex','Lexi','Lexine','Lia','Liam','Lian','Liana','Libba','Libby','Liberty','Lida','Lidia','Lien','Liko','Lila','Lilac','Lilah','Lilia','Liliha','Lilith','Lilli','Lillian','Lilo','Lily','Lin','Lina','Lincoln','Linda','Lindley','Lindsay','Lindsey','Lindy','Linus','Liona','Lionel','Lirit','Lisa','Lisbet','Lisette','Lisimba','Lisle','Liv','Livana','Livi','Livia','Livvy','Lixue','Liz','Liza','Lizbeth','Lizina','Llewellyn','Lloyd','Loba','Lobo','Locke','Logan','Lois','Lola','Lolonyo','Lolovivi','Lona','Lonato','London','Lonna','Lonnie','Lonnit','Lora','Lorelei','Lorena','Lorenzo','Loretta','Lori','Lorimer','Lorin','Loring','Lorna','Lorne','Lorraine','Lorretta','Lotta','Lotte','Lotus','Lou','Loughlin','Louis','Louisa','Louise','Loura','Lourana','Lourdes','Lourine','Love','Lovey','Lovie','Lowell','Luam','Luana','Lucas','Luce','Lucia','Lucian','Lucie','Lucille','Lucinda','Lucio','Lucius','Lucretia','Lucus','Lucy','Ludlow','Ludwig','Luigi','Luis','Luke','Lula','Lulli','Lulu','Luna','Lundy','Lunette','Lupe','Lupita','Luthando','Luther','Lyde','Lydia','Lyle','Lyn','Lynch','Lynda','Lynde','Lyndel','Lyndon','Lyndsey','Lynelle','Lynette','Lynley','Lynn','Lynna','Lynne','Lynnea','Lynton','Lyre','Lyris','Lysa','Lysander','Lysandra','Maarten','Maat','Mabel','Mac','Macayle','Macha','Mackenzie','Macy','Maddox','Madeleine','Madelia','Madeline','Madge','Madison','Madonna','Madra','Madrona','Mae','Maeko','Maemi','Maeron','Maeryn','Maeve','Magan','Magda','Magdalena','Magdalene','Magee','Maggie','Magnar','Magnolia','Maha','Mahala','Mahalia','Mahari','Mahdi','Maia','Maik','Maille','Maimun','Maire','Mairi','Maisie','Maj','Major','Makaila','Makale','Makalo','Makani','Makenna','Makya','Malachi','Malaika','Malana','Malaya','Malcolm','Maleah','Malia','Malina','Malissa','Malka','Mallory','Malo','Malomo','Malone','Malory','Mana','Mandel','Mandell','Mandy','Manica','Manning','Manon','Mansa','Manuel','Manuela','Mara','Marc','Marcel','Marcell','Marcella','Marcello','Marcellus','Marcia','Marcie','Marco','Marcus','Marcy','Mardell','Mardi','Mare','Maree','Marek','Maren','Marenda','Margaret','Margarita','Marge','Margo','Margot','Marguerite','Mari','Maria','Mariah','Mariam','Marianne','Mariatu','Maribel','Maribeth','Marie','Mariel','Marietta','Marigold','Marijke','Marika','Marilu','Marilyn','Marin','Marina','Marinel','Mario','Marion','Maris','Marisa','Marisela','Marisol','Marissa','Marius','Marjean','Marjorie','Mark','Marka','Marlas','Marlene','Marli','Marlie','Marlin','Marlo','Marlon','Marlow','Marly','Marnie','Marnin','Marnina','Maro','Marrim','Marsha','Marshall','Marta','Martha','Martin','Martina','Marty','Marv','Marva','Marvel','Marvela','Marvene','Marvin','Mary','Masada','Mashaka','Mason','Massimo','Matana','Mateo','Mathilda','Mathilde','Matia','Matias','Matilda','Matilde','Matrika','Matsu','Matt','Matteo','Matthew','Matthias','Mattox','Matty','Maude','Mauli','Maura','Maureen','Maurice','Maurilio','Maurizio','Mauro','Mauve','Maverick','Mavis','Max','Maxim','Maxima','Maxime','Maximilian','Maximos','Maxine','Maxwell','May','Maya','Mayan','Mayda','Mayes','Maylin','Maynard','Mckale','Mckayla','Mckenna','Mea','Mead','Meara','Meda','Medard','Medea','Meg','Megan','Meged','Mehalia','Mei','Meir','Mekelle','Mel','Melania','Melanie','Melantha','Melba','Melchior','Mele','Meli','Melia','Melina','Melinda','Meliora','Melisande','Melissa','Melita','Melody','Melora','Melosa','Melva','Melvin','Melvina','Melvyn','Mendel','Menora','Mercedes','Mercer','Mercia','Mercy','Meredith','Meria','Meris','Merle','Merlin','Merrill','Merritt','Merry','Merton','Merv','Mervin','Mervyn','Meryl','Meryle','Meshal','Messina','Metea','Mettabel','Mia','Micah','Michael','Michaela','Michal','Michel','Michele','Micheline','Michelle','Michon','Mick','Mickey','Micol','Mieko','Miette','Migdana','Mignon','Mika','Mikaili','Mike','Mikhail','Miki','Mikkel','Milan','Milandu','Mildred','Miles','Mili','Miliani','Miller','Millicent','Millie','Mills','Milly','Milo','Milt','Milton','Mimi','Mina','Minda','Mindy','Minerva','Miniya','Minna','Minnie','Minor','Minty','Mio','Mira','Mirabel','Mirabelle','Miracle','Miranda','Mircea','Mireille','Mirella','Miriam','Mirit','Miroslav','Mirra','Misae','Misha','Misty','Misu','Mitch','Mitchel','Mitchell','Miya','Miyanda','Miyoko','Mizell','Moana','Moanna','Modesta','Modesty','Mohammed','Mohan','Moina','Moira','Moke','Molly','Mona','Monahan','Monica','Monita','Monroe','Montague','Montana','Monte','Montego','Montgomery','Monty','Moon','Moon-unit','Mora','Moral','Morathi','Mordecai','More','Morela','Morey','Morgan','Morgana','Moriah','Moriba','Morley','Morna','Morrie','Morrigan','Morris','Morrison','Morse','Mort','Mortimer','Morton','Morty','Morwenna','Moses','Moshe','Moss','Mostyn','Moya','Moyna','Mrena','Muhammad','Muna','Mura','Muriel','Murphy','Murray','Murron','Musoke','Mutia','Mykel','Myles','Myra','Myrilla','Myrladis','Myrna','Myron','Myrtle','Naal','Nadia','Nadie','Nadine','Nafis','Nafuna','Naiser','Nakima','Nalo','Namir','Nan','Nancy','Nanette','Nani','Naolin','Naoll','Naomi','Napoleon','Nara','Narcisse','Nardo','Nariah','Nascha','Nasha','Nasia','Nasser','Nat','Natala','Natalia','Natalie','Natalya','Natane','Natasha','Nate','Nathalie','Nathan','Nathaniel','Natine','Natividad','Natori','Natsu','Nature','Navarro','Naveen','Navid','Nawal','Nayati','Nayeli','Nayer','Neal','Nealon','Necia','Neda','Nedra','Neely','Neena','Neetee','Neil','Nelia','Nellie','Nelson','Nen','Nenet','Neola','Nerina','Nerine','Nerissa','Nerita','Nero','Nessa','Nessan','Nestor','Netanya','Neva','Nevada','Nevan','Neville','Newman','Nia','Niabi','Niall','Niamh','Nichelle','Nicholai','Nicholas','Nick','Nicki','Nicodemus','Nicola','Nicole','Nicolette','Niel','Nigel','Nijole','Nikhil','Nikita','Nikki','Nikkos','Niles','Nimeesha','Nina','Ninon','Nira','Nissa','Nita','Nitara','Nitesh','Nitis','Niv','Nixie','Nizana','Noah','Noam','Nodin','Noe','Noel','Noelani','Nokomis','Nola','Nolan','Noland','Noma','Nomlanga','Nona','Nonnie','Nora','Norah','Noreen','Nori','Norina','Norm','Norma','Norman','Normandy','Norris','Norton','Norwood','Nova','Novia','Nowles','Noxolo','Noya','Nuncio','Nuri','Nuru','Nyako','Nydia','Nyeki','Nyoka','Nysa','Nyx','Oafe','Oakes','Oakley','Obedience','Oberon','Obert','Oceana','Octavia','Octavio','Octavious','Odele','Odelia','Odell','Odessa','Odetta','Odette','Odina','Odysseus','Ofer','Ogden','Ogima','Ohio','Oistin','Okal','Okalik','Okapi','Oke','Okechuku','Okoth','Oksana','Ola','Olaf','Olathe','Oleg','Olesia','Olga','Olin','Olinda','Olive','Oliver','Olivia','Ollie','Olympia','Omar','Omega','Ona','Onan','Oneida','Oni','Onslow','Oona','Opa','Opal','Ophelia','Ophira','Oprah','Ora','Oral','Oralee','Oran','Orane','Orde','Oren','Orenda','Oria','Oriana','Oriel','Orien','Oringo','Orino','Oriole','Orion','Orla','Orlando','Orleans','Orlee','Orli','Orly','Orma','Ormand','Orrick','Orsen','Orsin','Orson','Orton','Orville','Osanna','Osaze','Osborn','Osborne','Oscar','Osgood','Osias','Oskar','Osma','Osmond','Ossian','Ossie','Oswald','Othello','Otis','Otto','Ouray','Ova','Overton','Ovid','Owen','Ownah','Oz','Ozzie','Pabla','Pablo','Packard','Paco','Paddy','Page','Paige','Palani','Palesa','Paley','Pallas','Palma','Palmer','Paloma','Palti','Pamela','Pamelia','Pancho','Pandora','Panfila','Paniga','Panya','Paola','Paolo','Papina','Paris','Parker','Parkin','Parlan','Parley','Parrish','Parry','Parson','Pascal','Pascale','Pascha','Pasi','Patch','Patience','Patricia','Patrick','Patsy','Patty','Paul','Paula','Paulette','Paulina','Pauline','Paulo','Paulos','Paxton','Payton','Paz','Peale','Pearl','Pearlie','Pearly','Pebbles','Pedro','Peggy','Pelagia','Pelham','Pembroke','Penelope','Penn','Penney','Pennie','Penny','Peony','Pepper','Percival','Percy','Perdita','Perdy','Peregrine','Peri','Perrin','Perry','Pete','Peter','Petra','Petula','Petunia','Peyton','Phaedra','Phemia','Phiala','Phil','Phila','Philana','Philena','Philip','Phillip','Philomena','Philyra','Phindiwe','Phoebe','Phylicia','Phyliss','Phyllis','Phyre','Pia','Picabo','Pier','Piera','Pierce','Pierre','Pierrette','Pilar','Pillan','Piper','Pirro','Piuta','Placido','Plato','Platt','Pleasance','Plennie','Polly','Polo','Ponce','Poppy','Poria','Porter','Posy','Powa','Prentice','Prescott','Presencia','Preston','Price','Primo','Prince','Priscilla','Procopia','Prudence','Prue','Prunella','Psyche','Pyralis','Qabil','Qamar','Qiana','Qing-jao','Quade','Quana','Quanda','Quang','Queenie','Quella','Quennell','Quentin','Querida','Quiana','Quilla','Quillan','Quimby','Quin','Quincy','Quinlan','Quinn','Quinta','Quintin','Quinto','Quinton','Quirino','Quon','Qwin','Rabia','Rach','Rachael','Rachel','Rachelle','Radley','Radwan','Rae','Raeanne','Raegan','Rafael','Raffaello','Rafi','Raimi','Raina','Raine','Raisa','Raja','Raleigh','Ralph','Ramiro','Ramon','Ramona','Ramses','Ranae','Randall','Randilyn','Randolph','Randy','Rane','Ranee','Rania','Ranit','Raphael','Raphaela','Raquel','Rasha','Rashida','Rasia','Raul','Raven','Ravi','Ray','Raymond','Rayya','Razi','Rea','Read','Reagan','Reba','Rebecca','Rebekah','Red','Redell','Redford','Reed','Reese','Reeves','Regan','Regina','Reginald','Reilly','Reina','Remedy','Remi','Remington','Remy','Ren','Rena','Renata','Renate','Rene','Renee','Renny','Reth','Reuben','Revelin','Rex','Rey','Reyna','Reynard','Reynold','Reza','Rhea','Rhett','Rhiannon','Rhoda','Rhodes','Rhona','Rhonda','Rhoswen','Rhys','Ria','Rianna','Rianne','Ricardo','Rich','Richard','Ricjunette','Rick','Rico','Rider','Rigg','Riley','Rimca','Rimona','Rina','Ringo','Riona','Riordan','Risa','Rita','Riva','Rivka','Rob','Robbin','Robert','Robin','Robyn','Rocco','Rochelle','Rocio','Rock','Rockne','Rockwell','Rocky','Rod','Rodd','Roddy','Roderick','Rodney','Roger','Roland','Rolando','Rolf','Rollo','Romaine','Roman','Romeo','Rona','Ronald','Ronalee','Ronan','Ronat','Ronda','Ronia','Ronli','Ronna','Ronnie','Ronny','Roosevelt','Rori','Rory','Ros','Rosalba','Rosalia','Rosalind','Rosalyn','Rosamunde','Rose','Roseanne','Roselani','Rosemary','Roshaun','Rosie','Rosine','Ross','Rossa','Rothrock','Rowan','Rowdy','Rowena','Roxanne','Roy','Royce','Roz','Roza','Ruby','Rudolph','Rudra','Rudy','Rufina','Rufus','Rumer','Runa','Rune','Rupert','Russ','Russell','Russom','Rusti','Rusty','Ruth','Ryan','Ryder','Rylan','Ryland','Rylee','Rylie','Ryo','Saba','Sabina','Sabine','Sabra','Sabrina','Sachi','Sadie','Sadiki','Sadira','Safara','Saffron','Safina','Sage','Sahara','Saidi','Saku','Sal','Salena','Salene','Sally','Salome','Salvador','Salvatore','Sam','Samantha','Samson','Samuel','Sandra','Sandro','Sandy','Sanford','Sanjay','Sanjeet','Sanne','Santo','Santos','Sanyu','Sapphire','Sara','Sarah','Saraid','Sarama','Sarda','Sargent','Sarki','Sasha','Sasilvia','Saskia','Satchel','Satin','Satinka','Satu','Saul','Savannah','Sawyer','Saxen','Saxon','Saxton','Scarlet','Scarlett','Schuyler','Scot','Scott','Seamus','Sean','Seanna','Season','Sebastian','Sebastien','Seda','Seema','Seghen','Seiko','Selas','Selena','Selene','Selia','Selima','Selina','Selma','Sema','Semele','Semira','Senalda','September','Sera','Serafina','Serena','Serendipity','Serenity','Serepta','Serge','Sergio','Serwa','Seth','Seven','Severino','Sevinc','Seymour','Shacher','Shaina','Shakia','Shakila','Shakir','Shakira','Shakti','Shalaidah','Shaman','Shamara','Shamira','Shamus','Shana','Shandi','Shane','Shani','Shannen','Shannon','Shanon','Shantell','Shaquille','Sharis','Sharlene','Sharne','Sharon','Shasa','Shaun','Shauna','Shaunna','Shaw','Shawn','Shawna','Shay','Shea','Sheba','Sheehan','Sheena','Sheera','Sheila','Shel','Shelby','Sheldon','Shelley','Shelly','Sheri','Sheridan','Sherine','Sherise','Sherman','Sherri','Sherrie','Sherry','Sheryl','Shiela','Shiloh','Shing','Shino','Shira','Shiri','Shirley','Shirlyn','Shlomo','Shona','Shoshana','Shoshanah','Shubha','Sian','Sibyl','Sid','Sidney','Sidonia','Sidra','Sienna','Sierra','Signa','Sika','Silvain','Silvana','Silver','Sima','Simon','Simone','Sinclair','Sine','Sinead','Sinjin','Siobhan','Sissy','Sivney','Skip','Skipper','Skylar','Skyler','Slade','Sloan','Sloane','Slone','Smedley','Snow','Snowy','Sofia','Sol','Solace','Solana','Solange','Soleil','Solomon','Sondo','Sondra','Sonia','Sonnagh','Sonora','Sonya','Sophia','Sophie','Sora','Sorcha','Soren','Sorley','Spence','Spencer','Speranza','Spike','Stacey','Stacia','Stacy','Stan','Stanislaus','Stanislav','Stanislaw','Stanley','Star','Starr','Stavros','Stefan','Stefanie','Steffi','Steffie','Stella','Step','Stephan','Stephanie','Stephen','Stephenie','Sterling','Steve','Steven','Stevie','Stew','Stewart','Stillman','Stockton','Stone','Storm','Stormy','Stu','Stuart','Studs','Sue','Sugar','Sukey','Suki','Sulis','Sully','Sumana','Summer','Sunee','Sunny','Susan','Susane','Susanna','Susannah','Susie','Sutton','Suzanne','Suzette','Suzy','Svein','Sveta','Sybil','Sydnee','Sydney','Sylvain','Sylvester','Sylvia','Sylvie','Synan','Synclair','Syshe','Ta\'ib','Tab','Taban','Taber','Tabitha','Tacita','Tacy','Tad','Tadelesh','Tadhg','Taffy','Tai','Taifa','Tailynn','Taima','Tait','Tala','Talen','Talia','Taliesin','Talisa','Talisha','Talitha','Tallis','Tallulah','Talmai','Tam','Tama','Tamah','Tamara','Tamasha','Tamasine','Tamatha','Tambre','Tamera','Tameron','Tamika','Tammy','Tana','Tandice','Tanesia','Tania','Tanisha','Tanith','Tanner','Tanya','Tao','Tara','Taran','Tarana','Tarika','Tarin','Taru','Taryn','Tasha','Tasida','Tasmine','Tassos','Tate','Tatiana','Taurean','Tave','Tavi','Tavia','Tavita','Tawana','Taylor','Tazara','Tea','Teagan','Teague','Teal','Tecla','Ted','Teddy','Teenie','Tefo','Teige','Teleza','Teli','Telly','Telma','Temima','Temira','Temple','Templeton','Tenen','Teo','Terena','Terence','Terentia','Teresa','Termon','Terra','Terran','Terrel','Terrence','Terris','Terry','Terryal','Tertius','Tertullian','Terweduwe','Teshi','Tess','Tessa','Tex','Thad','Thaddeus','Thadeus','Thady','Thalassa','Thalia','Than','Thandeka','Thane','Thanh','Thatcher','Thayer','Thea','Thel','Thelma','Thema','Themba','Theo','Theodora','Theodore','Theresa','Therese','Thina','Thom','Thomas','Thor','Thora','Thornton','Thrine','Thron','Thurman','Thyra','Tia','Tiana','Tiaret','Tiassale','Tierney','Tiffany','Tilden','Tillie','Tilly','Tim','Timothy','Tina','Tino','Tip','Tirza','Tirzah','Tisha','Tivona','Toan','Tobit','Toby','Tod','Todd','Toki','Tolla','Tom','Tomas','Tommy','Tomo','Toni','Tony','Topaz','Topaza','Topo','Topper','Tori','Torie','Torn','Torrance','Torrin','Tory','Toshi','Totie','Tova','Tovah','Tovi','Townsend','Toyah','Tracey','Tracy','Traelic-an','Trahern','Tranquilla','Trapper','Trava','Travis','Trella','Trent','Trevor','Trey','Tricia','Trilby','Trina','Trini','Trinity','Trish','Trisha','Trista','Tristan','Tristana','Tristessa','Tristram','Trixie','Trory','Troy','Truda','Trude','Trudy','Trula','Truly','Truman','Tryphena','Tudor','Tuesday','Tulla','Tully','Tumo','Tuyen','Twila','Twyla','Ty','Tyanne','Tybal','Tyler','Tyme','Tyne','Tyra','Tyree','Tyrone','Tyson','Uang','Uba','Uday','Ugo','Ujana','Ula','Ulan','Ulani','Ulema','Ulf','Ull','Ulla','Ulric','Ulysses','Uma','Umay','Umberto','Umeko','Umi','Ummi','Una','Unity','Upendo','Urania','Urbain','Urban','Uri','Uriah','Uriel','Urilla','Urit','Ursa','Ursala','Ursula','Uta','Ute','Vail','Val','Valarie','Valencia','Valentina','Valentine','Valeria','Valerie','Valiant','Vallerie','Valtina','Van','Vance','Vandalin','Vanessa','Vangie','Vanna','Varen','Vaschel','Vatusia','Vaughan','Vaughn','Vea','Veasna','Vega','Velma','Venedict','Venetia','Vera','Verda','Verdi','Vern','Verna','Verne','Vernon','Veronica','Vesta','Vevay','Vevina','Vi','Vic','Vicki','Vicky','Victor','Victoria','Vida','Vidal','Vidor','Vienna','Vila','Vince','Vincent','Vine','Vinnie','Vinny','Vinson','Viola','Violet','Virgil','Virginia','Visola','Vita','Vitalis','Vito','Vittorio','Vivek','Vivi','Vivian','Viviana','Vivienne','Vlad','Vladimir','Volleny','Von','Vonda','Vondila','Vondra','Vui','Wade','Wafa','Waggoner','Walda','Waldo','Walker','Wallace','Walt','Walta','Walter','Wanda','Waneta','Ward','Warner','Warren','Wasaki','Washi','Washington','Waverly','Wayne','Webster','Welcome','Wenda','Wendell','Wendi','Wendy','Werner','Wes','Wesley','Weston','Wheeler','Whitby','Whitfield','Whitley','Whitney','Wilbur','Wiley','Wilford','Wilfred','Wilhelmina','Will','Willa','Willard','Willem','William','Willis','Wilma','Wilson','Wilton','Winda','Winfred','Winifred','Winona','Winslow','Winston','Winta','Winthrop','Wolfgang','Wood','Woodrow','Woods','Woody','Worden','Wyatt','Wyman','Wynn','Wynne','Wynona','Wyome','Xandy','Xanthe','Xanthus','Xanto','Xavier','Xaviera','Xena','Xenia','Xenophon','Xenos','Xerxes','Xi-wang','Xinavane','Xolani','Xuxa','Xylon','Yachi','Yadid','Yael','Yaholo','Yahto','Yair','Yale','Yamal','Yamin','Yana','Yancy','Yank','Yanka','Yanni','Yannis','Yardan','Yardley','Yaro','Yaron','Yaser','Yasin','Yasmin','Yasuo','Yates','Ye','Yeardleigh','Yehudi','Yelena','Yen','Yenge','Yepa','Yered','Yeriel','Yestin','Yetty','Yeva','Yihana','Yitro','Ymir','Yo','Yogi','Yoko','Yoland','Yolanda','Yonah','Yoninah','Yorick','York','Yosef','Yosefu','Yoshi','Yoshino','Yuk','Yuki','Yukio','Yul','Yule','Yuma','Yuri','Yuval','Yves','Yvette','Yvon','Yvonne','Zaccheus','Zach','Zachariah','Zachary','Zaci','Zada','Zahur','Zaida','Zaide','Zaila','Zaire','Zaki','Zalman','Zan','Zane','Zanna','Zara','Zareb','Zared','Zareh','Zarek','Zarifa','Zarina','Zavad','Zayn','Zaza','Zazu','Zbigniew','Ze\'ev','Zea','Zeb','Zebidy','Zebulon','Zed','Zedekiah','Zef','Zeheb','Zeke','Zeki','Zelda','Zelia','Zelig','Zena','Zenas','Zene','Zenia','Zenobia','Zenon','Zephan','Zesiro','Zev','Zia','Ziazan','Zikomo','Zili','Zilli','Zimri','Zinna','Zinnia','Zion','Ziraili','Zita','Ziv','Zivan','Ziven','Ziya','Zizi','Zo','Zoan','Zoe','Zoey','Zofia','Zohar','Zoie','Zola','Zoltan','Zoltin','Zona','Zorada','Zsa Zsa','Zula','Zuleika','Zulema','Zuriel','Zwi','Zyta'];

function getName() {
  return randomItem(names);
}

let catIcons = ['🐈', '😸','😼','😽','😾','😿','🙀','🐱‍👤','🐱‍💻','🐱‍🐉','🐱‍👓','🐱‍🚀','🐱‍🏍','😹','😻'];
let dogIcons = ['🐕','🐶','🐩'];
let projectPart0 = ['project', 'operation', 'system', 'the','strategy','industrial','project'];//,'account','group'];
let projectPart1 = ['robot','red','crimson','magenta','violet','shocking','hot','neat','wonder','tasty','cruel','crisp','brave','rasping','ghostly','shrieking','sneaky','slippy','steam','chaos','hot','nasty','pure','cold','black','orange','blue','green','violet','crystal','steam','ocean','plaid','sabre','icy','dry'];
let projectPart2 = ['hat','puzzle','cobra','window','monkey', 'donkey','blaze','jacobite','zebra','centurion','dawn','alpha','wave','banjo','cats','axe','teeth','calculo','whisper','december','axe','narwhal','sloth','otter','bacon','penguin','tiger','island','duck','goat','disco','torch','ember','cargo','flare','night','creek','gnocchi'];

function projectName() {
  return randomItem(projectPart0) + " " + randomItem(projectPart1) + "-" + randomItem(projectPart2);
}
let icons = ['😕','😉','😕','🙄','🤣','😀','🙃','😁','😂','🤣','😃','😄','😅','😆','😗','😘','😍','😎','😋','😊','😉','😙','😚','🙂','🤗','🤔','😜','😛','😌','😴','😫','😪','😯','🤐','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🙁','😖','😞','😟','😤','😢','😰','😬','😨','😩','😬','😰','😠','😵','😳','😱','😡','😷','🤒','🤕','🤢','🤧','🤥','🤡','🤠','😇','🤓','😈','👿','👹','👺'];
function getIcon() {
  return randomItem(icons);
}
let logos = ['🎈','🎈','🎆','🎇','✨','🎉','🎊','🎃','🎄','🎋','🎍','🎎','🎏','🎐','🎑','🎀','🎗','🎟','🎫','🎠','🎡','🎢','🎪','🎭','🖼','🎨','🛒','👓','🕶','🧥','👔','👕','👖','🧣','🧤','🧦','👗','👘','👙','👚','👛','👜','👝','🛍','🎒','👞','👟','👠','👢','👑','🧢','👒','🎩','🎓','💋','💄','💍','💎','⚽','⚾','🏀','🏐','🏈','🏉','🎱','🎳','🥌','⛳','⛸','🎣','🎽','🛶','🎿','🛷','🥅','🏒'];
function getLogo() {
  return randomItem(logos);
}
// todo: alphabetic ordering
let taskParts = ['validation','logical','virtual','structural','micro','hyper','accessible','indirect','pointer','truth','business','customer','person','manipulation','pure','seamless','crypto','interactive','SEO','custom','web','auto','digital','cyber','secure','3D','enterprise','pro','developer','augmented','robo','productivity','neural','positronic','computery','deep','immutable','functional','lock-free','meta','native','non-virtual','opinionated','recursive','p2p','yet another','distributed','reticulated','hierarchical','obfuscated','weaponised','graphical','cloud-based','ethical','point-free','chat','social','mobile','embedded','critical','organic','user-generated','self-service','nano','pico','femto','keyword','A/B','optimal','high-res','retina','vector','raster','semantic','structural','self-closing','reverse','responsive','progressive','hybrid','pseudo','shadow','no-sql','big-data','uptime','offline','satellite','nuclear','hydrogen','batch','bulk','excessive','third-normal','logarithmic','linguistic'];

// todo: alphabetic ordering
// note: should be singular.
let taskParts2 = ['logic','algo','mesh','structure','form','service','container','data','DB','UX','UI','layer','component','system','diagram','app','client','server','host','class','object','function','job','part','platform','framework','foundation','emailer','pager','plugin','addin','2.0','automation','cybernetics','drone','graphic','artwork','architecture','collector','list','heuristic','solver','network','net','9000','2001','multiplexor','switch','hub','paradigm','catalog','registry','RIA','SPA','IP','JSON','XML','CSV','Yaml','Macro','analytics','cluster','node','graph','avatar','reticulator','spline','hierarchy','thread','logging','engine','blockchain','map-reduce','content','exploit','hack','style','customization','RAM','DRM','GPGPU','wiki','devops','devoops','cta','funnel','theory','pixels','persona','parser','combinator','property','fields','attribute','column','sheet','datamodel','controller','sdk','DOM','RDBMS','vpn','vm','firewall','proxy','cache','laser','reactor','core','accelerator'];

function getTask() {
  return randomItem(taskParts) + ' ' + randomItem(taskParts2);
}

function LevelUp() {
  game.XP -= game.LevelUpXP;
  game.Level += 1;
  
  drawMessage(`Level Up! ${game.Level}🥑`);
  game.LevelUpXP = Inflate(game.Inflation, game.LevelUpXP);
  game.PointPrice = Inflate(game.Inflation, game.PointPrice);
  game.ProjectSize = Inflate(game.SmallInflation, game.ProjectSize);
  let items = game.AllLevelItems["l" + game.Level];
  if (items != undefined) {
    for(const item of items) {
      game.StoreItems[item.id].enabled = true;//.push(item);
    }
    addClass(".visitStore", 'hint');
  }
  console.log("StoreItems", game.StoreItems);

  switch(game.Level) {
    case 2:
    //show 'hire dev/tester/ba' buttons
      removeClass('.getPerson.dev', 'hidden'); 
      addClass(".getPerson.dev", 'hint');
      if (storeFeatureFlag) {
        removeClass('.visitStore', 'hidden');
        addClass(".visitStore", 'hint');
      }
      break;
    case 3:
      removeClass('.getPerson.test', 'hidden'); 
      addClass('.getPerson.test', 'hint');
      break;
    case 4:
      removeClass('.getPerson.ba', 'hidden'); 
      addClass('.getPerson.ba', 'hint');
      break;
  }

}


//TODO: add this to game class
function incrementXP(amount: number) {

  if (game.Money < 0){
    //You owe money? Then you don't get to grow your XP.
    // instead, you grow your debt! Mwuahahahaha.
    incrementMoney(amount * -2);
    return;
  }
  game.XP += amount;

  if (game.XP >= game.LevelUpXP) {
    //LEVEL UP!
    LevelUp();
  }

  game.TotalXP += amount;

  drawXP(game.XP, game.LevelUpXP, game.Level);
}

function Inflate(inflation:number, value:number) {
  let newValue = Math.floor(inflation * value);
  if (value == newValue) newValue++;
  return newValue;
}

// TODO: add this to game class
function incrementMoney(amount: number):void {
  game.Money += amount;
  if (game.Money >= game.HighestMoney) {
    game.HighestMoney = game.Money;
  }

  drawMoney(game.Money);
}

function visitStore() {
  DeSelectDoerAndReceiver();
  removeClass('.visitStore', 'hint');

  //change title to 'DevStore'
  $('h1')[0].innerText = "DevStore";
  drawStore();
  $id('store').classList.remove('hidden');
  $id('office').classList.add('hidden');
}

function describe(itemId:number){
  let item:StoreItem = game.StoreItems[itemId];
  if (!item.enabled){
    drawMessage(`"${item.name} ${item.icon}" is not available until a higher level`);
    return;
  }
  drawMessage(`"${item.name} ${item.icon}" ${item.description}`);
}
function drawStore() {
  let itemList = $id('items');
  // clear store items from #items
  itemList.innerText = "";
  // add store items to #items  
  //for(const item of game.StoreItems){
  for (let key of Object.keys(game.StoreItems)) {
    let item = game.StoreItems[key];
    let shtml = `<div class='storeItem-catalog ${item.enabled? 'item-enabled' : 'item-disabled'}'><div onclick='purchase(${item.id});' class='button' id='store-button-${item.id}'>💲${item.price}</div><span class='storeIcon'>${item.icon}</span> <span class='item-name'>${item.name}</span><span class='describe' onclick='describe(${item.id});' title='more information'>❓</span></div>`;
    console.log("item html", shtml);
    let newItem = htmlToElement(shtml);
    itemList.appendChild(newItem);
    console.log("store item",item, newItem.outerHTML);
  }
}

function leaveStore() {
  DeSelectDoerAndReceiver();
  $id('store').classList.add('hidden');
  $id('office').classList.remove('hidden');
  //change title back to 'DevShop'
  $('h1')[0].innerText = "DevShop";
}

function purchase(itemId:number):void {
  let item:StoreItem = game.StoreItems[itemId];//.filter(i => i.id == itemId)[0];
  
  if (!item.enabled) {
    drawMessage(`The ${item.name} ${item.icon} is not yet available`);
    return;
  }

  if (game.Money < item.price) {
    drawMessage(`You cannot afford the ${item.name} ${item.icon} for 💲${item.price}`);
    return;
  }

  incrementMoney(item.price * -1);

  // Add a shallow clone of the item (not the item itself)
  let clone = Object.assign({}, item);
  clone.id = nextId();
  game.Items["i" + clone.id] = clone;
  
  drawMessage(`You bought ${clone.name} ${clone.icon} for 💲${clone.price}. Nice!`);
  
  // Every time you purchase an item, the price of that time goes up, a lot.
  // consider: some specific items should have a different inflation curve. 
  item.price = Inflate(game.MediumInflation, item.price);

  drawInboxItem("i" + clone.id, clone);
  $id("store-button-" + itemId).innerText = `💲${item.price}`;
}

function jalert(obj:any){
  alert(JSON.stringify(obj));
}

function log(message:string){
  if (debugOutput) {
    let m = htmlToElement(`<div>${message}</div>`);
    $id('debug').appendChild(m);
  }

  console.log(message);
}