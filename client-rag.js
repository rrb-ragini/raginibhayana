// ============================================
// CLIENT-SIDE RAG ENGINE
// Works without backend server - loads resume data directly
// ============================================

class ClientRAG {
  constructor() {
    this.resumeData = null;
    this.indexedData = [];
  }

  async initialize() {
    try {
      // Load resume data
      const response = await fetch('data/resume-data.json');
      this.resumeData = await response.json();
      this._indexData();
      return true;
    } catch (error) {
      console.error('Error loading resume data:', error);
      return false;
    }
  }

  _indexData() {
    // Index all data for search
    this.indexedData = [];

    // Personal info
    if (this.resumeData.personalInfo) {
      const info = this.resumeData.personalInfo;
      this.indexedData.push({
        type: 'personal',
        text: `${info.name} is a ${info.title}. ${info.tagline}`,
        keywords: ['ragini', 'personal', 'about', 'introduction', 'who'],
        data: info
      });
    }

    // Education
    this.resumeData.education?.forEach(edu => {
      const text = `${edu.degree} from ${edu.institute} (${edu.year}, Grade: ${edu.grade})`;
      const highlights = edu.highlights?.join(', ') || '';
      this.indexedData.push({
        type: 'education',
        text: `${text}. ${highlights}`,
        keywords: ['education', 'degree', 'university', 'college', 'mba', 'btech', 'school', edu.institute.toLowerCase(), edu.degree.toLowerCase()],
        data: edu
      });
    });

    // Experience
    this.resumeData.experience?.forEach(exp => {
      const achievements = exp.achievements?.join('. ') || '';
      const text = `At ${exp.company}, worked as ${exp.role} (${exp.duration}). ${achievements}`;
      this.indexedData.push({
        type: 'experience',
        text: text,
        keywords: ['experience', 'work', 'job', 'company', 'career', exp.company.toLowerCase(), exp.role.toLowerCase(), ...(exp.tags || [])],
        data: exp
      });
    });

    // Projects
    this.resumeData.projects?.forEach(proj => {
      const achievements = proj.achievements?.join('. ') || '';
      const text = `Project: ${proj.title} (${proj.duration}). ${proj.description}. ${achievements}`;
      this.indexedData.push({
        type: 'project',
        text: text,
        keywords: ['project', 'work', 'portfolio', proj.title.toLowerCase(), ...(proj.tags || [])],
        data: proj
      });
    });

    // Achievements
    this.resumeData.achievements?.forEach(ach => {
      const text = `${ach.category}: ${ach.title} - ${ach.description} (${ach.year})`;
      this.indexedData.push({
        type: 'achievement',
        text: text,
        keywords: ['achievement', 'award', 'recognition', 'competition', ach.category.toLowerCase(), ach.title.toLowerCase()],
        data: ach
      });
    });

    // Skills
    Object.keys(this.resumeData.skills || {}).forEach(category => {
      const skills = this.resumeData.skills[category].join(', ');
      const text = `${category} skills include: ${skills}`;
      this.indexedData.push({
        type: 'skills',
        text: text,
        keywords: ['skill', 'tool', 'technology', 'expertise', category.toLowerCase(), ...this.resumeData.skills[category].map(s => s.toLowerCase())],
        data: { category, skills: this.resumeData.skills[category] }
      });
    });

    // Leadership
    this.resumeData.leadership?.forEach(lead => {
      const achievements = lead.achievements?.join('. ') || '';
      const text = `${lead.role} at ${lead.organization} (${lead.duration}). ${achievements}`;
      this.indexedData.push({
        type: 'leadership',
        text: text,
        keywords: ['leadership', 'role', 'organization', lead.role.toLowerCase(), lead.organization.toLowerCase()],
        data: lead
      });
    });
  }

