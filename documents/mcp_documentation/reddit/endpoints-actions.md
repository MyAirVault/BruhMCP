# Reddit MCP Server - Available Endpoints & Actions

Your Reddit MCP server provides comprehensive access to the Reddit API through 19 different tools/endpoints with enterprise-grade optimization and advanced features:

## 🏠 **Subreddit Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_subreddit_info` | Get detailed information about a specific subreddit | `subreddit` |
| `get_subreddit_posts` | Get posts from a subreddit with sorting options | `subreddit` |
| `search_subreddits` | Search for subreddits by name or description | `query` |

## 📝 **Post Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_post_by_id` | Get detailed information about a specific post | `postId` |
| `get_post_comments` | Get comments for a specific post | `postId` |
| `submit_post` | Submit a new post to a subreddit | `subreddit`, `title` |
| `search_posts` | Search for posts across Reddit or within a subreddit | `query` |

## 💬 **Comment Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `submit_comment` | Submit a comment to a post or reply to another comment | `parent`, `text` |

## 🗳️ **Voting Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `vote_on_post` | Vote on a post (upvote, downvote, or remove vote) | `postId`, `direction` |
| `vote_on_comment` | Vote on a comment (upvote, downvote, or remove vote) | `commentId`, `direction` |

## 👤 **User Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_user_info` | Get information about a Reddit user | `username` |
| `get_user_posts` | Get posts submitted by a specific user | `username` |
| `get_user_comments` | Get comments made by a specific user | `username` |

## 📨 **Messaging Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_inbox_messages` | Get messages from user inbox | None |
| `send_message` | Send a private message to another user | `to`, `subject`, `text` |
| `mark_as_read` | Mark inbox messages as read | `messageIds` |

## 🔔 **Subscription Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `get_subscriptions` | Get list of subreddits the user is subscribed to | None |
| `subscribe_to_subreddit` | Subscribe to a subreddit | `subreddit` |
| `unsubscribe_from_subreddit` | Unsubscribe from a subreddit | `subreddit` |

## 🔐 **Authentication**
Your Reddit MCP server uses **OAuth 2.0 authentication**:
- Requires Reddit API credentials (client ID and secret)
- OAuth flow with user consent for required scopes
- Automatic token refresh and management
- Secure credential caching with background synchronization

## 🚀 **Common Use Cases**

### **Content Discovery**
```javascript
// Get trending posts from a subreddit
get_subreddit_posts({ 
  subreddit: "programming", 
  sort: "hot", 
  limit: 25 
})

// Search for specific content
search_posts({
  query: "machine learning tutorial",
  subreddit: "MachineLearning",
  sort: "top",
  time: "month",
  limit: 50
})

// Find relevant subreddits
search_subreddits({
  query: "artificial intelligence",
  limit: 20
})
```

### **Content Creation**
```javascript
// Submit a text post
submit_post({
  subreddit: "programming",
  title: "New JavaScript Framework Released",
  text: "Here's my thoughts on the new framework...",
  kind: "self",
  nsfw: false,
  spoiler: false
})

// Submit a link post
submit_post({
  subreddit: "technology",
  title: "Interesting Article",
  url: "https://example.com/article",
  kind: "link"
})

// Add a comment to a post
submit_comment({
  parent: "t3_1a2b3c4d",
  text: "Great post! Thanks for sharing this information."
})
```

### **Community Interaction**
```javascript
// Vote on content
vote_on_post({
  postId: "1a2b3c4d",
  direction: 1  // upvote
})

vote_on_comment({
  commentId: "e1f2g3h4",
  direction: -1  // downvote
})

// Manage subscriptions
subscribe_to_subreddit({
  subreddit: "programming"
})

get_subscriptions({
  limit: 100
})
```

### **User Information**
```javascript
// Get user profile information
get_user_info({
  username: "spez"
})

// Get user's post history
get_user_posts({
  username: "spez",
  sort: "top",
  time: "year",
  limit: 50
})

// Get user's comment history
get_user_comments({
  username: "spez",
  sort: "new",
  limit: 30
})
```

