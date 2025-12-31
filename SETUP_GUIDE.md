# RAG Backend Setup Guide

## Current Status

✅ **Portfolio Website**: Fully functional and ready to use
✅ **Backend Code**: Complete and working
✅ **Dependencies**: All installed successfully
❌ **API Keys**: Need to be configured

## Next Steps to Activate RAG Agent

### 1. Get Your API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

#### Pinecone API Key
1. Go to https://www.pinecone.io/
2. Sign up for a free account
3. Create a new project
4. Go to "API Keys" in the dashboard
5. Copy your API key
6. Note your environment (e.g., `us-east-1`)

### 2. Update .env File

Open `rag-backend/.env` and replace the placeholder values:

```env
# Replace these with your actual keys
OPENAI_API_KEY=sk-your-actual-openai-key-here
PINECONE_API_KEY=your-actual-pinecone-key-here
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=ragini-portfolio
PORT=5000
DEBUG=False
```

### 3. Start the Backend

```bash
cd rag-backend
python app.py
```

You should see:
```
Initializing RAG engine...
✓ Connected to Pinecone index: ragini-portfolio
✓ Indexed X document chunks to Pinecone
RAG engine initialized successfully!
Starting Flask server...
 * Running on http://0.0.0.0:5000
```

### 4. Test the Chat

Open your browser to `index.html` and try asking questions in the chat:
- "What is Ragini's experience with AI?"
- "Tell me about her work at Supervity"
- "What projects has she worked on?"

## Current Functionality

### Without Backend (Current State)
The website works with **intelligent fallback responses** that answer common questions about:
- AI and ML experience
- Work at Supervity, Nokia, ChildFund
- Projects and achievements
- Skills and education

### With Backend (After API Keys)
The RAG agent will provide:
- **Context-aware responses** using GPT-4
- **Accurate information** from your resume data
- **Source citations** for transparency
- **Conversation memory** for follow-up questions

## Troubleshooting

### "Invalid API Key" Error
- Double-check your API keys have no extra spaces
- Make sure you copied the complete key
- Verify your OpenAI account has credits
- Check Pinecone account is active

### "Module Not Found" Error
- Run: `python setup.py` again
- Or manually: `pip install -r requirements.txt`

### Port Already in Use
- Change PORT in .env to 5001 or another number
- Or stop the process using port 5000

## Cost Estimates

### OpenAI (GPT-4)
- ~$0.01 per chat message
- Free tier: $5 credit for new accounts

### Pinecone
- Free tier: 1 index, 100K vectors
- Your resume: ~50-100 vectors
- **Completely free for this use case**

## Files Created

```
raginibhayana/
├── index.html              ✅ Portfolio website
├── styles.css              ✅ Design system
├── components.css          ✅ Component styles
├── script.js               ✅ Interactive features
├── data/
│   └── resume-data.json    ✅ Your resume data
├── rag-backend/
│   ├── app.py              ✅ Flask API
│   ├── rag_engine.py       ✅ RAG implementation
│   ├── setup.py            ✅ Dependency installer
│   ├── requirements.txt    ✅ Python packages
│   └── .env                ⚠️  Needs your API keys
└── README.md               ✅ Full documentation
```

## Quick Start Commands

```bash
# 1. Add your API keys to rag-backend/.env

# 2. Start backend
cd rag-backend
python app.py

# 3. In another terminal, serve frontend
cd ..
python -m http.server 8000

# 4. Open browser
# Visit: http://localhost:8000
```

---

**Your portfolio is ready to use!** The website works perfectly with fallback responses. Add your API keys whenever you're ready to activate the full RAG agent.