  _calculateRelevance(query, item) {
    const lowerQuery = query.toLowerCase();
    const lowerText = item.text.toLowerCase();
    
    let score = 0;

    // Exact keyword matches
    item.keywords.forEach(keyword => {
      if (lowerQuery.includes(keyword)) {
        score += 10;
      }
      if (keyword.includes(lowerQuery) || lowerQuery.includes(keyword)) {
        score += 5;
      }
    });

    // Text content matches
    const queryWords = lowerQuery.split(/\s+/);
    queryWords.forEach(word => {
      if (word.length > 2) {
        const regex = new RegExp(word, 'gi');
        const matches = (lowerText.match(regex) || []).length;
        score += matches * 2;
      }
    });

    // Type-specific boosts
    if (lowerQuery.includes('work') || lowerQuery.includes('experience') || lowerQuery.includes('job')) {
      if (item.type === 'experience') score += 15;
    }
    if (lowerQuery.includes('project')) {
      if (item.type === 'project') score += 15;
    }
    if (lowerQuery.includes('skill') || lowerQuery.includes('tool') || lowerQuery.includes('technology')) {
      if (item.type === 'skills') score += 15;
    }
    if (lowerQuery.includes('education') || lowerQuery.includes('degree') || lowerQuery.includes('university')) {
      if (item.type === 'education') score += 15;
    }
    if (lowerQuery.includes('achievement') || lowerQuery.includes('award')) {
      if (item.type === 'achievement') score += 15;
    }

    return score;
  }

  query(question) {
    if (!this.resumeData) {
      return {
        answer: "I'm still loading my knowledge base. Please try again in a moment.",
        sources: []
      };
    }

    // Find most relevant items
    const scoredItems = this.indexedData.map(item => ({
      ...item,
      score: this._calculateRelevance(question, item)
    })).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (scoredItems.length === 0) {
      return {
        answer: "I'm Ragini's AI assistant! I can tell you about her experience in AI/ML, product strategy, finance, her work at companies like Supervity.AI and Nokia, her projects, skills, education, and achievements. Could you rephrase your question?",
        sources: []
      };
    }

    // Generate response based on top matches
    const answer = this._generateAnswer(question, scoredItems);
    
    return {
      answer: answer,
      sources: scoredItems.map(item => ({
        type: item.type,
        title: this._getTitle(item)
      }))
    };
  }

  _getTitle(item) {
    switch (item.type) {
      case 'experience':
        return `${item.data.role} at ${item.data.company}`;
      case 'project':
        return item.data.title;
      case 'education':
        return `${item.data.degree} from ${item.data.institute}`;
      case 'achievement':
        return item.data.title;
      case 'skills':
        return `${item.data.category} Skills`;
      case 'leadership':
        return `${item.data.role} at ${item.data.organization}`;
      default:
        return 'Information';
    }
  }

  _generateAnswer(question, items) {
    const lowerQuestion = question.toLowerCase();
    const topItem = items[0];

    // Special handling for common question types
    if (lowerQuestion.includes('who') || lowerQuestion.includes('about') || lowerQuestion.includes('introduce')) {
      const personal = items.find(i => i.type === 'personal') || topItem;
      return this._formatPersonalResponse(personal);
    }

    if (lowerQuestion.includes('experience') || lowerQuestion.includes('work') || lowerQuestion.includes('job')) {
      const experiences = items.filter(i => i.type === 'experience');
      if (experiences.length > 0) {
        return this._formatExperienceResponse(experiences, question);
      }
    }

    if (lowerQuestion.includes('project')) {
      const projects = items.filter(i => i.type === 'project');
      if (projects.length > 0) {
        return this._formatProjectResponse(projects);
      }
    }

    if (lowerQuestion.includes('skill') || lowerQuestion.includes('tool') || lowerQuestion.includes('technology')) {
      const skills = items.filter(i => i.type === 'skills');
      if (skills.length > 0) {
        return this._formatSkillsResponse(skills);
      }
    }

    if (lowerQuestion.includes('education') || lowerQuestion.includes('degree')) {
      const education = items.filter(i => i.type === 'education');
      if (education.length > 0) {
        return this._formatEducationResponse(education);
      }
    }

    if (lowerQuestion.includes('achievement') || lowerQuestion.includes('award')) {
      const achievements = items.filter(i => i.type === 'achievement');
      if (achievements.length > 0) {
        return this._formatAchievementResponse(achievements);
      }
    }

    // Default: format top matches
    return this._formatGenericResponse(items);
  }

