const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: process.env.NOTION_API_KEY || "your_groq_api_key_here",
});

/* =========================================================
 * Helper: Inline Markdown Parser (Bold Only)
 * ========================================================= */

function parseInlineMarkdown(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  const rich = [];

  for (const part of parts) {
    if (/^\*\*(.*)\*\*$/.test(part)) {
      const inner = part.replace(/^\*\*|\*\*$/g, "");
      rich.push({
        type: "text",
        text: { content: inner },
        annotations: { bold: true },
      });
    } else {
      rich.push({
        type: "text",
        text: { content: part },
      });
    }
  }

  return rich;
}

/* =========================================================
 * Normalisasi Markdown → Wiki Style
 * ========================================================= */

function normalizeMarkdown(rawContent, requestedBy) {
  if (!rawContent) return "# Untitled";

  let content = rawContent
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/```$/, "")
    .trim();

  let lines = content.split("\n");

  // Ambil judul dari heading pertama
  let title = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#\s+(.*)/);
    if (m) {
      title = m[1].trim();
      lines.splice(0, i + 1);
      break;
    }
  }

  if (!title) title = "Documentation";

  // Normalisasi heading (### → ##)
  lines = lines.map(line => {
    if (/^###/.test(line)) return line.replace(/^###\s*/, "## ");
    if (/^####/.test(line)) return line.replace(/^####\s*/, "## ");
    return line;
  });

  // Hapus heading yang sama atau duplikat
  lines = lines.filter(line => !/Dokumentasi/i.test(line));

  // Section metadata
  const result = [
    `# ${title}`,
    "",
    "## Metadata",
    `- Source: Discord`,
    requestedBy ? `- Requested By: ${requestedBy}` : "",
    "",
    ...lines
  ];

  return result.join("\n");
}

/* =========================================================
 * Convert Markdown → Notion Block Objects
 * ========================================================= */

function convertMarkdownToNotionBlocks(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];

  let insideCodeBlock = false;
  let codeLang = "plain text";
  let codeBuffer = [];

  for (let rawLine of lines) {
    const line = rawLine.replace(/\r$/, "");

    // Codeblock
    if (line.trim().startsWith("```")) {
      if (!insideCodeBlock) {
        insideCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
        continue;
      } else {
        blocks.push({
          object: "block",
          type: "code",
          code: {
            language: codeLang || "plain text",
            rich_text: parseInlineMarkdown(codeBuffer.join("\n")),
          },
        });
        insideCodeBlock = false;
        continue;
      }
    }

    if (insideCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (!line.trim()) continue;

    // Heading 1
    if (line.startsWith("# ")) {
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: {
          rich_text: parseInlineMarkdown(line.replace(/^#\s*/, "")),
        },
      });
      continue;
    }

    // Heading 2
    if (line.startsWith("## ")) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: parseInlineMarkdown(line.replace(/^##\s*/, "")),
        },
      });
      continue;
    }

    // Bulleted list
    if (/^[-*]\s+/.test(line)) {
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: parseInlineMarkdown(line.replace(/^[-*]\s+/, "")),
        },
      });
      continue;
    }

    // Paragraph
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: parseInlineMarkdown(line),
      },
    });
  }

  return blocks;
}

/* =========================================================
 * Title & Tag Extractors
 * ========================================================= */

function generateTitle(content) {
  const first = content.split("\n").find(line => line.startsWith("# "));
  if (!first) return "Documentation";
  const title = first.replace(/^#\s*/, "").trim();
  return title.length > 50 ? title.slice(0, 47) + "..." : title;
}

function generateTags(content) {
  const text = content.toLowerCase();
  const tags = ["Documentation"];
  if (text.includes("api")) tags.push("API");
  if (text.includes("tutorial")) tags.push("Tutorial");
  if (tags.length === 1) tags.push("Other");
  return tags;
}

/* =========================================================
 * Main Function: Create Page
 * ========================================================= */

async function createDocumentationPage(content, originalDescription, requestedBy) {
  try {
    const normalizedMarkdown = normalizeMarkdown(content, requestedBy);
    const title = generateTitle(normalizedMarkdown);
    const tags = generateTags(normalizedMarkdown);

    const contentBlocks = convertMarkdownToNotionBlocks(normalizedMarkdown);

    const res = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID
      },
      properties: {
        Title: {
          title: [{ text: { content: title } }]
        },
        "Created Date": {
          date: { start: new Date().toISOString() }
        },
        "Requested By": {
          rich_text: [{ text: { content: requestedBy } }]
        },
        Status: {
          select: { name: "Published" }
        },
        Tags: {
          multi_select: tags.map(tag => ({ name: tag }))
        }
      },
      children: contentBlocks
    });

    return {
      success: true,
      pageUrl: res.url,
      title,
    };
  } catch (err) {
    console.error("Error creating Notion page:", err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  createDocumentationPage
};
