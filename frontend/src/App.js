import React, { useState } from 'react';
import { 
  GithubIcon, 
  Sparkles, 
  FileText, 
  User, 
  Star, 
  GitFork, 
  Code,
  CheckCircle, 
  XCircle, 
  ArrowUpCircle, 
  Clock,
  BarChart,
  Search,
  Copy,
  Check,
  Download,
  AlertCircle,
  Activity,
  Users,
  GitBranch,
  ExternalLink,
  PlusCircle,
  Eye,
  Award,
  Shield
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import './App.css';

const API_URL = 'http://localhost:5069';

// Define character ranks based on score ranges
const RANK_DEFINITIONS = [
  { min: 0, max: 20, rank: "Rookie", title: "Just starting the journey", icon: "👶" },
  { min: 21, max: 40, rank: "Sidekick", title: "Learning the ropes", icon: "🧒" },
  { min: 41, max: 60, rank: "Vigilante", title: "Making a difference", icon: "🦸‍♂️" },
  { min: 61, max: 80, rank: "Hero", title: "A force to be reckoned with", icon: "⚡" },
  { min: 81, max: 100, rank: "Legend", title: "The stuff of legends", icon: "🔱" }
];

// Function to get rank based on score
const getRankFromScore = (score) => {
  const rank = RANK_DEFINITIONS.find(r => score >= r.min && score <= r.max);
  return rank || RANK_DEFINITIONS[0]; // Default to lowest rank if no match
};

const App = () => {
  const [activeTab, setActiveTab] = useState('profile-reviewer');
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="container header-content">
          <div className="logo-container">
            <GithubIcon size={24} />
            <h1 className="app-title">GitHub Assistant</h1>
          </div>
          <nav className="nav-container">
            <ul className="nav-list">
              <li>
                <button 
                  className={`nav-button ${activeTab === 'profile-reviewer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile-reviewer')}
                >
                  Profile Reviewer
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${activeTab === 'readme-generator' ? 'active' : ''}`}
                  onClick={() => setActiveTab('readme-generator')}
                >
                  README Generator
                </button>
              </li>
              <li>
                <button 
                  className={`nav-button ${activeTab === 'repo-visualizer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('repo-visualizer')}
                >
                  Repo Visualizer
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="main-content container">
        {activeTab === 'profile-reviewer' && <ProfileReviewer />}
        {activeTab === 'readme-generator' && <ReadmeGenerator />}
        {activeTab === 'repo-visualizer' && <RepoVisualizer />}
      </main>
      
      <footer className="app-footer">
        <div className="container footer-content">
          <p>GitHub Assistant &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

const ProfileReviewer = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username) {
      setError('Please enter a GitHub username');
      return;
    }
    
    setLoading(true);
    setError('');
    setProfileData(null);
    setAnalysis(null);
    
    try {
      const response = await fetch(`${API_URL}/api/profile-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze profile');
      }
      
      setProfileData(data.profileData);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'Error fetching profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get rank information if analysis is available
  const rankInfo = analysis ? getRankFromScore(analysis.overallScore) : null;
  
  return (
    <div>
      <div className="form-header">
        <h2 className="section-title">GitHub Profile Reviewer</h2>
        <p className="section-description">
          Enter a GitHub username to get an AI-powered analysis of their profile, repositories, and activity.
        </p>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-wrapper">
            <div className="input-icon">
              <User className="icon-gray" size={20} />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="GitHub Username (e.g., octocat)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Profile <Sparkles className="icon-right" size={18} />
              </>
            )}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            <div className="error-content">
              <XCircle className="error-icon" size={20} />
              <p className="error-text">{error}</p>
            </div>
          </div>
        )}
      </div>
      
      {profileData && analysis && (
        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-header">
                <img 
                  src={profileData.basicInfo.avatar} 
                  alt={`${profileData.basicInfo.login}'s avatar`}
                  className="profile-avatar"
                />
                <h3 className="profile-name">{profileData.basicInfo.name || profileData.basicInfo.login}</h3>
                <a href={`https://github.com/${profileData.basicInfo.login}`} target="_blank" rel="noopener noreferrer" className="profile-link">
                  <GithubIcon size={16} className="icon-right" />
                  {profileData.basicInfo.login}
                </a>
                {profileData.basicInfo.bio && (
                  <p className="profile-bio">{profileData.basicInfo.bio}</p>
                )}
              </div>
              
              <div className="profile-stats">
                <div className="stat-box">
                  <p className="stat-value">{profileData.basicInfo.followers}</p>
                  <p className="stat-label">Followers</p>
                </div>
                <div className="stat-box">
                  <p className="stat-value">{profileData.stats.totalStars}</p>
                  <p className="stat-label">Total Stars</p>
                </div>
                <div className="stat-box">
                  <p className="stat-value">{profileData.basicInfo.publicRepos}</p>
                  <p className="stat-label">Repositories</p>
                </div>
                <div className="stat-box">
                  <p className="stat-value">
                    {new Date().getFullYear() - new Date(profileData.basicInfo.createdAt).getFullYear()}
                  </p>
                  <p className="stat-label">Years Active</p>
                </div>
              </div>
              
              <div className="languages-section">
                <h4 className="subsection-title">Top Languages</h4>
                {profileData.stats.topLanguages && profileData.stats.topLanguages.length > 0 ? (
                  profileData.stats.topLanguages.map((lang, idx) => (
                    <div key={idx} className="language-item">
                      <div className="language-header">
                        <span className="language-name">{lang.language}</span>
                        <span className="language-count">{lang.count} repos</span>
                      </div>
                      <div className="progress-bg">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${(lang.count / profileData.stats.topLanguages[0].count) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No language data available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="profile-main">
            <div className="analysis-card">
              <div className="analysis-header">
                <h3 className="analysis-title">Profile Analysis</h3>
                <div className="score-badge">
                  <span className="score-value">{analysis.overallScore}</span>
                  <span className="score-max">/100</span>
                </div>
              </div>
              
              {/* Developer Rank Section */}
              {rankInfo && (
                <div className="rank-card">
                  <div className="rank-container">
                    <div className="rank-avatar-area">
                      <div className="rank-avatar">
                        {/* Placeholder for custom image */}
                        <span className="rank-icon">{rankInfo.icon}</span>
                      </div>
                      <div className="rank-info">
                        <h4 className="rank-name">{rankInfo.rank}</h4>
                        <p className="rank-title">{rankInfo.title}</p>
                      </div>
                    </div>
                    <div className="rank-level">
                      <Award className="award-icon" size={32} />
                      <span className="level-badge">
                        Level {Math.ceil(analysis.overallScore / 20)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="analysis-summary">{analysis.summary}</p>
              
              <div className="analysis-grid">
                <div className="strengths-section">
                  <h4 className="subsection-title">
                    <CheckCircle className="strength-icon" size={20} />
                    Strengths
                  </h4>
                  <ul className="strengths-list">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="strength-item">
                        <span className="badge strength-badge">+</span>
                        <span className="strength-text">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="improvements-section">
                  <h4 className="subsection-title">
                    <ArrowUpCircle className="improvement-icon" size={20} />
                    Areas for Improvement
                  </h4>
                  <ul className="improvements-list">
                    {analysis.areasForImprovement.map((area, idx) => (
                      <li key={idx} className="improvement-item">
                        <span className="badge improvement-badge">Δ</span>
                        <span className="improvement-text">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <h4 className="subsection-title">
                <BarChart className="scores-icon" size={20} />
                Criteria Scores
              </h4>
              
              <div className="scores-list">
                {Object.entries(analysis.criteriaScores).map(([key, score]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  let barClass = 'score-bar-amber';
                  if (score >= 80) barClass = 'score-bar-green';
                  else if (score >= 60) barClass = 'score-bar-blue';
                  
                  return (
                    <div key={key} className="score-item">
                      <div className="score-header">
                        <span className="score-label">{label}</span>
                        <span className="score-number">{score}/100</span>
                      </div>
                      <div className="score-progress-bg">
                        <div 
                          className={`score-progress-bar ${barClass}`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReadmeGenerator = () => {
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [readme, setReadme] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!repoOwner || !repoName) {
      setError('Please enter repository owner and name');
      return;
    }
    
    setLoading(true);
    setError('');
    setReadme('');
    setRepoData(null);
    
    try {
      const response = await fetch(`${API_URL}/api/readme-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoOwner, repoName, branch })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate README');
      }
      
      setRepoData(data.repoData);
      setReadme(data.readme);
    } catch (err) {
      setError(err.message || 'Error generating README. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyReadme = () => {
    navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReadme = () => {
    const element = document.createElement('a');
    const file = new Blob([readme], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <div className="form-header">
        <h2 className="section-title">GitHub README Generator</h2>
        <p className="section-description">
          Generate a comprehensive README.md file for your GitHub repository based on its code and structure.
        </p>
        
        <form onSubmit={handleSubmit} className="readme-form">
          <div className="form-grid">
            <div>
              <label htmlFor="repoOwner" className="form-label">
                Repository Owner
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <GithubIcon className="icon-gray" size={18} />
                </div>
                <input
                  id="repoOwner"
                  type="text"
                  className="form-input"
                  placeholder="e.g., facebook"
                  value={repoOwner}
                  onChange={(e) => setRepoOwner(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="repoName" className="form-label">
                Repository Name
              </label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <Code className="icon-gray" size={18} />
                </div>
                <input
                  id="repoName"
                  type="text"
                  className="form-input"
                  placeholder="e.g., react"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="branch" className="form-label">
              Branch (Optional)
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <GitBranch className="icon-gray" size={18} />
              </div>
              <input
                id="branch"
                type="text"
                className="form-input"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
            <p className="help-text">
              Default: main. Use this to specify a different branch if needed.
            </p>
          </div>
          
          <button
            type="submit"
            className="full-width-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating README...
              </>
            ) : (
              <>
                <FileText className="icon-left" size={18} />
                Generate README
              </>
            )}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            <div className="error-content">
              <div className="error-icon-container">
                <AlertCircle className="error-icon" />
              </div>
              <div className="error-text-container">
                <p className="error-text">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {readme && repoData && (
        <div className="readme-container">
          <div className="readme-card">
            <div className="readme-header">
              <div className="readme-title-container">
                <FileText className="readme-icon" size={20} />
                <h3 className="readme-title">Generated README.md for {repoData.name}</h3>
              </div>
              <div className="readme-actions">
                <button
                  onClick={copyReadme}
                  className="action-button copy-button"
                >
                  {copied ? (
                    <>
                      <Check className="icon-left" size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="icon-left" size={16} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={downloadReadme}
                  className="action-button download-button"
                >
                  <Download className="icon-left" size={16} />
                  Download
                </button>
              </div>
            </div>
            <div className="readme-content">
              <pre className="readme-pre">
                {readme}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RepoVisualizer = () => {
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [commitActivity, setCommitActivity] = useState([]);
  const [languages, setLanguages] = useState({});
  const [issues, setIssues] = useState({ open: 0, closed: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!repoOwner || !repoName) {
      setError('Please enter repository owner and name');
      return;
    }
    
    setLoading(true);
    setError('');
    setRepoData(null);
    setContributors([]);
    setCommitActivity([]);
    setLanguages({});
    setIssues({ open: 0, closed: 0 });
    
    try {
      const response = await fetch(`${API_URL}/api/repo-visualizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoOwner, repoName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to visualize repository');
      }
      
      setRepoData(data.repoData);
      setContributors(data.contributors);
      setCommitActivity(data.commitActivity);
      setLanguages(data.languages);
      setIssues(data.issues);
    } catch (err) {
      setError(err.message || 'Error fetching repository data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Convert languages object to array for charts
  const languagesArray = Object.entries(languages).map(([name, value]) => ({
    name,
    value
  }));

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Format date string
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate repository age in days
  const calculateRepoAge = (createdAt) => {
    const created = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="visualizer-container">
      <h2 className="section-title">GitHub Repository Visualizer</h2>
      <p className="section-description">
        Enter a GitHub repository to generate interactive visualizations and insights.
      </p>
      
      <form onSubmit={handleSubmit} className="visualizer-form">
        <div className="form-grid">
          <div>
            <label htmlFor="repoOwner" className="form-label">
              Repository Owner
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <GithubIcon className="icon-gray" size={18} />
              </div>
              <input
                id="repoOwner"
                type="text"
                className="form-input"
                placeholder="e.g., facebook"
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="repoName" className="form-label">
              Repository Name
            </label>
            <div className="input-wrapper">
              <div className="input-icon">
                <Code className="icon-gray" size={18} />
              </div>
              <input
                id="repoName"
                type="text"
                className="form-input"
                placeholder="e.g., react"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className="full-width-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Visualizations...
            </>
          ) : (
            <>
              <Search className="icon-left" size={18} />
              Visualize Repository
            </>
          )}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <div className="error-content">
            <div className="error-icon-container">
              <AlertCircle className="error-icon" />
            </div>
            <div className="error-text-container">
              <p className="error-text">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {repoData && (
        <div className="visualizer-results">
          {/* Repository Header */}
          <div className="repo-header-card">
            <div className="repo-header-container">
              <div className="repo-info">
                <h3 className="repo-title">
                  <GithubIcon className="repo-icon" size={20} />
                  <span>{repoOwner}/{repoName}</span>
                </h3>
                <p className="repo-description">{repoData.description}</p>
                
                <div className="topics-container">
                  {repoData.topics && repoData.topics.map((topic, index) => (
                    <span 
                      key={index} 
                      className="topic-badge"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="repo-stats">
                <div className="repo-stat">
                  <Star className="star-icon" size={18} />
                  <span className="stat-value">{repoData.stargazers_count.toLocaleString()}</span>
                  <span className="stat-label">stars</span>
                </div>
                <div className="repo-stat">
                  <GitBranch className="fork-icon" size={18} />
                  <span className="stat-value">{repoData.forks_count.toLocaleString()}</span>
                  <span className="stat-label">forks</span>
                </div>
                <div className="repo-stat">
                  <Eye className="eye-icon" size={18} />
                  <span className="stat-value">{repoData.subscribers_count.toLocaleString()}</span>
                  <span className="stat-label">watchers</span>
                </div>
                <div className="repo-stat">
                  <AlertCircle className="alert-icon" size={18} />
                  <span className="stat-value">{repoData.open_issues_count.toLocaleString()}</span>
                  <span className="stat-label">issues</span>
                </div>
              </div>
            </div>
            
            <div className="repo-meta">
              <div className="meta-box">
                <p className="meta-label">Created</p>
                <p className="meta-value">
                  <Clock className="meta-icon" size={16} />
                  {formatDate(repoData.created_at)}
                </p>
                <p className="meta-detail">
                  {calculateRepoAge(repoData.created_at).toLocaleString()} days ago
                </p>
              </div>
              
              <div className="meta-box">
                <p className="meta-label">Last Updated</p>
                <p className="meta-value">
                  <Activity className="meta-icon" size={16} />
                  {formatDate(repoData.updated_at)}
                </p>
              </div>
              
              <div className="meta-box">
                <p className="meta-label">License</p>
                <p className="meta-value">
                  {repoData.license ? repoData.license.name : 'No license specified'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Language Distribution */}
          {languagesArray.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Language Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languagesArray}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {languagesArray.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Commit Activity */}
          {commitActivity.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Commit Activity (Last 12 Weeks)</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={commitActivity}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="commits" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Top Contributors */}
          {contributors.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Top Contributors</h3>
              <div className="contributors-layout">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={contributors.slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="login" 
                        width={80}
                      />
                      <RechartsTooltip />
                      <Bar dataKey="contributions" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="contributors-list">
                  <h4 className="contributors-title">Contributors List</h4>
                  <div className="contributor-items">
                    {contributors.slice(0, 5).map((contributor) => (
                      <div key={contributor.id} className="contributor-item">
                        <img 
                          src={contributor.avatar_url} 
                          alt={`${contributor.login}'s avatar`}
                          className="contributor-avatar"
                        />
                        <div className="contributor-info">
                          <a 
                            href={contributor.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link"
                          >
                            {contributor.login}
                          </a>
                          <p className="contributor-commits">{contributor.contributions} commits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Issues Summary */}
          <div className="chart-card">
            <h3 className="chart-title">Issues Summary</h3>
            <div className="issues-grid">
              <div className="issue-box open-issues">
                <p className="issue-count">{issues.open}</p>
                <p className="issue-label">Open Issues</p>
              </div>
              <div className="issue-box closed-issues">
                <p className="issue-count">{issues.closed}</p>
                <p className="issue-label">Closed Issues</p>
              </div>
            </div>
            
            <div className="issue-link-wrapper">
              <a 
                href={`https://github.com/${repoOwner}/${repoName}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="issue-link"
              >
                <span>View all issues on GitHub</span>
                <ExternalLink size={14} className="external-link-icon" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;