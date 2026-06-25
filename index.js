const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req,res)=>{
  res.writeHead(200);
  res.end("Bot is alive!");
}).listen(PORT,"0.0.0.0",()=>{
  console.log(`Web server running on ${PORT}`);
});


const {
Client,
GatewayIntentBits,
Events,
SlashCommandBuilder,
REST,
Routes
} = require("discord.js");


const TOKEN = process.env.TOKEN;

const CLIENT_ID = "1519773601438503002";
const GUILD_ID = "1519659693025525881";


const client = new Client({
 intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers
 ]
});


// one Vision only
const completedUsers = new Set();


const questions = [

{
q:"A dream seems impossible. What do you do?",
a:[
["Continue forward even alone","pyro"],
["Find another route","anemo"],
["Protect those with me","geo"],
["Understand the problem first","dendro"]
]
},

{
q:"People trust you because you are...",
a:[
["Strong and determined","electro"],
["Patient and calm","cryo"],
["Supportive and understanding","hydro"],
["Reliable","geo"]
]
},

{
q:"When challenged you...",
a:[
["Prove yourself through action","pyro"],
["Adapt quickly","anemo"],
["Think deeper","dendro"],
["Stand firm","geo"]
]
},

{
q:"Your greatest strength is...",
a:[
["Willpower","electro"],
["Freedom","anemo"],
["Compassion","hydro"],
["Endurance","cryo"]
]
},

{
q:"During a crisis you...",
a:[
["Take control","electro"],
["Create a plan","dendro"],
["Help everyone cooperate","hydro"],
["Stay steady","cryo"]
]
},

{
q:"What do you value most?",
a:[
["Achievement","pyro"],
["Truth","dendro"],
["Peace","anemo"],
["Loyalty","geo"]
]
},

{
q:"After failure you...",
a:[
["Try again stronger","pyro"],
["Change your approach","hydro"],
["Learn from it","cryo"],
["Protect what remains","geo"]
]
}

];


const commands=[
 new SlashCommandBuilder()
 .setName("visiontest")
 .setDescription("Take your Vision ceremony")
].map(c=>c.toJSON());


const rest=new REST({version:"10"})
.setToken(TOKEN);



(async()=>{

await rest.put(
 Routes.applicationGuildCommands(
  CLIENT_ID,
  GUILD_ID
 ),
 {body:commands}
);

console.log("Commands loaded");

})();



client.on(
Events.GuildMemberAdd,
async member=>{

let role =
member.guild.roles.cache.find(
r=>r.name==="Unawakened Traveler"
);

if(role)
await member.roles.add(role);

});



client.on(
Events.InteractionCreate,
async interaction=>{


if(!interaction.isChatInputCommand())
return;


if(interaction.commandName==="visiontest"){


if(completedUsers.has(interaction.user.id)){

return interaction.reply({
content:
"✨ Your fate has already been decided. A person receives only one Vision.",
ephemeral:true
});

}



let scores={
pyro:0,
hydro:0,
cryo:0,
anemo:0,
geo:0,
electro:0,
dendro:0
};


let current=0;



await interaction.reply({
content:
`✨ Vision Ceremony ✨

${questions[current].q}

1) ${questions[current].a[0][0]}
2) ${questions[current].a[1][0]}
3) ${questions[current].a[2][0]}
4) ${questions[current].a[3][0]}

Reply with 1-4`,
ephemeral:true
});



const collector =
interaction.channel.createMessageCollector({
filter:m=>m.author.id===interaction.user.id,
time:120000
});



collector.on(
"collect",
async msg=>{


let choice =
Number(msg.content)-1;


if(choice<0 || choice>3)
return msg.reply("Reply with 1-4");


scores[
questions[current].a[choice][1]
]++;



current++;



if(current>=questions.length){


collector.stop();



let vision =
Object.keys(scores)
.reduce((a,b)=>
scores[a]>=scores[b]?a:b);



let names={

pyro:"Pyro Vision",
hydro:"Hydro Vision",
cryo:"Cryo Vision",
anemo:"Anemo Vision",
geo:"Geo Vision",
electro:"Electro Vision",
dendro:"Dendro Vision"

};



let role =
interaction.guild.roles.cache.find(
r=>r.name===names[vision]
);



let old =
interaction.guild.roles.cache.find(
r=>r.name==="Unawakened Traveler"
);



if(role)
await interaction.member.roles.add(role);


if(old)
await interaction.member.roles.remove(old);



completedUsers.add(
interaction.user.id
);



return msg.reply(
`✨ A Vision has descended from Celestia! ✨

Congratulations ${interaction.user}

Your fate has been recognized.

You received a ${names[vision]}.`
);



}



let q=questions[current];


msg.reply(
`${q.q}

1) ${q.a[0][0]}
2) ${q.a[1][0]}
3) ${q.a[2][0]}
4) ${q.a[3][0]}`
);



});

}


});



client.login(TOKEN);
