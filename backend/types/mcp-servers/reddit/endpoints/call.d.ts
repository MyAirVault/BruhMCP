/**
 * Execute a Reddit tool call
 * @param {string} toolName - Name of the tool to execute
 * @param {import('../api/redditApi.js').GetSubredditInfoArgs | import('../api/redditApi.js').GetSubredditPostsArgs | import('../api/redditApi.js').GetPostByIdArgs | import('../api/redditApi.js').GetPostCommentsArgs | import('../api/redditApi.js').SubmitPostArgs | import('../api/redditApi.js').SubmitCommentArgs | import('../api/redditApi.js').VoteArgs | import('../api/redditApi.js').GetUserInfoArgs | import('../api/redditApi.js').GetUserPostsArgs | import('../api/redditApi.js').GetUserCommentsArgs | import('../api/redditApi.js').GetInboxMessagesArgs | import('../api/redditApi.js').SendMessageArgs | import('../api/redditApi.js').MarkAsReadArgs | import('../api/redditApi.js').SearchSubredditsArgs | import('../api/redditApi.js').SearchPostsArgs | import('../api/redditApi.js').GetSubscriptionsArgs | import('../api/redditApi.js').SubscribeArgs} args - Tool arguments
 * @param {string} bearerToken - OAuth Bearer token for Reddit API
 * @returns {Promise<{content: Array<{type: string, text: string}>}>} Tool execution result
 */
export function executeToolCall(toolName: string, args: import("../api/redditApi.js").GetSubredditInfoArgs | import("../api/redditApi.js").GetSubredditPostsArgs | import("../api/redditApi.js").GetPostByIdArgs | import("../api/redditApi.js").GetPostCommentsArgs | import("../api/redditApi.js").SubmitPostArgs | import("../api/redditApi.js").SubmitCommentArgs | import("../api/redditApi.js").VoteArgs | import("../api/redditApi.js").GetUserInfoArgs | import("../api/redditApi.js").GetUserPostsArgs | import("../api/redditApi.js").GetUserCommentsArgs | import("../api/redditApi.js").GetInboxMessagesArgs | import("../api/redditApi.js").SendMessageArgs | import("../api/redditApi.js").MarkAsReadArgs | import("../api/redditApi.js").SearchSubredditsArgs | import("../api/redditApi.js").SearchPostsArgs | import("../api/redditApi.js").GetSubscriptionsArgs | import("../api/redditApi.js").SubscribeArgs, bearerToken: string): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
//# sourceMappingURL=call.d.ts.map