const { REST, Routes } = require("discord.js");
require("dotenv").config();
const commands = [
  {
    name: "ping",
    description: "Cek respon bot"
  },
  {
    name: "models",
    description: "Lihat model Groq yang tersedia"
  },
  {
    name: "doc",
    description: "Generate dokumentasi menggunakan AI",
    options: [
      {
        name: "deskripsi",
        description: "Deskripsi untuk dijadikan dokumentasi",
        type: 3, // STRING
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    console.log("Slash command registered.");
  } catch (err) {
    console.error(err);
  }
})();
