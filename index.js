const http = require("http");

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is alive!");
}).listen(PORT, "0.0.0.0", () => {
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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});


// Slash command
const commands = [
  new SlashCommandBuilder()
    .setName("visiontest")
    .setDescription("Take your Vision test")
].map(c => c.toJSON());


const rest = new REST({ version: "10" })
  .setToken(TOKEN);


// Register command
(async () => {

  await rest.put(
    Routes.applicationGuildCommands(
      CLIENT_ID,
      GUILD_ID
    ),
    { body: commands }
  );

  console.log("Commands loaded");

})();


// Give new members Unawakened Traveler
client.on(Events.GuildMemberAdd, async member => {

  const role = member.guild.roles.cache.find(
    r => r.name === "Unawakened Traveler"
  );

  if (role) {
    await member.roles.add(role);
  }

});


// Interactions
client.on(Events.InteractionCreate, async interaction => {


  // Slash command
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === "visiontest") {


      const row = new ActionRowBuilder()
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
        content: "✨ Choose your path ✨",
        components: [row],
        ephemeral: true
      });

    }

  }



  // Button clicks
  if (interaction.isButton()) {


    const result = {

      electro: "⚡ Electro Vision",
      pyro: "🔥 Pyro Vision",
      anemo: "🌪 Anemo Vision"

    };


    const role = interaction.guild.roles.cache.find(
      r => r.name === result[interaction.customId]
    );


    const oldRole = interaction.guild.roles.cache.find(
      r => r.name === "Unawakened Traveler"
    );


    if (role) {
      await interaction.member.roles.add(role);
    }


    if (oldRole) {
      await interaction.member.roles.remove(oldRole);
    }


    await interaction.reply({

      content:
`✨ A Vision has descended from Celestia! ✨

Congratulations ${interaction.user}
You received ${result[interaction.customId]}`,

      ephemeral: false

    });

  }

});


// Login
client.login(TOKEN);
