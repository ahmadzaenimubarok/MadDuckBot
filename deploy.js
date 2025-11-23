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
  },
  {
    name: "search",
    description: "Cari dokumentasi yang sudah dibuat",
    options: [
      {
        name: "query",
        description: "Kata kunci pencarian",
        type: 3, // STRING
        required: false
      },
      {
        name: "filter_by",
        description: "Filter berdasarkan kategori",
        type: 3, // STRING
        required: false,
        choices: [
          {
            name: "Semua Field",
            value: "all"
          },
          {
            name: "Judul",
            value: "title"
          },
          {
            name: "Konten",
            value: "content"
          },
          {
            name: "Tags",
            value: "tags"
          },
          {
            name: "User",
            value: "user"
          }
        ]
      },
      {
        name: "limit",
        description: "Jumlah maksimal hasil (max 50)",
        type: 4, // INTEGER
        required: false,
        min_value: 1,
        max_value: 50
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
