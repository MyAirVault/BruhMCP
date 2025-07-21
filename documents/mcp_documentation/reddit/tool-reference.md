# Reddit MCP Service - Tool Reference

## Tool Categories

### 🏠 Subreddit Tools (3 tools)
- [`get_subreddit_info`](#get_subreddit_info) - Get subreddit information
- [`get_subreddit_posts`](#get_subreddit_posts) - Get posts from subreddit
- [`search_subreddits`](#search_subreddits) - Search for subreddits

### 📝 Post Tools (4 tools)
- [`get_post_by_id`](#get_post_by_id) - Get specific post details
- [`get_post_comments`](#get_post_comments) - Get post comments
- [`submit_post`](#submit_post) - Submit new post
- [`search_posts`](#search_posts) - Search for posts

### 💬 Comment Tools (1 tool)
- [`submit_comment`](#submit_comment) - Submit comment or reply

### 🗳️ Voting Tools (2 tools)
- [`vote_on_post`](#vote_on_post) - Vote on posts
- [`vote_on_comment`](#vote_on_comment) - Vote on comments

### 👤 User Tools (3 tools)
- [`get_user_info`](#get_user_info) - Get user information
- [`get_user_posts`](#get_user_posts) - Get user's posts
- [`get_user_comments`](#get_user_comments) - Get user's comments

### 📨 Messaging Tools (3 tools)
- [`get_inbox_messages`](#get_inbox_messages) - Get inbox messages
- [`send_message`](#send_message) - Send private message
- [`mark_as_read`](#mark_as_read) - Mark messages as read

### 🔔 Subscription Tools (3 tools)
- [`get_subscriptions`](#get_subscriptions) - Get user subscriptions
- [`subscribe_to_subreddit`](#subscribe_to_subreddit) - Subscribe to subreddit
- [`unsubscribe_from_subreddit`](#unsubscribe_from_subreddit) - Unsubscribe from subreddit

---

## Tool Details

### `get_subreddit_info`
**Description**: Get detailed information about a specific subreddit including subscriber count, description, and rules.

**Parameters**:
- `subreddit` (string, required): Subreddit name (without r/ prefix)

**Reddit API**: `GET /r/{subreddit}/about`

**Response**: Subreddit metadata (subscribers, description, rules, etc.)

**Example**:
```json
{
  "name": "get_subreddit_info",
  "arguments": {
    "subreddit": "programming"
  }
}
```

---

### `get_subreddit_posts`
**Description**: Retrieve posts from a subreddit with various sorting and filtering options.

**Parameters**:
- `subreddit` (string, required): Subreddit name (without r/ prefix)
- `sort` (string, optional): Sort order - "hot", "new", "rising", "top" (default: "hot")
- `time` (string, optional): Time period for "top" sort - "hour", "day", "week", "month", "year", "all" (default: "day")
- `limit` (number, optional): Number of posts to retrieve, max 100 (default: 25)

**Reddit API**: `GET /r/{subreddit}/{sort}`

**Response**: Array of post objects with metadata

**Example**:
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

---

### `search_subreddits`
**Description**: Search for subreddits by name or description using Reddit's search functionality.

**Parameters**:
- `query` (string, required): Search query for subreddits
- `limit` (number, optional): Number of subreddits to return, max 100 (default: 25)

**Reddit API**: `GET /subreddits/search`

**Response**: Array of subreddit objects matching search criteria

**Example**:
```json
{
  "name": "search_subreddits",
  "arguments": {
    "query": "machine learning",
    "limit": 20
  }
}
```

---

### `get_post_by_id`
**Description**: Retrieve detailed information about a specific post using its ID.

**Parameters**:
- `postId` (string, required): Reddit post ID (e.g., "abc123")

**Reddit API**: `GET /comments/{postId}`

**Response**: Post object with full metadata and content

**Example**:
```json
{
  "name": "get_post_by_id",
  "arguments": {
    "postId": "1a2b3c4d"
  }
}
```

---

### `get_post_comments`
**Description**: Get comments for a specific post with sorting and limit options.

**Parameters**:
- `postId` (string, required): Reddit post ID
- `sort` (string, optional): Comment sorting - "confidence", "top", "new", "controversial", "old", "random", "qa" (default: "confidence")
- `limit` (number, optional): Number of comments to retrieve, max 500 (default: 50)

**Reddit API**: `GET /comments/{postId}`

**Response**: Array of comment objects with nested replies

**Example**:
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

---

### `submit_post`
**Description**: Submit a new post to a subreddit (text or link post).

**Parameters**:
- `subreddit` (string, required): Subreddit name (without r/ prefix)
- `title` (string, required): Post title
- `text` (string, optional): Post text content for text posts (default: "")
- `url` (string, optional): URL for link posts (default: "")
- `kind` (string, optional): Post type - "self" (text) or "link" (default: "self")
- `nsfw` (boolean, optional): Mark post as NSFW (default: false)
- `spoiler` (boolean, optional): Mark post as spoiler (default: false)

**Reddit API**: `POST /api/submit`

**Response**: Post submission confirmation with new post ID

**Example**:
```json
{
  "name": "submit_post",
  "arguments": {
    "subreddit": "programming",
    "title": "New JavaScript Framework Released",
    "text": "Here's my thoughts on the new framework...",
    "kind": "self",
    "nsfw": false,
    "spoiler": false
  }
}
```

---

### `search_posts`
**Description**: Search for posts across Reddit or within a specific subreddit.

**Parameters**:
- `query` (string, required): Search query for posts
- `subreddit` (string, optional): Limit search to specific subreddit
- `sort` (string, optional): Sort order - "relevance", "hot", "top", "new", "comments" (default: "relevance")
- `time` (string, optional): Time period - "hour", "day", "week", "month", "year", "all" (default: "all")
- `limit` (number, optional): Number of posts to return, max 100 (default: 25)

**Reddit API**: `GET /search` or `GET /r/{subreddit}/search`

**Response**: Array of post objects matching search criteria

**Example**:
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

---

### `submit_comment`
**Description**: Submit a comment to a post or reply to another comment.

**Parameters**:
- `parent` (string, required): Parent post ID (t3_postid) or comment ID (t1_commentid)
- `text` (string, required): Comment text content

**Reddit API**: `POST /api/comment`

**Response**: Comment submission confirmation with new comment ID

**Example**:
```json
{
  "name": "submit_comment",
  "arguments": {
    "parent": "t3_1a2b3c4d",
    "text": "Great post! Thanks for sharing this information."
  }
}
```

---

### `vote_on_post`
**Description**: Vote on a post (upvote, downvote, or remove vote).

**Parameters**:
- `postId` (string, required): Reddit post ID
- `direction` (number, required): Vote direction - 1 (upvote), 0 (no vote), -1 (downvote)

**Reddit API**: `POST /api/vote`

**Response**: Vote confirmation message

**Example**:
```json
{
  "name": "vote_on_post",
  "arguments": {
    "postId": "1a2b3c4d",
    "direction": 1
  }
}
```

---

### `vote_on_comment`
**Description**: Vote on a comment (upvote, downvote, or remove vote).

**Parameters**:
- `commentId` (string, required): Reddit comment ID
- `direction` (number, required): Vote direction - 1 (upvote), 0 (no vote), -1 (downvote)

**Reddit API**: `POST /api/vote`

**Response**: Vote confirmation message

**Example**:
```json
{
  "name": "vote_on_comment",
  "arguments": {
    "commentId": "e1f2g3h4",
    "direction": 1
  }
}
```

---

### `get_user_info`
**Description**: Get public information about a Reddit user.

**Parameters**:
- `username` (string, required): Reddit username (without u/ prefix)

**Reddit API**: `GET /user/{username}/about`

**Response**: User profile information (karma, created date, etc.)

**Example**:
```json
{
  "name": "get_user_info",
  "arguments": {
    "username": "spez"
  }
}
```

---

### `get_user_posts`
**Description**: Get posts submitted by a specific user.

**Parameters**:
- `username` (string, required): Reddit username (without u/ prefix)
- `sort` (string, optional): Sort order - "hot", "new", "top" (default: "new")
- `time` (string, optional): Time period - "hour", "day", "week", "month", "year", "all" (default: "all")
- `limit` (number, optional): Number of posts to retrieve, max 100 (default: 25)

**Reddit API**: `GET /user/{username}/submitted`

**Response**: Array of posts submitted by the user

**Example**:
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

---

### `get_user_comments`
**Description**: Get comments made by a specific user.

**Parameters**:
- `username` (string, required): Reddit username (without u/ prefix)
- `sort` (string, optional): Sort order - "hot", "new", "top" (default: "new")
- `time` (string, optional): Time period - "hour", "day", "week", "month", "year", "all" (default: "all")
- `limit` (number, optional): Number of comments to retrieve, max 100 (default: 25)

**Reddit API**: `GET /user/{username}/comments`

**Response**: Array of comments made by the user

**Example**:
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

---

### `get_inbox_messages`
**Description**: Get messages from the authenticated user's inbox.

**Parameters**:
- `filter` (string, optional): Filter type - "all", "unread", "messages", "comments", "selfreply", "mentions" (default: "all")
- `limit` (number, optional): Number of messages to retrieve, max 100 (default: 25)

**Reddit API**: `GET /message/inbox`

**Response**: Array of inbox messages

**Example**:
```json
{
  "name": "get_inbox_messages",
  "arguments": {
    "filter": "unread",
    "limit": 50
  }
}
```

---

### `send_message`
**Description**: Send a private message to another Reddit user.

**Parameters**:
- `to` (string, required): Recipient username (without u/ prefix)
- `subject` (string, required): Message subject
- `text` (string, required): Message text content

**Reddit API**: `POST /api/compose`

**Response**: Message send confirmation

**Example**:
```json
{
  "name": "send_message",
  "arguments": {
    "to": "username",
    "subject": "Hello",
    "text": "Hi there! How are you doing?"
  }
}
```

---

### `mark_as_read`
**Description**: Mark inbox messages as read.

**Parameters**:
- `messageIds` (array, required): Array of message IDs to mark as read

**Reddit API**: `POST /api/read_message`

**Response**: Mark as read confirmation

**Example**:
```json
{
  "name": "mark_as_read",
  "arguments": {
    "messageIds": ["msg1", "msg2", "msg3"]
  }
}
```

---

### `get_subscriptions`
**Description**: Get list of subreddits the authenticated user is subscribed to.

**Parameters**:
- `limit` (number, optional): Number of subscriptions to return, max 100 (default: 100)

**Reddit API**: `GET /subreddits/mine/subscriber`

**Response**: Array of subscribed subreddits

**Example**:
```json
{
  "name": "get_subscriptions",
  "arguments": {
    "limit": 50
  }
}
```

---

### `subscribe_to_subreddit`
**Description**: Subscribe to a subreddit.

**Parameters**:
- `subreddit` (string, required): Subreddit name (without r/ prefix)

**Reddit API**: `POST /api/subscribe`

**Response**: Subscription confirmation

**Example**:
```json
{
  "name": "subscribe_to_subreddit",
  "arguments": {
    "subreddit": "programming"
  }
}
```

---

### `unsubscribe_from_subreddit`
**Description**: Unsubscribe from a subreddit.

**Parameters**:
- `subreddit` (string, required): Subreddit name (without r/ prefix)

**Reddit API**: `POST /api/subscribe`

**Response**: Unsubscription confirmation

**Example**:
```json
{
  "name": "unsubscribe_from_subreddit",
  "arguments": {
    "subreddit": "programming"
  }
}
```

## Common Response Patterns

### Success Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "Operation completed successfully. [Details]"
    }
  ]
}
```

### Error Response
```json
{
  "error": {
    "code": -32603,
    "message": "Error description",
    "data": {
      "details": "Additional error context"
    }
  }
}
```

## Tool Usage Tips

1. **ID Formats**: Reddit uses specific ID formats (t3_ for posts, t1_ for comments)
2. **Rate Limiting**: Reddit has strict rate limits (1 request per second)
3. **Subreddit Names**: Always use subreddit names without the "r/" prefix
4. **Usernames**: Always use usernames without the "u/" prefix
5. **Sorting**: Different endpoints support different sorting options
6. **Time Periods**: Time parameters only apply to "top" sort option

## Authentication Requirements

All tools require:
- Valid Reddit OAuth 2.0 access token
- Appropriate Reddit API scopes
- Active user session with valid credentials

## Reddit API Scopes

The Reddit MCP service requires the following scopes:
- `identity` - Access to user identity information
- `read` - Read access to posts and comments
- `submit` - Submit posts and comments
- `vote` - Vote on posts and comments
- `privatemessages` - Access to private messages
- `subscribe` - Subscribe/unsubscribe from subreddits
- `history` - Access to user's posting history

## Performance Considerations

- **Rate Limiting**: Reddit enforces 1 request per second per user
- **Batch Operations**: No native batch operations; use individual calls
- **Large Datasets**: Use pagination and limit parameters for large results
- **Caching**: Responses are cached when appropriate to reduce API calls
- **Error Handling**: Automatic retry logic for rate limiting and network issues

## Reddit-Specific Features

- **Flair Support**: Post and comment flair information included in responses
- **Voting Scores**: Upvote/downvote counts and ratios provided
- **Nested Comments**: Comment threads maintain proper nesting structure
- **Markdown Support**: Full Reddit markdown formatting supported
- **NSFW/Spoiler Tags**: Proper handling of content warnings
- **Moderation Status**: Includes moderation actions and removed content indicators