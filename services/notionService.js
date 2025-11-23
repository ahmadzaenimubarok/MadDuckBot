const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY || 'your_notion_api_key_here'
});

// Fungsi untuk generate title dari content AI
function generateTitle(content, originalDescription) {
  // Extract judul dari content atau gunakan original description
  const lines = content.split('\n');
  const titleLine = lines.find(line => line.startsWith('# ')) || originalDescription;
  
  // Bersihkan title dan batasi panjang
  let title = titleLine.replace(/^#+\s*/, '').trim();
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  return title || 'Documentation';
}

// Fungsi untuk smart tagging berdasarkan konten
function generateTags(content, originalDescription) {
  const contentLower = content.toLowerCase();
  const descLower = originalDescription.toLowerCase();
  
  const tags = ['Documentation']; // Default tag
  
  // Keywords untuk tagging otomatis
  if (contentLower.includes('api') || descLower.includes('api')) {
    tags.push('API');
  }
  if (contentLower.includes('tutorial') || descLower.includes('tutorial') || 
      contentLower.includes('cara') || descLower.includes('cara')) {
    tags.push('Tutorial');
  }
  if (contentLower.includes('feature') || descLower.includes('feature') ||
      contentLower.includes('fitur') || descLower.includes('fitur')) {
    tags.push('Feature');
  }
  
  // Jika tidak ada tag spesifik, gunakan Other
  if (tags.length === 1) {
    tags.push('Other');
  }
  
  return tags;
}

// Fungsi untuk membuat page baru di Notion
async function createDocumentationPage(content, originalDescription, requestedBy) {
  try {
    const title = generateTitle(content, originalDescription);
    const tags = generateTags(content, originalDescription);
    const createdDate = new Date().toISOString();
    
    // Convert markdown content ke Notion rich text blocks
    const contentBlocks = convertMarkdownToNotionBlocks(content);
    
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID
      },
      properties: {
        'Title': {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        },
        'Original Description': {
          rich_text: [
            {
              text: {
                content: originalDescription
              }
            }
          ]
        },
        'Requested By': {
          rich_text: [
            {
              text: {
                content: requestedBy
              }
            }
          ]
        },
        'Created Date': {
          date: {
            start: createdDate
          }
        },
        'Status': {
          select: {
            name: 'Published'
          }
        },
        'Tags': {
          multi_select: tags.map(tag => ({ name: tag }))
        }
      },
      children: contentBlocks
    });
    
    return {
      success: true,
      pageId: response.id,
      pageUrl: response.url,
      title: title
    };
  } catch (error) {
    console.error('Error creating Notion page:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fungsi helper untuk convert markdown ke Notion blocks
function convertMarkdownToNotionBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  
  for (const line of lines) {
    if (line.trim() === '') {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: { content: '' }
          }]
        }
      });
    } else if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: [{
            text: { content: line.replace(/^#\s*/, '') }
          }]
        }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{
            text: { content: line.replace(/^##\s*/, '') }
          }]
        }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{
            text: { content: line.replace(/^###\s*/, '') }
          }]
        }
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{
            text: { content: line.replace(/^[-*]\s*/, '') }
          }]
        }
      });
    } else if (/^\d+\.\s/.test(line)) {
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [{
            text: { content: line.replace(/^\d+\.\s*/, '') }
          }]
        }
      });
    } else {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            text: { content: line }
          }]
        }
      });
    }
  }
  
  return blocks;
}

module.exports = {
  createDocumentationPage
};