### **Messaging**
```javascript
// Check inbox for new messages
get_inbox_messages({
  filter: "unread",
  limit: 25
})

// Send a private message
send_message({
  to: "username",
  subject: "Hello",
  text: "Hi there! How are you doing?"
})

// Mark messages as read
mark_as_read({
  messageIds: ["msg1", "msg2", "msg3"]
})
```

## 🚀 **Advanced Features**

### **Enterprise-Grade Performance**
- **Rate Limiting**: Built-in 1 request/second rate limiting with intelligent queuing
- **Response Caching**: Automatic caching for GET operations with cache invalidation
- **Response Size Limiting**: Configurable response size limits to prevent memory issues
- **Automatic Retry**: Exponential backoff retry logic with circuit breaker
- **Performance Monitoring**: Real-time performance metrics and statistics

### **Advanced Data Processing**
- **Response Optimization**: Automatic payload size reduction and compression
- **Data Validation**: Comprehensive input validation with parameter checking
- **Data Sanitization**: XSS and injection protection
- **Error Handling**: Sophisticated error categorization and recovery
- **Reddit-Specific Formatting**: Proper handling of Reddit markdown and formatting

### **OAuth & Security**
- **Token Management**: Automatic access token refresh and rotation
- **Credential Caching**: Secure in-memory credential storage with background sync
- **Multi-tenant Isolation**: Instance-based credential separation
- **Secure Logging**: Sensitive data redaction in logs
- **Health Monitoring**: Comprehensive health checks and diagnostics

### **Reddit-Specific Features**
- **Flair Support**: Post and comment flair information included in responses
- **Voting Scores**: Upvote/downvote counts and ratios provided
- **Nested Comments**: Comment threads maintain proper nesting structure
- **Markdown Support**: Full Reddit markdown formatting supported
- **NSFW/Spoiler Tags**: Proper handling of content warnings
- **Moderation Status**: Includes moderation actions and removed content indicators

## 📊 **API Coverage**
Your implementation covers **comprehensive Reddit API endpoints**:
- ✅ Subreddits API (info, posts, search) - **Enhanced with caching**
- ✅ Posts API (get, submit, search) - **Enhanced with validation & optimization**
- ✅ Comments API (get, submit) - **Enhanced with nested structure handling**
- ✅ Voting API (posts, comments) - **Enhanced with direction validation**
- ✅ Users API (info, posts, comments) - **Enhanced with pagination**
- ✅ Messages API (inbox, send, mark read) - **Enhanced with filtering**
- ✅ Subscriptions API (get, subscribe, unsubscribe) - **Enhanced with management**
- ✅ Performance monitoring - **NEW: Real-time statistics**
- ❌ Multireddits API - **Future enhancement**
- ❌ Saved posts API - **Future enhancement**
- ❌ Moderation API - **Future enhancement**
- ❌ Flair management API - **Future enhancement**
- ❌ Wiki API - **Future enhancement**
- ❌ Live threads API - **Future enhancement**

## 🔧 **Technical Implementation Details**

### **Error Handling**
All endpoints include comprehensive error handling:
- **401**: Invalid or expired OAuth token
- **403**: Insufficient permissions or banned user
- **404**: Resource not found (subreddit, post, user)
- **429**: Rate limit exceeded
- **500**: Reddit API server errors
- **General**: Network and parsing errors

### **Validation**
Input validation includes:
- Subreddit name format validation (no r/ prefix)
- Username format validation (no u/ prefix)
- Post ID and comment ID format validation
- Vote direction validation (1, 0, -1)
- Message content validation
- Parameter length and type validation

### **Rate Limiting**
- Built-in 1 request per second rate limiting
- Intelligent request queuing and throttling
- Automatic retry with exponential backoff
- Rate limit statistics tracking
- Reddit API rate limit compliance

## 🔄 **Integration Examples**

