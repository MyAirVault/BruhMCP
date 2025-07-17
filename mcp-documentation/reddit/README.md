# Reddit MCP Service Documentation

## Overview

The Reddit MCP (Model Context Protocol) service provides comprehensive Reddit API integration, enabling users to interact with Reddit through a standardized MCP interface. This service supports reading posts, commenting, voting, messaging, and account management through Reddit's OAuth 2.0 API.

## Service Configuration

- **Service Name**: `reddit`
- **Port**: 49263
- **Authentication**: OAuth 2.0
- **Required Scopes**: 
  - `identity`
  - `read`
  - `submit`
  - `vote`
  - `privatemessages`
  - `subscribe`
  - `history`

## Available Tools

The Reddit MCP service provides 19 comprehensive tools for Reddit interaction, organized into the following categories:

### Subreddit Tools

#### 1. `get_subreddit_info`
Get detailed information about a specific subreddit.

**Parameters:**
- `subreddit` (string, required): Subreddit name (without r/ prefix)

**Example:**
```json
{
  "name": "get_subreddit_info",
  "arguments": {
    "subreddit": "programming"
  }
}
```

#### 2. `get_subreddit_posts`
Get posts from a subreddit with various sorting options.

**Parameters:**
- `subreddit` (string, required): Subreddit name (without r/ prefix)
- `sort` (string): Sort order - "hot", "new", "rising", "top" (default: "hot")
- `time` (string): Time period for top posts - "hour", "day", "week", "month", "year", "all" (default: "day")
- `limit` (number): Number of posts to retrieve, max 100 (default: 25)

**Example:**
```json
{
  "name": "get_subreddit_posts",
  "arguments": {
    "subreddit": "programming",
    "sort": "top",
    "time": "week",
    "limit": 50
  }
}
```

#### 3. `search_subreddits`
Search for subreddits by name or description.

**Parameters:**
- `query` (string, required): Search query for subreddits
- `limit` (number): Number of subreddits to return, max 100 (default: 25)

**Example:**
```json
{
  "name": "search_subreddits",
  "arguments": {
    "query": "machine learning",
    "limit": 20
  }
}
```

### Post Tools

#### 4. `get_post_by_id`
Get detailed information about a specific post.

**Parameters:**
- `postId` (string, required): Reddit post ID (e.g., "abc123")

**Example:**
```json
{
  "name": "get_post_by_id",
  "arguments": {
    "postId": "1a2b3c4d"
  }
}
```

#### 5. `get_post_comments`
Get comments for a specific post.

**Parameters:**
- `postId` (string, required): Reddit post ID
- `sort` (string): Comment sorting - "confidence", "top", "new", "controversial", "old", "random", "qa" (default: "confidence")
- `limit` (number): Number of comments to retrieve, max 500 (default: 50)

**Example:**
```json
{
  "name": "get_post_comments",
  "arguments": {
    "postId": "1a2b3c4d",
    "sort": "top",
    "limit": 100
  }
}
```

#### 6. `submit_post`
Submit a new post to a subreddit.

**Parameters:**
- `subreddit` (string, required): Subreddit name (without r/ prefix)
- `title` (string, required): Post title
- `text` (string): Post text content for text posts (default: "")
- `url` (string): URL for link posts (default: "")
- `kind` (string): Post type - "self" (text) or "link" (default: "self")
- `nsfw` (boolean): Mark post as NSFW (default: false)
- `spoiler` (boolean): Mark post as spoiler (default: false)

**Example:**
```json
{
  "name": "submit_post",
  "arguments": {
    "subreddit": "programming",
    "title": "New JavaScript Framework Released",
    "text": "Here's my thoughts on the new framework...",
    "kind": "self"
  }
}
```

#### 7. `search_posts`
Search for posts across Reddit or within a specific subreddit.

**Parameters:**
- `query` (string, required): Search query for posts
- `subreddit` (string): Limit search to specific subreddit (optional)
- `sort` (string): Sort order - "relevance", "hot", "top", "new", "comments" (default: "relevance")
- `time` (string): Time period - "hour", "day", "week", "month", "year", "all" (default: "all")
- `limit` (number): Number of posts to return, max 100 (default: 25)

