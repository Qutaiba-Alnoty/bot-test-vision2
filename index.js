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
Routes,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
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



const completedUsers = new Set();


const activeTests = new Map();



const questions = [

{
q:"A dream seems impossible. What do you do?",
a:[
["Continue forward","pyro"],
["Find another route","anemo"],
["Protect others","geo"],
["Understand the problem","dendro"]
]
},

{
q:"People trust you because you are...",
a:[
["Determined","electro"],
["Patient","cryo"],
["Supportive","hydro"],
["Reliable","geo"]
]
},

{
q:"When challenged you...",
a:[
["Act immediately","pyro"],
["Adapt quickly","anemo"],
["Think deeper","dendro"],
["Stand firm","geo"]
]
},

{
q:"Your greatest strength is...",
a:[
["Ambition","electro"],
["Freedom","anemo"],
["Kindness","hydro"],
["Endurance","cryo"]
]
},

{
q:"During a crisis you...",
a:[
["Take control","electro"],
["Create solutions","dendro"],
["Unite people","hydro"],
["Remain calm","cryo"]
]
},

{
q:"What matters most to you?",
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
["Try again","pyro"],
["Change approach","hydro"],
["Learn","cryo"],
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





function buttonsFor(userId){

let test = activeTests.get(userId);

let q = questions[test.index];


return new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("answer0")
.setLabel(q.a[0][0])
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("answer1")
.setLabel(q.a[1][0])
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("answer2")
.setLabel(q.a[2][0])
.setStyle(ButtonStyle.Secondary),

new ButtonBuilder()
.setCustomId("answer3")
.setLabel(q.a[3][0])
.setStyle(ButtonStyle.Secondary)

);

}




client.on(
Events.InteractionCreate,
async interaction=>{



if(
interaction.isChatInputCommand() &&
interaction.commandName==="visiontest"
){



if(completedUsers.has(interaction.user.id)){

return interaction.reply({
content:
"✨ Your fate has already been decided. You only receive one Vision.",
ephemeral:true
});

}



activeTests.set(
interaction.user.id,
{
index:0,
scores:{
pyro:0,
hydro:0,
cryo:0,
anemo:0,
geo:0,
electro:0,
dendro:0
}
}
);



await interaction.reply({

content:
`✨ Vision Ceremony ✨

${questions[0].q}`,

components:[
buttonsFor(interaction.user.id)
],

ephemeral:true

});



}





if(interaction.isButton()){


let test =
activeTests.get(interaction.user.id);



if(!test){

return interaction.reply({
content:"No active Vision test.",
ephemeral:true
});

}



let choice =
Number(
interaction.customId.replace("answer","")
);



let element =
questions[test.index]
.a[choice][1];



test.scores[element]++;


test.index++;



if(test.index >= questions.length){



let vision =
Object.keys(test.scores)
.reduce((a,b)=>
test.scores[a]>=test.scores[b]?a:b);



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



activeTests.delete(
interaction.user.id
);



return interaction.update({

content:
`✨ A Vision has descended from Celestia! ✨

Congratulations ${interaction.user}

Your fate has been recognized.

You received a ${names[vision]}.`,

components:[]

});

}



await interaction.update({

content:
`✨ Vision Ceremony ✨

${questions[test.index].q}`,

components:[
buttonsFor(interaction.user.id)
]

});

}


});




client.login(TOKEN);
