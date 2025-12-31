// ============================================
// RAGINI BHAYANA - PORTFOLIO WEBSITE
// Interactive JavaScript
// ============================================

// ============================================
// NAVIGATION
// ============================================
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
navToggle?.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// Scroll behavior for navigation
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 100) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// Active link highlighting
const sections = document.querySelectorAll('.section');
const observerOptions = {
  threshold: 0.3,
  rootMargin: '-100px'
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, observerOptions);

sections.forEach(section => {
  sectionObserver.observe(section);
});

// ============================================
// TYPING ANIMATION
// ============================================
const typingText = document.getElementById('typingText');
const phrases = [
  'I build AI that ships.',
  'I strategize products that scale.',
  'I analyze markets that matter.'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeText() {
  const currentPhrase = phrases[phraseIndex];
  
  if (isDeleting) {
    typingText.textContent = currentPhrase.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 50;
  } else {
    typingText.textContent = currentPhrase.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 100;
  }
  
  if (!isDeleting && charIndex === currentPhrase.length) {
    // Pause at end of phrase
    typingSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typingSpeed = 500;
  }
  
  setTimeout(typeText, typingSpeed);
}

// Start typing animation
if (typingText) {
  setTimeout(typeText, 1000);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.card, .timeline-item, .achievement-card');
  
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
          entry.target.style.transition = 'all 0.6s ease-out';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);
        
        elementObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(element => {
    elementObserver.observe(element);
  });
};

// Initialize scroll animations
window.addEventListener('load', animateOnScroll);

// ============================================
// CHAT FUNCTIONALITY
// ============================================
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const suggestionButtons = document.querySelectorAll('.suggestion-btn');

// API Configuration
const API_URL = 'http://localhost:5000/api/chat'; // Update this when backend is deployed

// Add message to chat
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = isUser ? '<span>👤</span>' : '<span>🤖</span>';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  const messagePara = document.createElement('p');
  messagePara.textContent = content;
  
  messageContent.appendChild(messagePara);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot-message typing-indicator-message';
  typingDiv.id = 'typingIndicator';
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = '<span>🤖</span>';
  
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(indicator);
  
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

// Send message to RAG backend
async function sendMessage(message) {
  if (!message.trim()) return;
  
  // Add user message
  addMessage(message, true);
  chatInput.value = '';
  sendButton.disabled = true;
  
  // Show typing indicator
  showTypingIndicator();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add bot response
    addMessage(data.response);
    
  } catch (error) {
    console.error('Error:', error);
    removeTypingIndicator();
    
    // Fallback response when backend is not available
    const fallbackResponse = getFallbackResponse(message);
    addMessage(fallbackResponse);
  } finally {
    sendButton.disabled = false;
    chatInput.focus();
  }
}

// Fallback responses when backend is not available
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('ai') || lowerMessage.includes('machine learning') || lowerMessage.includes('ml')) {
    return "Ragini has extensive AI and ML experience! At Supervity.AI, she led delivery of 5 PoCs for major clients like Blinkit and Zepto, reducing man-hours by 80% through Agentic AI. She also built a Mango Disease Detection model achieving 98% accuracy with VGG16 architecture, outperforming 29 other models.";
  }
  
  if (lowerMessage.includes('supervity')) {
    return "At Supervity.AI (Feb 2025 - Jun 2025), Ragini worked as a Global Strategy and Community Catalyst. She led end-to-end delivery of 5 PoCs for Deloitte partner clients, drafted proposals for 7 state governments, and managed the AI Agents Academy enabling 100+ AI enthusiasts to upskill.";
  }
  
  if (lowerMessage.includes('nokia')) {
    return "Ragini worked at Nokia Solutions and Networks (Jun 2023 - Jul 2024) as an Associate in Cloud and Network Services. She reduced manual efforts by 90% through automation, enhanced security for 200+ team members, and achieved 100% accuracy on 100+ 4G and 5G network parameters. She was among the top 1% to secure a job offer in her 3rd year.";
  }
  
  if (lowerMessage.includes('project')) {
    return "Ragini has worked on diverse projects: 1) Mango Disease Detection (98% accuracy with VGG16), 2) Future Proofing LLM Companies ($18M ARR growth potential), 3) FirstCry International Marketing (GTM strategy with $30M capital plan), and 4) Alphabet Inc. Business Innovation (corporate finance analysis).";
  }
  
  if (lowerMessage.includes('skill') || lowerMessage.includes('tool')) {
    return "Ragini's skills span three domains: Business (Market Research, Agile, Product Roadmapping), Finance (DCF, LBO, M&A, Valuation), and Technical (Python, Java, SQL, Tableau, Power BI, Figma). She's proficient in both strategic thinking and hands-on implementation.";
  }
  
  if (lowerMessage.includes('education')) {
    return "Ragini is pursuing her MBA at BITS School of Management, Mumbai (Class of 2026). She completed her B.Tech in ECE from GGSIPU, Delhi with 9.2/10 CGPA, achieving Rank 2 in her batch and Rank 1 in 16 courses.";
  }
  
  if (lowerMessage.includes('achievement') || lowerMessage.includes('award')) {
    return "Ragini's achievements include: Campus Finalist at SBI Life IdeationX 2.0 (30,000+ participants), Rank 44/907 at Ace the Case 2024, 2nd position at BITSoM Data Hackathon, Top 0.2% in National Fintech Olympiad, and completion of McKinsey's Future-of-Work program.";
  }
  
  return "I'm Ragini's AI assistant! I can tell you about her experience in AI/ML, product strategy, finance, her work at companies like Supervity.AI and Nokia, her projects, skills, education, and achievements. What would you like to know?";
}

// Event listeners for chat
sendButton?.addEventListener('click', () => {
  const message = chatInput.value;
  sendMessage(message);
});

chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const message = chatInput.value;
    sendMessage(message);
  }
});

// Suggestion buttons
suggestionButtons.forEach(button => {
  button.addEventListener('click', () => {
    const question = button.getAttribute('data-question');
    chatInput.value = question;
    sendMessage(question);
  });
});

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
// Lazy load images (if any are added later)
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img.lazy').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================
// CONSOLE MESSAGE
// ============================================
console.log('%c👋 Hey there!', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cInterested in how this was built? Check out the code!', 'font-size: 14px; color: #b4b4c8;');
console.log('%cThis portfolio features a RAG-powered chatbot using OpenAI GPT-4 and Pinecone.', 'font-size: 12px; color: #7a7a8c;');
