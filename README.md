# Discord Bot with Groq AI Documentation Generator

Bot Discord yang dapat menghasilkan dokumentasi menggunakan AI dari provider Groq.

## 🚀 Fitur

- `/ping` - Cek respon bot
- `/models` - Lihat model Groq yang tersedia
- `/doc deskripsi:[text]` - Generate dokumentasi menggunakan AI dan simpan ke Notion
- `/search` - Cari dokumentasi yang sudah dibuat dengan berbagai filter

## 📋 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Edit file `.env` dan tambahkan:
```
TOKEN=YOUR_DISCORD_BOT_TOKEN
CLIENT_ID=YOUR_DISCORD_CLIENT_ID
GROQ_API_KEY=YOUR_GROQ_API_KEY
NOTION_API_KEY=YOUR_NOTION_API_KEY
NOTION_DATABASE_ID=YOUR_NOTION_DATABASE_ID
```

### 3. Deploy Commands
```bash
node deploy.js
```

### 4. Run Bot
```bash
node index.js
```

## 📖 Cara Penggunaan

### Mendapatkan API Keys

#### Groq API Key
1. Kunjungi [Groq Console](https://console.groq.com/)
2. Sign up atau login
3. Buat API key di dashboard
4. Copy dan paste ke file `.env`

#### Notion API Key
1. Kunjungi [Notion Integrations](https://www.notion.so/my-integrations)
2. Klik "Create new integration"
3. Beri nama integration dan permissions
4. Copy "Internal Integration Token" ke file `.env`
5. Database akan dibuat otomatis saat pertama kali menjalankan bot

### Menggunakan Command

#### `/models`
Menampilkan semua model Groq yang tersedia, difilter untuk kebutuhan dokumentasi.

#### `/doc deskripsi:[text]`
Generate dokumentasi dari deskripsi yang diberikan dan simpan ke Notion.

**Contoh:**
```
/doc deskripsi: membuat API endpoint untuk user authentication dengan JWT token
```

**Proses Kerja:**
1. AI menghasilkan dokumentasi terstruktur dari deskripsi
2. Bot otomatis membuat page baru di Notion database
3. Bot mengirimkan URL page yang bisa diakses
4. Dokumentasi tersimpan permanen dengan format yang rapi

**Fitur Notion Integration:**
- ✅ Auto-generated title dari content
- ✅ Smart tagging berdasarkan konten (API, Feature, Tutorial, dll)
- ✅ Metadata tracking (requested by, created date, status)
- ✅ Rich text formatting dengan markdown
- ✅ URL yang mudah dishare dan diakses

#### `/search`
Cari dokumentasi yang sudah dibuat dengan berbagai filter options.

**Syntax:**
```
/search [query:"kata kunci"] [filter_by:category] [limit:number]
```

**Options:**
- `query` (optional) - Kata kunci pencarian
- `filter_by` (optional) - Filter kategori:
  - `all` - Cari di semua field (default)
  - `title` - Cari hanya di judul
  - `content` - Cari di konten dokumentasi
  - `tags` - Cari berdasarkan tags
  - `user` - Cari berdasarkan user yang request
- `limit` (optional) - Jumlah maksimal hasil (1-50, default 10)

**Contoh Penggunaan:**
```
# Cari semua dokumentasi tentang API
/search query:API filter_by:tags

# Cari dokumentasi dengan kata "login" di judul
/search query:login filter_by:title limit:5

# Lihat semua dokumentasi yang dibuat oleh user tertentu
/search query:username filter_by:user

# Dapatkan 10 dokumentasi terbaru
/search limit:10

# Cari di semua field
/search query:authentication
```

**Fitur Search:**
- 🔍 **Multi-field Search** - Cari di judul, konten, tags, dan user
- 🏷️ **Smart Filtering** - Filter spesifik berdasarkan kategori
- 📊 **Sortable Results** - Hasil diurutkan berdasarkan tanggal terbaru
- 🔗 **Clickable Links** - Direct link ke Notion page
- 📄 **Rich Metadata** - Tampilkan tags, user, dan tanggal
- ⚡ **Fast Response** - Optimized query dengan pagination

**Response Format:**
- Menampilkan jumlah total hasil ditemukan
- Setiap hasil menampilkan:
  - 📄 Judul documentation
  - 🏷️ Tags yang terkait
  - 👤 User yang request
  - 📅 Tanggal pembuatan
  - 🔗 Direct link ke Notion page

## 🛠️ Tech Stack

- **Discord.js** - Discord API wrapper
- **Groq SDK** - AI provider
- **Notion SDK** - Document storage and management
- **Node.js** - Runtime environment

## 📁 Struktur Proyek

```
my-discord-bot/
├── index.js              # Main bot file
├── deploy.js             # Command deployment
├── services/
│   ├── groqService.js    # Groq AI integration
│   └── notionService.js   # Notion integration
├── .env                  # Environment variables
├── package.json          # Dependencies
└── README.md            # Documentation
```

## 🤖 Model AI yang Digunakan

Default model: `llama3-8b-8192`

Model yang tersedia untuk dokumentasi:
- llama3-8b-8192
- llama3-70b-8192  
- mixtral-8x7b-32768
- gemma2-9b-it

## 🔧 Troubleshooting

### Error: "Gagal mengambil list model"
Pastikan `GROQ_API_KEY` sudah diatur dengan benar di file `.env`.

### Error: "Gagal menghasilkan dokumentasi"
- Cek koneksi internet
- Pastikan API key valid
- Coba lagi setelah beberapa saat (rate limit)

### Error: "CombinedPropertyError - Invalid string length"
Ini terjadi ketika hasil dokumentasi terlalu panjang untuk Discord embed field (max 1024 karakter). **Sudah fixed dengan automatic chunking:**
- Dokumentasi pendek: Ditampilkan langsung di embed description
- Dokumentasi sedang: Dipecah menjadi multiple fields dalam satu embed
- Dokumentasi sangat panjang: Dipecah menjadi multiple embed messages

### Commands tidak muncul di Discord
- Jalankan `node deploy.js` untuk register ulang commands
- Pastikan bot memiliki izin yang cukup di server

### Bot tidak merespon command
- Pastikan bot sudah di-restart setelah perubahan kode
- Cek console untuk error messages
- Verifikasi GROQ_API_KEY valid di .env file

## 📝 Contoh Hasil Documentation

Input:
```
/doc deskripsi: sistem login user dengan email dan password
```

Output:
```markdown
# Overview
Sistem autentikasi user yang memungkinkan login menggunakan email dan password.

# Details
- User memasukkan email dan password
- Sistem melakukan validasi kredensial
- Jika valid, user diberikan access token
- Session disimpan untuk keperluan autentikasi selanjutnya

# Usage
1. Buka halaman login
2. Masukkan email terdaftar
3. Masukkan password
4. Klik tombol Login
5. Sistem akan redirect ke dashboard jika berhasil

# Notes
- Password harus minimal 8 karakter
- Email harus dalam format yang valid
- Maksimal 3 kali percobaan login gagal
```

## 🤝 Kontribusi

Feel free to submit issues dan pull requests!

## 📄 License
