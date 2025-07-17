/**
 * GitHub API client implementation
 * Handles all GitHub API interactions with proper error handling
 */

import { fetchWithRetry } from '../utils/fetch-with-retry.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub API client class
 */
export class GitHubAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = GITHUB_API_BASE;
  }

  /**
   * Make authenticated request to GitHub API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'minimcp-github-service',
        ...options.headers
      }
    };

    return fetchWithRetry(url, requestOptions);
  }

  /**
   * Create a new issue in a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} title - Issue title
   * @param {string} body - Issue body
   * @returns {Promise<Object>} Created issue
   */
  async createIssue(owner, repo, title, body) {
    return this.makeRequest(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body
      })
    });
  }

  /**
   * Create a new pull request
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} title - Pull request title
   * @param {string} head - Branch to merge from
   * @param {string} base - Branch to merge into
   * @param {string} body - Pull request body
   * @returns {Promise<Object>} Created pull request
   */
  async createPullRequest(owner, repo, title, head, base, body) {
    return this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        head,
        base,
        body
      })
    });
  }

  /**
   * Get details of a specific pull request
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} pullNumber - Pull request number
   * @returns {Promise<Object>} Pull request details
   */
  async getPullRequest(owner, repo, pullNumber) {
    return this.makeRequest(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }

  /**
   * List all branches in a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} List of branches
   */
  async listBranches(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}/branches`);
  }

  /**
   * List commits in a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} per_page - Number of commits per page
   * @returns {Promise<Array>} List of commits
   */
  async listCommits(owner, repo, per_page = 30) {
    return this.makeRequest(`/repos/${owner}/${repo}/commits?per_page=${per_page}`);
  }

  /**
   * Get current user information
   * @returns {Promise<Object>} User information
   */
  async getCurrentUser() {
    return this.makeRequest('/user');
  }

  /**
   * List user's repositories
   * @param {string} type - Repository type (all, owner, member)
   * @param {string} sort - Sort order (created, updated, pushed, full_name)
   * @returns {Promise<Array>} List of repositories
   */
  async listUserRepositories(type = 'all', sort = 'updated') {
    return this.makeRequest(`/user/repos?type=${type}&sort=${sort}`);
  }

  /**
   * Get repository information
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Repository details
   */
  async getRepository(owner, repo) {
    return this.makeRequest(`/repos/${owner}/${repo}`);
  }

  /**
   * Search repositories
   * @param {string} query - Search query
   * @param {number} per_page - Number of results per page
   * @returns {Promise<Object>} Search results
   */
  async searchRepositories(query, per_page = 30) {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest(`/search/repositories?q=${encodedQuery}&per_page=${per_page}`);
  }

  /**
   * Get repository issues
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} state - Issue state (open, closed, all)
   * @returns {Promise<Array>} List of issues
   */
  async getIssues(owner, repo, state = 'open') {
    return this.makeRequest(`/repos/${owner}/${repo}/issues?state=${state}`);
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const user = await this.getCurrentUser();
      return {
        success: true,
        user: {
          login: user.login,
          name: user.name,
          id: user.id
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}