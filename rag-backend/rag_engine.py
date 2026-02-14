"""
Simplified RAG Engine for Ragini Bhayana Portfolio
Uses OpenAI embeddings and Pinecone vector database
"""

import os
import json
from typing import List, Dict
from pinecone import Pinecone, ServerlessSpec
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

class RAGEngine:
    def __init__(self):
        """Initialize RAG engine with Pinecone and OpenAI"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.pinecone_api_key = os.getenv('PINECONE_API_KEY')
        self.pinecone_environment = os.getenv('PINECONE_ENVIRONMENT', 'us-east-1')
        self.index_name = os.getenv('PINECONE_INDEX_NAME', 'ragini-portfolio')
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        if not self.pinecone_api_key:
            raise ValueError("PINECONE_API_KEY not found in environment variables")
        
        print("Initializing RAG engine...")
        
        # Initialize embeddings
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=self.openai_api_key,
            model="text-embedding-3-small"
        )
        
        # Initialize Pinecone
        self.pc = Pinecone(api_key=self.pinecone_api_key)
        
        # Initialize or connect to index
        self._setup_index()
        
        # Initialize vector store
        self.vector_store = PineconeVectorStore(
            index=self.index,
            embedding=self.embeddings,
            text_key="text"
        )
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model="gpt-4-turbo-preview",
            temperature=0.7
        )
        
        # Create prompt template
        self.prompt = ChatPromptTemplate.from_template("""You are Ragini Bhayana's AI assistant. You help visitors learn about Ragini's experience, projects, skills, and achievements.

Use the following context to answer the question. Be conversational, enthusiastic, and highlight specific achievements with numbers and metrics when available.

Context: {context}

Question: {question}

Guidelines:
- Be specific and cite actual achievements, metrics, and numbers from the context
- If asked about experience, mention specific companies, roles, and key accomplishments
- If asked about projects, describe the impact and results
- If asked about skills, categorize them (Business, Finance, Technical)
- Keep responses concise but informative (2-4 sentences typically)
- Use a friendly, professional tone
- If you don't have specific information, say so and suggest what you can help with

