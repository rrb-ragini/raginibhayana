"""
Setup script for RAG backend
Installs dependencies and verifies the environment
"""

import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    print(f"Installing {package}...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def main():
    """Install all required packages"""
    packages = [
        "flask",
        "flask-cors",
        "python-dotenv",
        "openai",
        "pinecone-client",
        "langchain",
        "langchain-community",
        "langchain-text-splitters",
        "langchain-openai",
        "langchain-pinecone",
        "tiktoken"
    ]
    
    print("Installing RAG backend dependencies...")
    print("=" * 50)
    
    for package in packages:
        try:
            install_package(package)
            print(f"✓ {package} installed successfully")
        except Exception as e:
            print(f"✗ Failed to install {package}: {e}")
    
    print("=" * 50)
    print("Installation complete!")
    print("\nNext steps:")
    print("1. Make sure your .env file has OPENAI_API_KEY and PINECONE_API_KEY")
    print("2. Run: python app.py")

if __name__ == "__main__":
    main()