### **Frontend Integration**
```typescript
// Example usage in your frontend
const redditService = {
  async getSubredditPosts(subreddit: string, sort: string = 'hot') {
    return await apiCall('get_subreddit_posts', { subreddit, sort });
  },
  
  async submitPost(subreddit: string, title: string, text: string) {
    return await apiCall('submit_post', { subreddit, title, text, kind: 'self' });
  },
  
  async voteOnPost(postId: string, direction: number) {
    return await apiCall('vote_on_post', { postId, direction });
  }
};
```

### **Content Monitoring Example**
```javascript
// Monitor a subreddit for new posts
async function monitorSubreddit(subreddit) {
  const posts = await get_subreddit_posts({
    subreddit,
    sort: 'new',
    limit: 10
  });
  
  for (const post of posts) {
    if (post.score > 100) {
      // High-scoring post detected
      await vote_on_post({
        postId: post.id,
        direction: 1  // upvote
      });
    }
  }
}
```

### **User Engagement Analysis**
```javascript
// Analyze user engagement patterns
async function analyzeUser(username) {
  const [userInfo, userPosts, userComments] = await Promise.all([
    get_user_info({ username }),
    get_user_posts({ username, sort: 'top', time: 'month', limit: 50 }),
    get_user_comments({ username, sort: 'top', time: 'month', limit: 50 })
  ]);
  
  return {
    karma: userInfo.karma,
    topPosts: userPosts.slice(0, 10),
    topComments: userComments.slice(0, 10),
    averageScore: calculateAverageScore(userPosts, userComments)
  };
}
```

## 🎯 **Performance & Reliability**

### **✅ Enterprise-Grade Features Now Available**
1. **✅ Advanced rate limiting** - 1 request/second with intelligent queuing
2. **✅ Response caching** - Automatic caching with cache invalidation
3. **✅ Response size limiting** - Configurable limits to prevent memory issues
4. **✅ OAuth token management** - Automatic refresh and credential caching
5. **✅ Comprehensive error handling** - Sophisticated error categorization and recovery
6. **✅ Input validation** - Complete parameter validation with type checking
7. **✅ Structured logging** - Professional logging with performance metrics
8. **✅ Performance monitoring** - Real-time statistics and health checks

### **🏗️ Architecture Strengths**
- ✅ **Dedicated API client layer** - RedditAPI with rate limiting and retry logic
- ✅ **Response caching services** - ResponseCache with intelligent invalidation
- ✅ **OAuth integration utilities** - Token management and validation
- ✅ **Reddit-specific formatting** - Proper handling of Reddit data structures
- ✅ **Comprehensive validation system** - Parameter and data validation
- ✅ **Multi-tenant architecture** - Instance-based credential separation

### **🔮 Future Enhancements**
- **Multireddits support** - Create and manage custom multireddits
- **Saved posts API** - Save and retrieve saved posts
- **Moderation tools** - Moderation actions and queue management
- **Flair management** - Create and manage user and post flair
- **Wiki integration** - Read and edit subreddit wikis
- **Live threads** - Real-time thread updates and participation
- **Advanced analytics** - Usage analytics and engagement insights
- **Bulk operations** - Mass voting, commenting, and subscription management

## 📊 **Statistics & Monitoring**

### **Available Statistics Endpoints**
- `/stats/rate-limits` - Rate limiting statistics and current status
- `/stats/cache` - Response caching statistics and hit ratios
- `/stats/size-limits` - Response size limiting statistics
- `/stats/oauth` - OAuth token usage and refresh statistics
- `/health` - Service health check and diagnostics

### **Performance Metrics**
- Request throughput and latency
- Cache hit ratios and performance
- OAuth token refresh rates
- Error rates and categorization
- Reddit API response times

**Current Status**: The Reddit implementation represents a production-ready MCP server with enterprise-grade features, comprehensive Reddit API coverage, and advanced performance optimization that exceeds basic MCP requirements.