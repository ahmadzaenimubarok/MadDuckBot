
# Discord Bot with Groq AI Documentation Generator

A Discord bot capable of generating documentation using AI powered by Groq.

## 🚀 Features

- `/ping` - Check bot response
- `/models` - View available Groq models
- `/doc description:[text]` - Generate documentation using AI and save it to Notion
- `/search` - Search previously created documentation with various filters

## 📋 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Edit the `.env` file and add:
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

## 📖 Usage Guide

### Obtaining API Keys

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Create an API key from the dashboard
4. Copy and paste it into your `.env` file

#### Notion API Key
1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "Create new integration"
3. Enter a name and set permissions
4. Copy the "Internal Integration Token" into your `.env`
5. The database will be created automatically the first time the bot runs

### Using Commands

#### `/models`
Displays available Groq models filtered for documentation purposes.

#### `/doc description:[text]`
Generate documentation from a given description and store it in Notion.

**Example:**
```
/doc description: create API endpoint for user authentication using JWT token
```

**Workflow:**
1. AI generates structured documentation from the description
2. The bot automatically creates a page in the Notion database
3. The bot sends back the Notion page URL
4. Documentation is stored permanently in a clean format

**Notion Integration Features:**
- ✅ Auto-generated title from content
- ✅ Smart tagging based on content (API, Feature, Tutorial, etc.)
- ✅ Metadata tracking (requested by, created date, status)
- ✅ Rich text formatting using markdown
- ✅ Shareable and accessible URLs

#### `/search`
Search previously created documentation with filtering options.

**Syntax:**
```
/search [query:"keyword"] [filter_by:category] [limit:number]
```

**Options:**
- `query` (optional) - Search keyword
- `filter_by` (optional) - Filter category:
  - `all` - Search across all fields (default)
  - `title` - Search only in titles
  - `content` - Search documentation content
  - `tags` - Filter by tags
  - `user` - Filter by requestor
- `limit` (optional) - Maximum number of results (1–50, default 10)

**Example Usage:**
```
# Search all documentation related to API
/search query:API filter_by:tags

# Search documentation containing "login" in the title
/search query:login filter_by:title limit:5

# See documentation created by a specific user
/search query:username filter_by:user

# Fetch latest 10 documentation entries
/search limit:10

# Search across all fields
/search query:authentication
```

**Search Features:**
- 🔍 **Multi-field Search** - Search title, content, tags, and user
- 🏷️ **Smart Filtering** - Specific, categorized filtering
- 📊 **Sortable Results** - Results sorted by latest created
- 🔗 **Clickable Links** - Direct links to Notion pages
- 📄 **Rich Metadata** - Tags, user, and timestamps
- ⚡ **Fast Response** - Optimized paginated queries

**Response Format:**
Each result includes:
- 📄 Documentation Title
- 🏷️ Related Tags
- 👤 Requested By
- 📅 Created At
- 🔗 Direct link to Notion page

## 🛠️ Tech Stack

- **Discord.js** - Discord API wrapper
- **Groq SDK** - AI provider
- **Notion SDK** - Documentation storage & management
- **Node.js** - Runtime environment

## 📁 Project Structure

```
my-discord-bot/
├── index.js              # Main bot file
├── deploy.js             # Command deployment
├── services/
│   ├── groqService.js    # Groq AI integration
│   └── notionService.js  # Notion integration
├── .env                  # Environment variables
├── package.json          # Dependencies
└── README.md             # Documentation
```

## 🤖 AI Models Used

Default model: `llama3-8b-8192`

Other models suitable for documentation:
- llama3-8b-8192
- llama3-70b-8192
- mixtral-8x7b-32768
- gemma2-9b-it

## 🔧 Troubleshooting

### Error: "Failed to retrieve model list"
Ensure `GROQ_API_KEY` is configured correctly in `.env`

### Error: "Failed generating documentation"
- Check internet connection
- Ensure API key is valid
- Try again later (rate limit)

### Error: "CombinedPropertyError - Invalid string length"
Occurs when documentation exceeds Discord embed character limits (1024 chars).
Fixes implemented:
- Short docs displayed in embed
- Medium docs split across multiple fields
- Long docs split across multiple messages

### Commands not appearing in Discord
- Run `node deploy.js` to re-register commands
- Ensure bot has proper permissions

### Bot not responding
- Restart bot after code change
- Check console for errors
- Verify API keys in `.env`

## 📝 Sample Output

Input:
```
/doc description: user login system with email and password
```

Output:
```markdown
# Overview
A user authentication system that allows login using email and password.

# Details
- User enters email and password
- System validates credentials
- On success, access token is issued
- Session stored for subsequent authentication

# Usage
1. Open login page
2. Enter registered email
3. Enter password
4. Click Login
5. System redirects to dashboard upon success

# Notes
- Password must be at least 8 characters
- Email must be valid format
- Max 3 failed login attempts allowed
```

## 🤝 Contributing

Feel free to submit issues or pull requests!

## 📄 License