**Example:**
```json
{
  "name": "search_posts",
  "arguments": {
    "query": "machine learning tutorial",
    "subreddit": "MachineLearning",
    "sort": "top",
    "time": "month",
    "limit": 30
  }
}
```

### Comment Tools

#### 8. `submit_comment`
Submit a comment to a post or reply to another comment.

**Parameters:**
- `parent` (string, required): Parent post ID (t3_postid) or comment ID (t1_commentid)
- `text` (string, required): Comment text content

**Example:**
```json
{
  "name": "submit_comment",
  "arguments": {
    "parent": "t3_1a2b3c4d",
    "text": "Great post! Thanks for sharing."
  }
}
```

### Voting Tools

#### 9. `vote_on_post`
Vote on a post (upvote, downvote, or remove vote).

**Parameters:**
- `postId` (string, required): Reddit post ID
- `direction` (number, required): Vote direction - 1 (upvote), 0 (no vote), -1 (downvote)

**Example:**
```json
{
  "name": "vote_on_post",
  "arguments": {
    "postId": "1a2b3c4d",
    "direction": 1
  }
}
```

#### 10. `vote_on_comment`
Vote on a comment (upvote, downvote, or remove vote).

**Parameters:**
- `commentId` (string, required): Reddit comment ID
- `direction` (number, required): Vote direction - 1 (upvote), 0 (no vote), -1 (downvote)

**Example:**
```json
{
  "name": "vote_on_comment",
  "arguments": {
    "commentId": "e1f2g3h4",
    "direction": 1
  }
}
```

### User Tools

#### 11. `get_user_info`
Get information about a Reddit user.

**Parameters:**
- `username` (string, required): Reddit username (without u/ prefix)

**Example:**
```json
{
  "name": "get_user_info",
  "arguments": {
    "username": "spez"
  }
}
```

#### 12. `get_user_posts`
Get posts submitted by a specific user.

**Parameters:**
- `username` (string, required): Reddit username (without u/ prefix)
- `sort` (string): Sort order - "hot", "new", "top" (default: "new")
- `time` (string): Time period - "hour", "day", "week", "month", "year", "all" (default: "all")
- `limit` (number): Number of posts to retrieve, max 100 (default: 25)

**Example:**
```json
{
  "name": "get_user_posts",
  "arguments": {
    "username": "spez",
    "sort": "top",
    "time": "year",
    "limit": 50
  }
}
```

#### 13. `get_user_comments`
Get comments made by a specific user.

**Parameters:**
- `username` (string, required): Reddit username (without u/ prefix)
- `sort` (string): Sort order - "hot", "new", "top" (default: "new")
- `time` (string): Time period - "hour", "day", "week", "month", "year", "all" (default: "all")
- `limit` (number): Number of comments to retrieve, max 100 (default: 25)

**Example:**
```json
{
  "name": "get_user_comments",
  "arguments": {
    "username": "spez",
    "sort": "top",
    "time": "month",
    "limit": 30
  }
}
```

### Messaging Tools

#### 14. `get_inbox_messages`
Get messages from user inbox.

**Parameters:**
- `filter` (string): Filter type - "all", "unread", "messages", "comments", "selfreply", "mentions" (default: "all")
- `limit` (number): Number of messages to retrieve, max 100 (default: 25)

**Example:**
```json
{
  "name": "get_inbox_messages",
  "arguments": {
    "filter": "unread",
    "limit": 50
  }
}
```

#### 15. `send_message`
Send a private message to another user.

**Parameters:**
- `to` (string, required): Recipient username (without u/ prefix)
- `subject` (string, required): Message subject
- `text` (string, required): Message text content

**Example:**
```json
{
  "name": "send_message",
  "arguments": {
    "to": "username",
    "subject": "Hello",
    "text": "Hi there! How are you?"
  }
}
```

#### 16. `mark_as_read`
Mark inbox messages as read.

**Parameters:**
- `messageIds` (array, required): Array of message IDs to mark as read

**Example:**
```json
{
  "name": "mark_as_read",
  "arguments": {
    "messageIds": ["msg1", "msg2", "msg3"]
  }
}
```

### Subscription Tools

#### 17. `get_subscriptions`
Get list of subreddits the user is subscribed to.

