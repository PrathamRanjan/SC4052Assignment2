from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import base64
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# API Keys
GROQ_API_KEY = ''
GITHUB_TOKEN = ''

github_headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

@app.route('/api/profile-review', methods=['POST'])
def profile_review():
    try:
        data = request.get_json()
        username = data.get('username')
        
        if not username:
            return jsonify({'error': 'GitHub username is required'}), 400
        
        user_response = requests.get(f'https://api.github.com/users/{username}', headers=github_headers)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        repos_response = requests.get(f'https://api.github.com/users/{username}/repos?per_page=100&sort=updated', headers=github_headers)
        repos_response.raise_for_status()
        repos_data = repos_response.json()
        
        events_response = requests.get(f'https://api.github.com/users/{username}/events?per_page=100', headers=github_headers)
        events_response.raise_for_status()
        events_data = events_response.json()
        
        language_stats = {}
        stars_count = sum(repo['stargazers_count'] for repo in repos_data)
        
        for repo in repos_data:
            language = repo.get('language')
            if language:
                language_stats[language] = language_stats.get(language, 0) + 1
        
        profile_data = {
            'basicInfo': {
                'name': user_data.get('name'),
                'login': user_data.get('login'),
                'avatar': user_data.get('avatar_url'),
                'bio': user_data.get('bio'),
                'location': user_data.get('location'),
                'company': user_data.get('company'),
                'blog': user_data.get('blog'),
                'followers': user_data.get('followers'),
                'following': user_data.get('following'),
                'publicRepos': user_data.get('public_repos'),
                'createdAt': user_data.get('created_at')
            },
            'stats': {
                'totalStars': stars_count,
                'topLanguages': [
                    {'language': language, 'count': count}
                    for language, count in sorted(language_stats.items(), key=lambda x: x[1], reverse=True)[:5]
                ],
                'recentActivity': events_data[:10],
                'repositories': [
                    {
                        'id': repo.get('id'),
                        'name': repo.get('name'),
                        'description': repo.get('description'),
                        'stars': repo.get('stargazers_count'),
                        'forks': repo.get('forks_count'),
                        'language': repo.get('language'),
                        'updatedAt': repo.get('updated_at'),
                        'url': repo.get('html_url')
                    }
                    for repo in repos_data
                ]
            }
        }
        
        prompt = f"""
You are a GitHub profile reviewer. Analyze this GitHub profile data and provide a comprehensive review with a rating out of 100.
Focus on these criteria:
1. Activity level (frequency and recency of contributions)
2. Project diversity (variety of repositories)
3. Skill breadth (programming languages and technologies used)
4. Community engagement (followers, stars received)
5. Code quality indicators (from repository descriptions and stats)

Profile data:
{json.dumps(profile_data, indent=2)}

Provide your assessment as a JSON object with these fields:
- overallScore (0-100)
- criteriaScores (object with scores for each of the 5 criteria above)
- strengths (array of strings highlighting strong points)
- areasForImprovement (array of strings with suggestions)
- summary (brief text summary of overall profile)
"""

        groq_response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GROQ_API_KEY}'
            },
            json={
                'model': 'llama3-70b-8192',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.3,
                'max_tokens': 1500
            }
        )
        
        groq_response.raise_for_status()
        analysis_text = groq_response.json()['choices'][0]['message']['content']
        
        import re
        json_match = re.search(r'{[\s\S]*}', analysis_text)
        if not json_match:
            return jsonify({'error': 'Failed to parse analysis result', 'profileData': profile_data}), 500
        
        analysis = json.loads(json_match.group(0))
        
        return jsonify({
            'profileData': profile_data,
            'analysis': analysis
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/readme-generator', methods=['POST'])
def readme_generator():
    try:
        data = request.get_json()
        repo_owner = data.get('repoOwner')
        repo_name = data.get('repoName')
        branch = data.get('branch', 'main')
        
        if not repo_owner or not repo_name:
            return jsonify({'error': 'Repository owner and name are required'}), 400
        
        repo_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}',
            headers=github_headers
        )
        repo_response.raise_for_status()
        repo_data = repo_response.json()
        
        contents_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}/git/trees/{branch}?recursive=1',
            headers=github_headers
        )
        contents_response.raise_for_status()
        
        files_list = [item['path'] for item in contents_response.json()['tree'] if item['type'] == 'blob']
        
        code_extensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'rb', 'php']
        code_files = [file for file in files_list if file.split('.')[-1].lower() in code_extensions][:10]
        
        file_contents = []
        for file in code_files:
            try:
                content_response = requests.get(
                    f'https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{file}?ref={branch}',
                    headers=github_headers
                )
                content_response.raise_for_status()
                content_data = content_response.json()
                
                content = base64.b64decode(content_data['content']).decode('utf-8')
                file_contents.append({'path': file, 'content': content})
            except Exception as e:
                file_contents.append({'path': file, 'content': '// Content could not be retrieved'})
        
        files_content_text = '\n\n'.join([
            f"File: {file['path']}\n```\n{file['content'][:5000] + '...' if len(file['content']) > 5000 else file['content']}\n```"
            for file in file_contents
        ])
        
        prompt = f"""
You are a technical writer specializing in creating clear, informative README.md files for GitHub projects.
Create a comprehensive README.md for this repository based on the code and files provided.

Repository information:
- Name: {repo_data.get('name')}
- Description: {repo_data.get('description') or 'No description provided'}
- Language: {repo_data.get('language') or 'Not specified'}
- Created by: {repo_data.get('owner', {}).get('login')}

Here are some files from the repository:
{files_content_text}

Create a README.md in markdown format that includes:
1. Project title and description
2. Features
3. Installation instructions
4. Usage examples
5. Technologies used
6. Project structure
7. Contributing guidelines
8. License information (if available)

Make sure the README is well-formatted, professional, and provides a clear overview of the project.
"""

        groq_response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {GROQ_API_KEY}'
            },
            json={
                'model': 'llama3-70b-8192',
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.4,
                'max_tokens': 2000
            }
        )
        
        groq_response.raise_for_status()
        readme_content = groq_response.json()['choices'][0]['message']['content']
        
        return jsonify({
            'repoData': repo_data,
            'filesList': files_list,
            'readme': readme_content
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/repo-visualizer', methods=['POST'])
def repo_visualizer():
    try:
        data = request.get_json()
        repo_owner = data.get('repoOwner')
        repo_name = data.get('repoName')
        
        if not repo_owner or not repo_name:
            return jsonify({'error': 'Repository owner and name are required'}), 400
        
        repo_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}',
            headers=github_headers
        )
        repo_response.raise_for_status()
        repo_data = repo_response.json()
        
        contributors_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}/contributors?per_page=10',
            headers=github_headers
        )
        contributors_response.raise_for_status()
        contributors_data = contributors_response.json()
        
        commit_activity_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}/stats/commit_activity',
            headers=github_headers
        )
        commit_activity_response.raise_for_status()
        commit_activity_data = commit_activity_response.json()
        
        languages_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}/languages',
            headers=github_headers
        )
        languages_response.raise_for_status()
        languages_data = languages_response.json()
        
        issues_response = requests.get(
            f'https://api.github.com/repos/{repo_owner}/{repo_name}/issues?state=all&per_page=100',
            headers=github_headers
        )
        issues_response.raise_for_status()
        issues_data = issues_response.json()
        
        commit_activity = []
        if commit_activity_data:
            commit_activity = [
                {'week': f'Week {i+1}', 'commits': week['total']}
                for i, week in enumerate(commit_activity_data[-12:])
            ]
        
        total_bytes = sum(languages_data.values())
        languages = {}
        
        for language, bytes_count in languages_data.items():
            languages[language] = round((bytes_count / total_bytes) * 100, 2)
        
        open_issues = sum(1 for issue in issues_data if issue['state'] == 'open')
        closed_issues = sum(1 for issue in issues_data if issue['state'] == 'closed')
        
        return jsonify({
            'repoData': repo_data,
            'contributors': contributors_data,
            'commitActivity': commit_activity,
            'languages': languages,
            'issues': {
                'open': open_issues,
                'closed': closed_issues
            }
        })
        
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5069))
    app.run(host='0.0.0.0', port=port, debug=True)
