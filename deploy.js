const { REST, Routes } = require("discord.js");
require("dotenv").config();
const commands = [
  {
    name: "ping",
    description: "Cek respon bot"
  },
  // {
  //   name: "models",
  //   description: "Lihat model Groq yang tersedia"
  // },
  // {
  //   name: "doc",
  //   description: "Generate dokumentasi menggunakan AI",
  //   options: [
  //     {
  //       name: "deskripsi",
  //       description: "Deskripsi untuk dijadikan dokumentasi",
  //       type: 3, // STRING
  //       required: true
  //     }
  //   ]
  // },
  // {
  //   name: "search",
  //   description: "Cari dokumentasi yang sudah dibuat",
  //   options: [
  //     {
  //       name: "query",
  //       description: "Kata kunci pencarian",
  //       type: 3, // STRING
  //       required: false
  //     },
  //     {
  //       name: "filter_by",
  //       description: "Filter berdasarkan kategori",
  //       type: 3, // STRING
  //       required: false,
  //       choices: [
  //         {
  //           name: "Semua Field",
  //           value: "all"
  //         },
  //         {
  //           name: "Judul",
  //           value: "title"
  //         },
  //         {
  //           name: "Konten",
  //           value: "content"
  //         },
  //         {
  //           name: "Tags",
  //           value: "tags"
  //         },
  //         {
  //           name: "User",
  //           value: "user"
  //         }
  //       ]
  //     },
  //     {
  //       name: "limit",
  //       description: "Jumlah maksimal hasil (max 50)",
  //       type: 4, // INTEGER
  //       required: false,
  //       min_value: 1,
  //       max_value: 50
  //     }
  //   ]
  // },
  {
    name: "catat",
    description: "Catat pengeluaran harian",
    options: [
      {
        name: "nominal",
        description: "Jumlah pengeluaran (Contoh: 50000)",
        type: 4, // INTEGER
        required: true
      },
      {
        name: "keterangan",
        description: "Untuk keperluan apa?",
        type: 3, // STRING
        required: false
      },
      {
        name: "tanggal",
        description: "Tanggal transaksi (YYYY-MM-DD), default: hari ini",
        type: 3, // STRING
        required: false
      }
    ]
  },
  {
    name: "edit",
    description: "Edit data transaksi yang sudah disimpan",
    options: [
      {
        name: "id",
        description: "ID Transaksi (Cek di riwayat)",
        type: 4, // INTEGER
        required: true
      },
      {
        name: "nominal",
        description: "Ubah nominal (Isi jika ingin mengubah)",
        type: 4, // INTEGER
        required: false
      },
      {
        name: "keterangan",
        description: "Ubah keterangan (Isi jika ingin mengubah)",
        type: 3, // STRING
        required: false
      },
      {
        name: "tanggal",
        description: "Ubah tanggal (YYYY-MM-DD) (Isi jika ingin mengubah)",
        type: 3, // STRING
        required: false
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
