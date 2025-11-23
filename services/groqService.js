const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'your_groq_api_key_here'
});

// Fungsi untuk mendapatkan list model yang tersedia
async function getAvailableModels() {
  try {
    const models = await groq.models.list();
    return models.data.filter(model => model.object === 'model');
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

// Fungsi untuk generate dokumentasi
async function generateDocumentation(description, model = 'llama-3.1-8b-instant') {
  try {
    const prompt = `Ubah deskripsi berikut menjadi dokumentasi yang mudah dipahami dan jelas. Gunakan format Markdown dengan struktur yang logis.

Deskripsi: "${description}"

Buat dokumentasi dengan struktur:
- **Overview** (Ringkasan singkat)
- **Details** (Penjelasan detail)
- **Usage** (Cara penggunaan jika relevan)
- **Notes** (Catatan tambahan jika perlu)

Gunakan bahasa yang sederhana namun profesional. Jangan terlalu panjang, fokus pada kejelasan.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Kamu adalah asisten AI yang ahli dalam membuat dokumentasi teknis yang mudah dipahami. Selalu gunakan format Markdown dan struktur yang jelas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0]?.message?.content || 'Maaf, tidak dapat menghasilkan dokumentasi.';
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
}

module.exports = {
  getAvailableModels,
  generateDocumentation
}