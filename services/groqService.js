const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'your_groq_api_key_here'
});

// Fungsi list model
async function getAvailableModels() {
  try {
    const models = await groq.models.list();
    return models.data.filter(model => model.object === 'model');
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

// Fungsi generate dokumentasi
async function generateDocumentation(description, model = 'llama-3.1-8b-instant') {
  try {
    const prompt = `
Buat dokumentasi teknis dalam format markdown dengan gaya catatan pribadi (wiki style).
Format HARUS menggunakan aturan berikut:

- Jangan gunakan format bold sebagai heading
- Jangan gunakan heading dengan tanda "=" atau "===="
- Jangan buat bagian metadata
- Jangan ulangi judul lebih dari sekali
- Heading format harus:
  # Judul
  ## Subjudul
  ## Catatan
- Gunakan bullet list jika relevan
- Gunakan paragraf singkat
- Jika memberikan contoh kode gunakan format:
  \`\`\`bash
  ...
  \`\`\`

Gunakan bahasa profesional, ringkas, dan to-the-point. Fokus pada informasi penting.

Tulis dokumentasi berdasarkan deskripsi berikut:

"${description}"
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Kamu adalah AI teknis yang membuat dokumentasi wiki-style, efisien, dan bersih."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: model,
      temperature: 0.5,
      max_tokens: 2000
    });

    return completion.choices[0]?.message?.content || 'Tidak dapat membuat dokumentasi.';
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
}

module.exports = {
  getAvailableModels,
  generateDocumentation
};
