require("dotenv").config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require("discord.js");
const { getAvailableModels, generateDocumentation } = require("./services/groqService");
const { createDocumentationPage } = require("./services/notionService");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// === Tambahkan ini untuk menangani slash command ===
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "models") {
    try {
      await interaction.deferReply();
      
      const models = await getAvailableModels();
      
      const embed = new EmbedBuilder()
        .setTitle("🤖 Groq Models Tersedia")
        .setColor(0x00FF00)
        .setDescription("Berikut adalah model Groq yang tersedia:")
        .setTimestamp();

      // Filter model yang relevan untuk dokumentasi
      const docModels = models.filter(model => 
        model.id.includes('llama') || 
        model.id.includes('mixtral') || 
        model.id.includes('gemma')
      );

      docModels.forEach((model, index) => {
        embed.addFields({
          name: `${index + 1}. ${model.id}`,
          value: `**Owner:** ${model.owned_by}\n**Created:** ${new Date(model.created).toLocaleDateString('id-ID')}`,
          inline: false
        });
      });

      embed.setFooter({ 
        text: "Pilih model yang sesuai untuk dokumentasi Anda",
        iconURL: client.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching models:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Error")
        .setColor(0xFF0000)
        .setDescription("Gagal mengambil list model. Pastikan GROQ_API_KEY sudah diatur dengan benar.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  if (interaction.commandName === "doc") {
    try {
      const deskripsi = interaction.options.getString("deskripsi");
      
      if (!deskripsi) {
        await interaction.reply("❌ Deskripsi tidak boleh kosong!");
        return;
      }

      await interaction.deferReply();

      // Generate dokumentasi menggunakan AI
      const documentation = await generateDocumentation(deskripsi);
      
      // Create page di Notion
      const notionResult = await createDocumentationPage(
        documentation, 
        deskripsi, 
        interaction.user.tag
      );
      
      if (notionResult.success) {
        // Kirim response dengan URL Notion
        const embed = new EmbedBuilder()
          .setTitle("📚 Documentation Created!")
          .setColor(0x00FF00)
          .setDescription("✅ Dokumentasi berhasil dibuat di Notion")
          .addFields({
            name: "🔗 View Documentation",
            value: `[**${notionResult.title}**](${notionResult.pageUrl})`
          })
          .addFields({
            name: "👤 Requested By",
            value: interaction.user.tag,
            inline: true
          })
          .addFields({
            name: "⏰ Created At",
            value: new Date().toLocaleString('id-ID'),
            inline: true
          })
          .addFields({
            name: "📋 Status",
            value: "Published",
            inline: true
          })
          .setTimestamp()
          .setFooter({ 
            text: "Powered by Groq AI & Notion",
            iconURL: client.user.displayAvatarURL()
          });

        await interaction.editReply({ embeds: [embed] });
      } else {
        // Handle error dari Notion
        const errorEmbed = new EmbedBuilder()
          .setTitle("❌ Error Creating Page")
          .setColor(0xFF0000)
          .setDescription(`Gagal membuat halaman Notion: ${notionResult.error}`)
          .addFields({
            name: "📝 Original Content",
            value: "```markdown\n" + documentation + "\n```"
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
      }
    } catch (error) {
      console.error('Error generating documentation:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Error")
        .setColor(0xFF0000)
        .setDescription("Gagal menghasilkan dokumentasi. Pastikan API keys sudah diatur dengan benar.")
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
});

client.login(process.env.TOKEN);
