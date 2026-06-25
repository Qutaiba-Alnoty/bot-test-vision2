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


const client = new Client({
 intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers
 ]
});


// slash command
const commands = [
 new SlashCommandBuilder()
 .setName("visiontest")
 .setDescription("Take your Vision test")
].map(c=>c.toJSON());


const rest = new REST({version:"10"})
.setToken(TOKEN);


(async()=>{
 await rest.put(
 Routes.applicationGuildCommands(
  CLIENT_ID,
  "1519659693025525881"
 ),
 {body:commands}
);



client.on(Events.GuildMemberAdd, async member=>{

 let role =
 member.guild.roles.cache.find(
 r=>r.name==="Unawakened Traveler"
 );

 if(role){
  await member.roles.add(role);
 }

});



client.on(Events.InteractionCreate, async interaction=>{


if(interaction.isChatInputCommand()){

if(interaction.commandName==="visiontest"){


let row = new ActionRowBuilder()
.addComponents(

new ButtonBuilder()
.setCustomId("electro")
.setLabel("Ambition ⚡")
.setStyle(ButtonStyle.Primary),


new ButtonBuilder()
.setCustomId("pyro")
.setLabel("Passion 🔥")
.setStyle(ButtonStyle.Danger),


new ButtonBuilder()
.setCustomId("anemo")
.setLabel("Freedom 🌪")
.setStyle(ButtonStyle.Success)

);


await interaction.reply({
content:"✨ Choose your path ✨",
components:[row],
ephemeral:true
});

}

}



if(interaction.isButton()){


let result = {
 electro:"⚡ Electro Vision",
 pyro:"🔥 Pyro Vision",
 anemo:"🌪 Anemo Vision"
};


let role =
interaction.guild.roles.cache.find(
r=>r.name===result[interaction.customId]
);


let old =
interaction.guild.roles.cache.find(
r=>r.name==="Unawakened Traveler"
);


await interaction.member.roles.add(role);

if(old)
await interaction.member.roles.remove(old);



await interaction.reply(
`✨ A Vision has descended from Celestia! ✨

Congratulations ${interaction.user}
You received ${result[interaction.customId]}`
);


}

});



client.login(TOKEN);