  _formatPersonalResponse(item) {
    const info = this.resumeData.personalInfo;
    return `${info.name} is a ${info.title}. ${info.tagline} She has extensive experience in AI/ML, product strategy, and finance, working with companies like Supervity.AI and Nokia.`;
  }

  _formatExperienceResponse(items, question) {
    const lowerQuestion = question.toLowerCase();
    
    // Check if asking about specific company
    for (const item of items) {
      const company = item.data.company.toLowerCase();
      if (lowerQuestion.includes(company) || lowerQuestion.includes(company.split('.')[0])) {
        const exp = item.data;
        let response = `At ${exp.company}, Ragini worked as ${exp.role} (${exp.duration}). `;
        response += `Key achievements include: ${exp.achievements.slice(0, 3).join('; ')}`;
        if (exp.achievements.length > 3) {
          response += `; and ${exp.achievements.length - 3} more significant accomplishments.`;
        }
        return response;
      }
    }

    // General experience response
    let response = "Ragini has worked at several companies:\n\n";
    items.slice(0, 3).forEach(item => {
      const exp = item.data;
      response += `• ${exp.role} at ${exp.company} (${exp.duration})\n`;
    });
    return response.trim();
  }

  _formatProjectResponse(items) {
    let response = "Ragini has worked on several impactful projects:\n\n";
    items.slice(0, 3).forEach(item => {
      const proj = item.data;
      response += `• ${proj.title} (${proj.duration}): ${proj.description} `;
      if (proj.achievements && proj.achievements.length > 0) {
        response += proj.achievements[0] + ".\n";
      }
    });
    return response.trim();
  }

  _formatSkillsResponse(items) {
    let response = "Ragini's skills span multiple domains:\n\n";
    items.forEach(item => {
      const category = item.data.category.charAt(0).toUpperCase() + item.data.category.slice(1);
      response += `• ${category}: ${item.data.skills.slice(0, 5).join(', ')}`;
      if (item.data.skills.length > 5) {
        response += `, and ${item.data.skills.length - 5} more`;
      }
      response += "\n";
    });
    return response.trim();
  }

  _formatEducationResponse(items) {
    let response = "Ragini's educational background:\n\n";
    items.forEach(item => {
      const edu = item.data;
      response += `• ${edu.degree} from ${edu.institute} (${edu.year}, Grade: ${edu.grade})`;
      if (edu.highlights && edu.highlights.length > 0) {
        response += `. ${edu.highlights.join(', ')}`;
      }
      response += "\n";
    });
    return response.trim();
  }

  _formatAchievementResponse(items) {
    let response = "Ragini's key achievements:\n\n";
    items.slice(0, 5).forEach(item => {
      const ach = item.data;
      response += `• ${ach.title} (${ach.year}): ${ach.description}\n`;
    });
    return response.trim();
  }

  _formatGenericResponse(items) {
    const topItem = items[0];
    let response = topItem.text;
    
    if (items.length > 1) {
      response += "\n\nAdditional relevant information:\n";
      items.slice(1, 3).forEach(item => {
        response += `• ${item.text.substring(0, 150)}...\n`;
      });
    }
    
    return response;
  }
}

// Initialize client-side RAG
const clientRAG = new ClientRAG();
clientRAG.initialize().then(success => {
  if (success) {
    console.log('Client-side RAG engine initialized successfully!');
  } else {
    console.error('Failed to initialize client-side RAG engine');
  }
});