Answer:""")
        
        # Create retriever
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
        
        # Helper function to format retrieved documents
        def format_docs(docs):
            return "\n\n".join([doc.page_content for doc in docs])
        
        # Create RAG chain using RunnablePassthrough
        self.rag_chain = (
            {"context": self.retriever | format_docs, "question": RunnablePassthrough()}
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
        
        print("RAG engine initialized successfully!")
    
    def _setup_index(self):
        """Setup or connect to Pinecone index"""
        try:
            # Check if index exists
            existing_indexes = [index.name for index in self.pc.list_indexes()]
            
            if self.index_name in existing_indexes:
                # Check if dimensions match
                index_info = self.pc.describe_index(self.index_name)
                if index_info.dimension != 1536:
                    print(f"[WARNING] Existing index has wrong dimension ({index_info.dimension}). Deleting and recreating...")
                    self.pc.delete_index(self.index_name)
                    print(f"[OK] Deleted old index")
                    # Wait a moment for deletion to complete
                    import time
                    time.sleep(2)
                    existing_indexes = []
            
            if self.index_name not in existing_indexes:
                # Create new index
                print(f"Creating new Pinecone index: {self.index_name}")
                self.pc.create_index(
                    name=self.index_name,
                    dimension=1536,  # text-embedding-3-small dimension
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region=self.pinecone_environment
                    )
                )
                print(f"[OK] Created new Pinecone index: {self.index_name}")
            
            # Connect to index
            self.index = self.pc.Index(self.index_name)
            print(f"[OK] Connected to Pinecone index: {self.index_name}")
            
        except Exception as e:
            print(f"[ERROR] Error setting up Pinecone index: {e}")
            raise
    
    def load_knowledge_base(self, data_file: str):
        """Load and index resume data"""
        try:
            print(f"Loading knowledge base from {data_file}...")
            
            # Load resume data
            with open(data_file, 'r', encoding='utf-8') as f:
                resume_data = json.load(f)
            
            # Prepare documents for indexing
            documents = self._prepare_documents(resume_data)
            
            # Check if index is empty
            stats = self.index.describe_index_stats()
            if stats.total_vector_count == 0:
                print("Index is empty. Indexing documents...")
                
                # Split documents into chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=500,
                    chunk_overlap=50,
                    length_function=len
                )
                
                texts = []
                metadatas = []
                
                for doc in documents:
                    chunks = text_splitter.split_text(doc['text'])
                    for chunk in chunks:
                        texts.append(chunk)
                        metadatas.append(doc['metadata'])
                
                # Add to vector store
                self.vector_store.add_texts(
                    texts=texts,
                    metadatas=metadatas
                )
                
                print(f"[OK] Indexed {len(texts)} document chunks to Pinecone")
            else:
                print(f"[OK] Index already contains {stats.total_vector_count} vectors")
                
        except Exception as e:
            print(f"[ERROR] Error loading knowledge base: {e}")
            raise
    
    def _prepare_documents(self, resume_data: Dict) -> List[Dict]:
        """Convert resume data to indexable documents"""
        documents = []
        
        # Personal info
        personal = resume_data.get('personalInfo', {})
        documents.append({
            'text': f"{personal.get('name')} is a {personal.get('title')}. {personal.get('tagline')}",
            'metadata': {'type': 'personal_info'}
        })
        
        # Education
        for edu in resume_data.get('education', []):
            text = f"{edu['degree']} from {edu['institute']} ({edu['year']}, Grade: {edu['grade']})"
            if edu.get('highlights'):
                text += f". Highlights: {', '.join(edu['highlights'])}"
            documents.append({
                'text': text,
                'metadata': {'type': 'education', 'institute': edu['institute']}
            })
        
        # Experience
        for exp in resume_data.get('experience', []):
            text = f"At {exp['company']}, Ragini worked as {exp['role']} ({exp['duration']}). "
            text += "Key achievements: " + " ".join(exp['achievements'])
            documents.append({
                'text': text,
                'metadata': {'type': 'experience', 'company': exp['company']}
            })
        
        # Projects
        for proj in resume_data.get('projects', []):
            text = f"Project: {proj['title']} ({proj['duration']}). {proj['description']} "
            text += "Achievements: " + " ".join(proj['achievements'])
            documents.append({
                'text': text,
                'metadata': {'type': 'project', 'title': proj['title']}
            })
        
        # Achievements
        for ach in resume_data.get('achievements', []):
            text = f"{ach['category']}: {ach['title']} - {ach['description']} ({ach['year']})"
            documents.append({
                'text': text,
                'metadata': {'type': 'achievement', 'category': ach['category']}
            })
        
        # Skills
        skills = resume_data.get('skills', {})
        for category, skill_list in skills.items():
            text = f"Ragini's {category} skills include: {', '.join(skill_list)}"
            documents.append({
                'text': text,
                'metadata': {'type': 'skills', 'category': category}
            })
        
        # Leadership
        for lead in resume_data.get('leadership', []):
            text = f"{lead['role']} at {lead['organization']} ({lead['duration']}). "
            text += "Achievements: " + " ".join(lead['achievements'])
            documents.append({
                'text': text,
                'metadata': {'type': 'leadership', 'organization': lead['organization']}
            })
        
        return documents
    
    def query(self, question: str) -> Dict:
        """Query the RAG system"""
        try:
            # Invoke chain with question
            answer = self.rag_chain.invoke(question)
            
            return {
                'answer': answer,
                'sources': []
            }
            
        except Exception as e:
            print(f"Error querying RAG system: {e}")
            import traceback
            traceback.print_exc()
            return {
                'answer': "I apologize, but I encountered an error processing your question. Please try rephrasing it.",
                'sources': []
            }
