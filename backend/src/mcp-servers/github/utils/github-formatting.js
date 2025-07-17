/**
 * GitHub response formatting utilities
 * Standardizes GitHub API responses for MCP tools
 */

/**
 * Format repository response from GitHub API
 * @param {Object} repo - Raw GitHub repository object
 * @returns {Object} Formatted repository response
 */
export function formatRepositoryResponse(repo) {
    if (!repo) return null;
    
    return {
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        'private': repo.private,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        ssh_url: repo.ssh_url,
        owner: {
            login: repo.owner?.login,
            id: repo.owner?.id,
            avatar_url: repo.owner?.avatar_url,
            type: repo.owner?.type
        },
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        size: repo.size,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        language: repo.language,
        has_issues: repo.has_issues,
        has_projects: repo.has_projects,
        has_wiki: repo.has_wiki,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        default_branch: repo.default_branch,
        topics: repo.topics || [],
        license: repo.license ? {
            key: repo.license.key,
            name: repo.license.name,
            spdx_id: repo.license.spdx_id
        } : null
    };
}

/**
 * Format issue response from GitHub API
 * @param {Object} issue - Raw GitHub issue object
 * @returns {Object} Formatted issue response
 */
export function formatIssueResponse(issue) {
    if (!issue) return null;
    
    return {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        locked: issue.locked,
        user: {
            login: issue.user?.login,
            id: issue.user?.id,
            avatar_url: issue.user?.avatar_url,
            type: issue.user?.type
        },
        assignees: issue.assignees?.map(assignee => ({
            login: assignee.login,
            id: assignee.id,
            avatar_url: assignee.avatar_url
        })) || [],
        labels: issue.labels?.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color,
            description: label.description
        })) || [],
        milestone: issue.milestone ? {
            id: issue.milestone.id,
            title: issue.milestone.title,
            description: issue.milestone.description,
            state: issue.milestone.state,
            due_on: issue.milestone.due_on
        } : null,
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        html_url: issue.html_url,
        pull_request: issue.pull_request ? {
            url: issue.pull_request.url,
            html_url: issue.pull_request.html_url
        } : null
    };
}

/**
 * Format pull request response from GitHub API
 * @param {Object} pr - Raw GitHub pull request object
 * @returns {Object} Formatted pull request response
 */
export function formatPullRequestResponse(pr) {
    if (!pr) return null;
    
    return {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        locked: pr.locked,
        draft: pr.draft,
        user: {
            login: pr.user?.login,
            id: pr.user?.id,
            avatar_url: pr.user?.avatar_url,
            type: pr.user?.type
        },
        assignees: pr.assignees?.map(assignee => ({
            login: assignee.login,
            id: assignee.id,
            avatar_url: assignee.avatar_url
        })) || [],
        reviewers: pr.requested_reviewers?.map(reviewer => ({
            login: reviewer.login,
            id: reviewer.id,
            avatar_url: reviewer.avatar_url
        })) || [],
        labels: pr.labels?.map(label => ({
            id: label.id,
            name: label.name,
            color: label.color,
            description: label.description
        })) || [],
        milestone: pr.milestone ? {
            id: pr.milestone.id,
            title: pr.milestone.title,
            description: pr.milestone.description,
            state: pr.milestone.state,
            due_on: pr.milestone.due_on
        } : null,
        head: {
            ref: pr.head?.ref,
            sha: pr.head?.sha,
            user: {
                login: pr.head?.user?.login,
                id: pr.head?.user?.id
            },
            repo: pr.head?.repo ? {
                id: pr.head.repo.id,
                name: pr.head.repo.name,
                full_name: pr.head.repo.full_name
            } : null
        },
        base: {
            ref: pr.base?.ref,
            sha: pr.base?.sha,
            user: {
                login: pr.base?.user?.login,
                id: pr.base?.user?.id
            },
            repo: pr.base?.repo ? {
                id: pr.base.repo.id,
                name: pr.base.repo.name,
                full_name: pr.base.repo.full_name
            } : null
        },
        merge_commit_sha: pr.merge_commit_sha,
        merged: pr.merged,
        merged_at: pr.merged_at,
        mergeable: pr.mergeable,
        mergeable_state: pr.mergeable_state,
        comments: pr.comments,
        review_comments: pr.review_comments,
        commits: pr.commits,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        html_url: pr.html_url,
        diff_url: pr.diff_url,
        patch_url: pr.patch_url
    };
}

/**
 * Format commit response from GitHub API
 * @param {Object} commit - Raw GitHub commit object
 * @returns {Object} Formatted commit response
 */
