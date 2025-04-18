# GitHub Assistant Tool

<p align="center">
  <img src="https://img.shields.io/badge/React-17.0.2-blue" alt="React"/>
  <img src="https://img.shields.io/badge/Python-3.8+-green" alt="Python"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License"/>
</p>

## 📹 Demo
[![GitHub Assistant Demo](https://img.youtube.com/vi/HNmeVOGMuns/0.jpg)](https://youtu.be/HNmeVOGMuns)

## 📝 Abstract
GitHub Assistant is a comprehensive tool that leverages the GitHub API and AI capabilities to provide profile analysis, README generation. The project demonstrates integration between a React frontend and Python Flask backend, utilizing the Groq API for generating insights through large language models.

## 🔍 Features

### 1. GitHub Profile Reviewer
- **Description**: Analyzes GitHub profiles to provide insights and metrics
- **Key Components**:
  - Overall developer score computation
  - Programming language expertise analysis
  - Repository quality assessment
  - Activity and contribution tracking

### 2. README Generator
- **Description**: Creates comprehensive README files for repositories
- **Key Components**:
  - Code analysis for feature detection
  - Installation and usage documentation generation
  - Project structure explanation
  - Repository metadata integration

## 📋 Installation

### Prerequisites
- Python (v3.8+)
- GitHub Personal Access Token
- Groq API Key
- React

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

### Backend Setup
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys
echo "GROQ_API_KEY=your_groq_api_key" > .env
echo "GITHUB_TOKEN=your_github_personal_access_token" >> .env

# Start the backend server
python backend.py
🔑 API Key Acquisition
GitHub Personal Access Token
Go to GitHub account settings → Developer settings → Personal access tokens → Tokens (classic)
Generate a new token with the following scopes:
repo (Full control of repositories)
user (Read user profile data)
read:org (Read organization data)
Groq API Key
Sign up at Groq Console
Navigate to API section and create a new API key
Add to your .env file as GROQ_API_KEY









