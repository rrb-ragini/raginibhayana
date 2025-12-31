# Ragini Bhayana - Portfolio Website

A modern, premium portfolio website showcasing expertise in AI, Product Strategy, and Finance, featuring an intelligent RAG-powered chatbot.

## 🌟 Features

- **Modern Design**: Dark theme with vibrant gradient accents and smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **RAG Chatbot**: AI-powered assistant using OpenAI GPT-4 and Pinecone vector database
- **Interactive**: Smooth scrolling, typing animations, and micro-interactions
- **SEO Optimized**: Proper meta tags and semantic HTML

## 🚀 Quick Start

### Frontend

1. Open `index.html` in a modern web browser, or serve it using a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

2. Visit `http://localhost:8000` in your browser

### Backend (RAG Agent)

1. Navigate to the backend directory:

```bash
cd rag-backend
```

2. Create a virtual environment:

```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on Mac/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
# Copy the example file
copy .env.example .env

# Edit .env and add your API keys:
# - OPENAI_API_KEY
# - PINECONE_API_KEY
```

5. Run the backend server:

```bash
python app.py
```

The backend will start on `http://localhost:5000`

## 🔑 API Keys Required

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add to `.env` file

### Pinecone API Key
1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for a free account
3. Create a new project
4. Get your API key from the dashboard
5. Add to `.env` file
6. Note your environment (e.g., `us-east-1`)

## 📁 Project Structure

```
raginibhayana/
├── index.html              # Main HTML file
├── styles.css              # Core design system
├── components.css          # Component-specific styles
├── script.js               # Interactive JavaScript
├── data/
│   └── resume-data.json    # Structured resume data
├── rag-backend/
│   ├── app.py              # Flask API server
│   ├── rag_engine.py       # RAG implementation
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── README.md               # This file
```

## 🎨 Customization

### Colors
Edit CSS custom properties in `styles.css`:
- `--color-accent-purple`: Primary accent color
- `--color-accent-pink`: Secondary accent color
- `--gradient-primary`: Main gradient

### Content
Update `data/resume-data.json` with your information, then restart the backend to re-index.

### Chat Behavior
Modify the prompt template in `rag-backend/rag_engine.py` to change how the AI assistant responds.

## 🌐 Deployment

### Frontend Deployment
Deploy to any static hosting service:
- **Netlify**: Drag and drop the root folder
- **Vercel**: Connect your Git repository
- **GitHub Pages**: Push to a repository and enable Pages

### Backend Deployment
Deploy to a Python hosting service:
- **Railway**: Connect repository and add environment variables
- **Render**: Create a new Web Service
- **Heroku**: Use the Heroku CLI

Don't forget to update the `API_URL` in `script.js` to point to your deployed backend.

## 📊 Technologies Used

### Frontend
- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript
- Google Fonts (Inter, Outfit, Fira Code)

### Backend
- Python 3.9+
- Flask (Web framework)
- OpenAI GPT-4 (Language model)
- Pinecone (Vector database)
- LangChain (RAG framework)

## 🤝 Support

For questions or issues, please contact:
- Email: ragini.bhayana@example.com
- LinkedIn: [linkedin.com/in/raginibhayana](https://linkedin.com/in/raginibhayana)

## 📝 License

© 2025 Ragini Bhayana. All rights reserved.

---

**Built with ❤️ using modern web technologies and AI**