export function formatCommitResponse(commit) {
    if (!commit) return null;
    
    return {
        sha: commit.sha,
        html_url: commit.html_url,
        commit: {
            author: {
                name: commit.commit?.author?.name,
                email: commit.commit?.author?.email,
                date: commit.commit?.author?.date
            },
            committer: {
                name: commit.commit?.committer?.name,
                email: commit.commit?.committer?.email,
                date: commit.commit?.committer?.date
            },
            message: commit.commit?.message,
            tree: {
                sha: commit.commit?.tree?.sha,
                url: commit.commit?.tree?.url
            },
            comment_count: commit.commit?.comment_count,
            verification: commit.commit?.verification ? {
                verified: commit.commit.verification.verified,
                reason: commit.commit.verification.reason,
                signature: commit.commit.verification.signature,
                payload: commit.commit.verification.payload
            } : null
        },
        author: commit.author ? {
            login: commit.author.login,
            id: commit.author.id,
            avatar_url: commit.author.avatar_url,
            type: commit.author.type
        } : null,
        committer: commit.committer ? {
            login: commit.committer.login,
            id: commit.committer.id,
            avatar_url: commit.committer.avatar_url,
            type: commit.committer.type
        } : null,
        parents: commit.parents?.map(parent => ({
            sha: parent.sha,
            url: parent.url,
            html_url: parent.html_url
        })) || [],
        stats: commit.stats ? {
            total: commit.stats.total,
            additions: commit.stats.additions,
            deletions: commit.stats.deletions
        } : null,
        files: commit.files?.map(file => ({
            sha: file.sha,
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            blob_url: file.blob_url,
            raw_url: file.raw_url,
            contents_url: file.contents_url,
            patch: file.patch
        })) || []
    };
}

/**
 * Format user response from GitHub API
 * @param {Object} user - Raw GitHub user object
 * @returns {Object} Formatted user response
 */
export function formatUserResponse(user) {
    if (!user) return null;
    
    return {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        gravatar_id: user.gravatar_id,
        type: user.type,
        site_admin: user.site_admin,
        company: user.company,
        blog: user.blog,
        location: user.location,
        bio: user.bio,
        twitter_username: user.twitter_username,
        public_repos: user.public_repos,
        public_gists: user.public_gists,
        followers: user.followers,
        following: user.following,
        created_at: user.created_at,
        updated_at: user.updated_at,
        private_gists: user.private_gists,
        total_private_repos: user.total_private_repos,
        owned_private_repos: user.owned_private_repos,
        disk_usage: user.disk_usage,
        collaborators: user.collaborators,
        two_factor_authentication: user.two_factor_authentication,
        plan: user.plan ? {
            name: user.plan.name,
            space: user.plan.space,
            private_repos: user.plan.private_repos,
            collaborators: user.plan.collaborators
        } : null
    };
}

/**
 * Format branch response from GitHub API
 * @param {Object} branch - Raw GitHub branch object
 * @returns {Object} Formatted branch response
 */
export function formatBranchResponse(branch) {
    if (!branch) return null;
    
    return {
        name: branch.name,
        commit: {
            sha: branch.commit?.sha,
            url: branch.commit?.url
        },
        'protected': branch.protected,
        protection: branch.protection ? {
            enabled: branch.protection.enabled,
            required_status_checks: branch.protection.required_status_checks
        } : null,
        protection_url: branch.protection_url
    };
}

/**
 * Format repository content response from GitHub API
 * @param {Object} content - Raw GitHub content object
 * @returns {Object} Formatted content response
 */
export function formatContentResponse(content) {
    if (!content) return null;
    
    // Handle array of content items (directory listing)
    if (Array.isArray(content)) {
        return content.map(item => formatContentResponse(item));
    }
    
    return {
        name: content.name,
        path: content.path,
        sha: content.sha,
        size: content.size,
        type: content.type,
        download_url: content.download_url,
        html_url: content.html_url,
        git_url: content.git_url,
        url: content.url,
        content: content.content,
        encoding: content.encoding,
        target: content.target, // For symlinks
        submodule_git_url: content.submodule_git_url, // For submodules
        _links: content._links ? {
            self: content._links.self,
            git: content._links.git,
            html: content._links.html
        } : null
    };
}

/**
 * Format search results response from GitHub API
 * @param {Object} searchResult - Raw GitHub search result object
 * @param {string} type - Type of search (repositories, issues, etc.)
 * @returns {Object} Formatted search response
 */
export function formatSearchResponse(searchResult, type) {
    if (!searchResult) return null;
    
    const base = {
        total_count: searchResult.total_count,
        incomplete_results: searchResult.incomplete_results
    };
    
    switch (type) {
        case 'repositories':
            return {
                ...base,
                items: searchResult.items?.map(repo => formatRepositoryResponse(repo)) || []
            };
        case 'issues':
            return {
                ...base,
                items: searchResult.items?.map(issue => formatIssueResponse(issue)) || []
            };
        case 'commits':
            return {
                ...base,
                items: searchResult.items?.map(commit => formatCommitResponse(commit)) || []
            };
        case 'users':
            return {
                ...base,
                items: searchResult.items?.map(user => formatUserResponse(user)) || []
            };
        default:
            return {
                ...base,
                items: searchResult.items || []
            };
    }
}

/**
 * Format error response for consistent error handling
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error, context = 'Unknown') {
    return {
        error: true,
        message: error.message || 'An error occurred',
        context: context,
        timestamp: new Date().toISOString(),
        type: error.name || 'Error'
    };
}