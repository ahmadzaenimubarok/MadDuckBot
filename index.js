require("dotenv").config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require("discord.js");
const { getAvailableModels, generateDocumentation } = require("./services/groqService");
const { createDocumentationPage, searchDocumentation } = require("./services/notionService");
const { saveTransaction, updateTransaction } = require("./services/supabaseService");

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

  if (interaction.commandName === "catat") {
    const nominal = interaction.options.getInteger("nominal");
    const keterangan = interaction.options.getString("keterangan") || "Tanpa keterangan";

    const username = interaction.user.username;
    const tanggal = interaction.options.getString("tanggal");

    await interaction.deferReply();

    const result = await saveTransaction(nominal, keterangan, username, tanggal);

    if (result.success) {
      const transactionDate = new Date(result.data.date);
      
      const embed = new EmbedBuilder()
        .setTitle("✅ Transaksi Berhasil Disimpan")
        .setColor(0x00FF00)
        .addFields(
          { name: "🆔 ID", value: `${result.data.id}`, inline: true },
          { name: "💰 Nominal", value: `Rp ${nominal.toLocaleString('id-ID')}`, inline: true },
          { name: "📝 Keterangan", value: keterangan, inline: true },
          { name: "👤 User", value: username, inline: true },
          { name: "📅 Tanggal", value: transactionDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Gagal Menyimpan Transaksi")
        .setColor(0xFF0000)
        .setDescription(`Terjadi kesalahan saat menyimpan data: ${result.error}`)
        .setFooter({ text: "Pastikan konfigurasi Supabase sudah benar" });

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  if (interaction.commandName === "edit") {
    const id = interaction.options.getInteger("id");
    const nominal = interaction.options.getInteger("nominal");
    const keterangan = interaction.options.getString("keterangan");
    const tanggal = interaction.options.getString("tanggal");

    if (nominal === null && keterangan === null && tanggal === null) {
      await interaction.reply({ content: "⚠️ Tidak ada data yang diubah. Tolong isi salah satu dari nominal, keterangan, atau tanggal.", ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const updates = {};
    if (nominal !== null) updates.nominal = nominal;
    if (keterangan !== null) updates.keterangan = keterangan;
    if (tanggal !== null) updates.tanggal = tanggal;

    const result = await updateTransaction(id, updates);

    if (result.success) {
      const newData = result.data;
      const transactionDate = new Date(newData.date);

      const embed = new EmbedBuilder()
        .setTitle("✅ Transaksi Berhasil Diupdate")
        .setColor(0x00FF00)
        .addFields(
          { name: "🆔 ID", value: `${newData.id}`, inline: true },
          { name: "💰 Nominal", value: `Rp ${newData.amount.toLocaleString('id-ID')}`, inline: true },
          { name: "📝 Keterangan", value: newData.description || "-", inline: true },
          { name: "👤 User", value: newData.username || "-", inline: true },
          { name: "📅 Tanggal", value: transactionDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } else {
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Gagal Update Transaksi")
        .setColor(0xFF0000)
        .setDescription(`Gagal mengubah data ID ${id}: ${result.error}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  // if (interaction.commandName === "models") {
  //   try {
  //     await interaction.deferReply();
      
  //     const models = await getAvailableModels();
      
  //     const embed = new EmbedBuilder()
  //       .setTitle("🤖 Groq Models Tersedia")
  //       .setColor(0x00FF00)
  //       .setDescription("Berikut adalah model Groq yang tersedia:")
  //       .setTimestamp();

  //     // Filter model yang relevan untuk dokumentasi
  //     const docModels = models.filter(model => 
  //       model.id.includes('llama') || 
  //       model.id.includes('mixtral') || 
  //       model.id.includes('gemma')
  //     );

  //     docModels.forEach((model, index) => {
  //       embed.addFields({
  //         name: `${index + 1}. ${model.id}`,
  //         value: `**Owner:** ${model.owned_by}\n**Created:** ${new Date(model.created).toLocaleDateString('id-ID')}`,
  //         inline: false
  //       });
  //     });

  //     embed.setFooter({ 
  //       text: "Pilih model yang sesuai untuk dokumentasi Anda",
  //       iconURL: client.user.displayAvatarURL()
  //     });

  //     await interaction.editReply({ embeds: [embed] });
  //   } catch (error) {
  //     console.error('Error fetching models:', error);
      
  //     const errorEmbed = new EmbedBuilder()
  //       .setTitle("❌ Error")
  //       .setColor(0xFF0000)
  //       .setDescription("Gagal mengambil list model. Pastikan GROQ_API_KEY sudah diatur dengan benar.")
  //       .setTimestamp();

  //     await interaction.editReply({ embeds: [errorEmbed] });
  //   }
  // }

  // if (interaction.commandName === "search") {
  //   try {
  //     const query = interaction.options.getString("query") || '';
  //     const filterBy = interaction.options.getString("filter_by") || 'all';
  //     const limit = interaction.options.getInteger("limit") || 10;

  //     await interaction.deferReply();

  //     // Search documentation
  //     const searchResult = await searchDocumentation(query, filterBy, limit);
      
  //     if (searchResult.success) {
  //       if (searchResult.results.length === 0) {
  //         const noResultsEmbed = new EmbedBuilder()
  //           .setTitle("🔍 Search Results")
  //           .setColor(0xFF9900)
  //           .setDescription(`❌ Tidak ada dokumentasi ditemukan untuk query: "${query}"`)
  //           .addFields({
  //             name: "💡 Tips",
  //             value: "Coba dengan keyword yang lebih umum atau gunakan filter yang berbeda."
  //           })
  //           .setTimestamp();

  //         await interaction.editReply({ embeds: [noResultsEmbed] });
  //       } else {
  //         // Create embed dengan multiple results
  //         const searchEmbed = new EmbedBuilder()
  //           .setTitle(`🔍 Search Results (${searchResult.total} found)`)
  //           .setColor(0x0099FF)
  //           .setDescription(`📋 Filter: ${filterBy.toUpperCase()} | 🔍 Query: "${query || 'All'}"`)
  //           .setTimestamp();

  //         // Add each result as field
  //         searchResult.results.forEach((result, index) => {
  //           const fieldValue = `🏷️ **Tags:** ${result.tags}\n👤 **Requested By:** ${result.requestedBy}\n📅 **Created:** ${result.createdDate}\n🔗 [View Documentation](${result.url})`;
            
  //           searchEmbed.addFields({
  //             name: `${index + 1}. 📄 ${result.title}`,
  //             value: fieldValue,
  //             inline: false
  //           });
  //         });

  //         searchEmbed.setFooter({ 
  //           text: "Click the links to view full documentation",
  //           iconURL: client.user.displayAvatarURL()
  //         });

  //         await interaction.editReply({ embeds: [searchEmbed] });
  //       }
  //     } else {
  //       // Handle search error
  //       const errorEmbed = new EmbedBuilder()
  //         .setTitle("❌ Search Error")
  //         .setColor(0xFF0000)
  //         .setDescription(`Gagal mencari dokumentasi: ${searchResult.error}`)
  //         .addFields({
  //           name: "🔧 Troubleshooting",
  //           value: "• Pastikan NOTION_API_KEY valid\n• Coba lagi dengan query yang berbeda\n• Contact admin jika masalah berlanjut"
  //         })
  //         .setTimestamp();

  //       try {
  //         await interaction.editReply({ embeds: [errorEmbed] });
  //       } catch (editError) {
  //         console.error('Error editing reply:', editError);
  //         try {
  //           await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  //         } catch (replyError) {
  //           console.error('Error replying:', replyError);
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error in search command:', error);
      
  //     const errorEmbed = new EmbedBuilder()
  //       .setTitle("❌ Search Error")
  //       .setColor(0xFF0000)
  //       .setDescription("Terjadi kesalahan saat mencari dokumentasi. Coba lagi nanti.")
  //       .setTimestamp();

  //     try {
  //       await interaction.editReply({ embeds: [errorEmbed] });
  //     } catch (editError) {
  //       console.error('Error editing reply:', editError);
  //       try {
  //         await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  //       } catch (replyError) {
  //         console.error('Error replying:', replyError);
  //       }
  //     }
  //   }
  // }

  // if (interaction.commandName === "doc") {
  //   try {
  //     const deskripsi = interaction.options.getString("deskripsi");
      
  //     if (!deskripsi) {
  //       await interaction.reply("❌ Deskripsi tidak boleh kosong!");
  //       return;
  //     }

  //     await interaction.deferReply();

  //     // Generate dokumentasi menggunakan AI
  //     const documentation = await generateDocumentation(deskripsi);
      
  //     // Create page di Notion
  //     const notionResult = await createDocumentationPage(
  //       documentation, 
  //       deskripsi, 
  //       interaction.user.tag
  //     );
      
  //     if (notionResult.success) {
  //       // Kirim response dengan URL Notion
  //       const embed = new EmbedBuilder()
  //         .setTitle("📚 Documentation Created!")
  //         .setColor(0x00FF00)
  //         .setDescription("✅ Dokumentasi berhasil dibuat di Notion")
  //         .addFields({
  //           name: "🔗 View Documentation",
  //           value: `[**${notionResult.title}**](${notionResult.pageUrl})`
  //         })
  //         .addFields({
  //           name: "👤 Requested By",
  //           value: interaction.user.tag,
  //           inline: true
  //         })
  //         .addFields({
  //           name: "⏰ Created At",
  //           value: new Date().toLocaleString('id-ID'),
  //           inline: true
  //         })
  //         .addFields({
  //           name: "📋 Status",
  //           value: "Published",
  //           inline: true
  //         })
  //         .setTimestamp()
  //         .setFooter({ 
  //           text: "Powered by Groq AI & Notion",
  //           iconURL: client.user.displayAvatarURL()
  //         });

  //       await interaction.editReply({ embeds: [embed] });
  //     } else {
  //       // Handle error dari Notion
  //       const errorEmbed = new EmbedBuilder()
  //         .setTitle("❌ Error Creating Page")
  //         .setColor(0xFF0000)
  //         .setDescription(`Gagal membuat halaman Notion: ${notionResult.error}`)
  //         .addFields({
  //           name: "📝 Original Content",
  //           value: "```markdown\n" + documentation + "\n```"
  //         })
  //         .setTimestamp();

  //       await interaction.editReply({ embeds: [errorEmbed] });
  //     }
  //   } catch (error) {
  //     console.error('Error generating documentation:', error);
      
  //     const errorEmbed = new EmbedBuilder()
  //       .setTitle("❌ Error")
  //       .setColor(0xFF0000)
  //       .setDescription("Gagal menghasilkan dokumentasi. Pastikan API keys sudah diatur dengan benar.")
  //       .setTimestamp();

  //     await interaction.editReply({ embeds: [errorEmbed] });
  //   }
  // }
});

client.login(process.env.TOKEN);