**Parameters:**
- `limit` (number): Number of subscriptions to return, max 100 (default: 100)

**Example:**
```json
{
  "name": "get_subscriptions",
  "arguments": {
    "limit": 50
  }
}
```

#### 18. `subscribe_to_subreddit`
Subscribe to a subreddit.

**Parameters:**
- `subreddit` (string, required): Subreddit name (without r/ prefix)

**Example:**
```json
{
  "name": "subscribe_to_subreddit",
  "arguments": {
    "subreddit": "programming"
  }
}
```

#### 19. `unsubscribe_from_subreddit`
Unsubscribe from a subreddit.

**Parameters:**
- `subreddit` (string, required): Subreddit name (without r/ prefix)

**Example:**
```json
{
  "name": "unsubscribe_from_subreddit",
  "arguments": {
    "subreddit": "programming"
  }
}
```

## Authentication

The Reddit MCP service uses OAuth 2.0 authentication with the following flow:

1. **Instance Creation**: Each user gets a unique instance ID
2. **OAuth Authorization**: User authorizes the application with required scopes
3. **Token Management**: Access tokens are cached and automatically refreshed
4. **API Access**: All tools use the authenticated user's credentials

## Advanced Features

### Rate Limiting
- Implements Reddit's rate limiting requirements (1 request per second)
- Automatic retry with exponential backoff
- Rate limit statistics tracking via `/stats/rate-limits` endpoint

### Response Caching
- Intelligent response caching for GET operations
- Cache invalidation for POST operations
- Cache statistics available via `/stats/cache` endpoint

### Response Size Limiting
- Configurable response size limits to prevent memory issues
- Size limit statistics via `/stats/size-limits` endpoint

### Performance Monitoring
- Comprehensive token usage metrics
- OAuth integration statistics
- Performance monitoring endpoints

## Error Handling

The service includes comprehensive error handling for:
- **OAuth Authentication Errors**: Invalid tokens, expired credentials
- **Reddit API Errors**: Rate limiting, forbidden actions, not found
- **Network Errors**: Connection issues, timeouts
- **Validation Errors**: Invalid parameters, missing required fields

## Security Features

- **OAuth 2.0 Compliance**: Secure token-based authentication
- **Credential Caching**: Secure in-memory token storage with automatic refresh
- **Multi-tenant Isolation**: Instance-based credential separation
- **Input Validation**: Comprehensive parameter validation
- **Audit Logging**: Security event tracking

## Usage Examples

### Basic Reddit Operations
```json
// Get trending posts from r/programming
{
  "name": "get_subreddit_posts",
  "arguments": {
    "subreddit": "programming",
    "sort": "hot",
    "limit": 10
  }
}

// Submit a text post
{
  "name": "submit_post",
  "arguments": {
    "subreddit": "programming",
    "title": "New JavaScript Framework",
    "text": "Check out this new framework...",
    "kind": "self"
  }
}

// Upvote a post
{
  "name": "vote_on_post",
  "arguments": {
    "postId": "1a2b3c4d",
    "direction": 1
  }
}
```

### Advanced Operations
```json
// Search for posts about machine learning
{
  "name": "search_posts",
  "arguments": {
    "query": "machine learning tutorial",
    "sort": "top",
    "time": "month",
    "limit": 50
  }
}

// Check unread messages
{
  "name": "get_inbox_messages",
  "arguments": {
    "filter": "unread",
    "limit": 25
  }
}

// Get user's subscription list
{
  "name": "get_subscriptions",
  "arguments": {
    "limit": 100
  }
}
```

## Implementation Status

✅ **Fully Implemented Features**:
- Complete Reddit API integration with 19 tools
- OAuth 2.0 authentication with automatic token refresh
- Advanced rate limiting with statistics
- Response caching system
- Response size limiting
- Comprehensive error handling
- Multi-tenant architecture
- Performance monitoring
- Security best practices

✅ **Enhanced Features** (beyond basic MCP requirements):
- Rate limiting middleware with statistics tracking
- Response caching with intelligent invalidation
- Response size limiting for memory management
- Advanced OAuth error handling
- Token usage metrics and monitoring
- Comprehensive validation and sanitization

The Reddit MCP service represents a production-ready implementation with enterprise-grade features for reliability, performance, and security.