/**
 * Get tool definition by name
 * @param {string} toolName - Name of the tool
 * @returns {Object|null} Tool definition or null if not found
 */
export function getToolDefinition(toolName: string): Object | null;
/**
 * Get all tool names
 * @returns {string[]} Array of tool names
 */
export function getAllToolNames(): string[];
/**
 * Validate tool exists
 * @param {string} toolName - Name of the tool
 * @returns {boolean} True if tool exists
 */
export function isValidTool(toolName: string): boolean;
/**
 * Get tools by category
 * @param {string} category - Category name
 * @returns {Object[]} Array of tools in category
 */
export function getToolsByCategory(category: string): Object[];
/**
 * Get tool statistics
 * @returns {Object} Tool statistics
 */
export function getToolStatistics(): Object;
/**
 * Get available Discord tools for MCP protocol
 * @returns {Object} Tools data with MCP-compliant schemas
 */
export function getTools(): Object;
/**
 * Discord MCP Tools Definition
 * Defines available tools for Discord MCP service
 * Based on Gmail MCP service architecture
 */
/**
 * Discord MCP Tools Configuration
 * Each tool includes name, description, and parameter schema
 */
export const DISCORD_TOOLS: ({
    name: string;
    description: string;
    parameters: {
        guildId?: undefined;
        userId?: undefined;
        channelId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {};
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        guildId: {
            type: string;
            description: string;
            required: boolean;
        };
        userId?: undefined;
        channelId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            guildId: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        guildId: {
            type: string;
            description: string;
            required: boolean;
        };
        userId: {
            type: string;
            description: string;
            required: boolean;
            default: string;
        };
        channelId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            guildId: string;
            userId: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        guildId?: undefined;
        userId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            channelId: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        limit: {
            type: string;
            description: string;
            required: boolean;
            default: number;
        };
        before: {
            type: string;
            description: string;
            required: boolean;
        };
        after: {
            type: string;
            description: string;
            required: boolean;
        };
        around: {
            type: string;
            description: string;
            required: boolean;
        };
        guildId?: undefined;
        userId?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            channelId: string;
            limit: number;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        content: {
            type: string;
            description: string;
            required: boolean;
        };
        embeds: {
            type: string;
            description: string;
            required: boolean;
            default: never[];
        };
        tts: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
        allowedMentions: {
            type: string;
            description: string;
            required: boolean;
            default: {};
        };
        guildId?: undefined;
        userId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: ({
        description: string;
        parameters: {
            channelId: string;
            content: string;
            embeds?: undefined;
        };
    } | {
        description: string;
        parameters: {
            channelId: string;
            content: string;
            embeds: {
                title: string;
                description: string;
                color: number;
            }[];
        };
    })[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        messageId: {
            type: string;
            description: string;
            required: boolean;
        };
        content: {
            type: string;
            description: string;
            required: boolean;
        };
        embeds: {
            type: string;
            description: string;
            required: boolean;
            default: never[];
        };
        guildId?: undefined;
        userId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            channelId: string;
            messageId: string;
            content: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        messageId: {
            type: string;
            description: string;
            required: boolean;
        };
        guildId?: undefined;
        userId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            channelId: string;
            messageId: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        messageId: {
            type: string;
            description: string;
            required: boolean;
        };
        emoji: {
            type: string;
            description: string;
            required: boolean;
        };
        guildId?: undefined;
        userId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        inviteCode?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            channelId: string;
            messageId: string;
            emoji: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        inviteCode: {
            type: string;
            description: string;
            required: boolean;
        };
        guildId?: undefined;
        userId?: undefined;
        channelId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        maxAge?: undefined;
        maxUses?: undefined;
        temporary?: undefined;
        unique?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            inviteCode: string;
        };
    }[];
} | {
    name: string;
    description: string;
    parameters: {
        channelId: {
            type: string;
            description: string;
            required: boolean;
        };
        maxAge: {
            type: string;
            description: string;
            required: boolean;
            default: number;
        };
        maxUses: {
            type: string;
            description: string;
            required: boolean;
            default: number;
        };
        temporary: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
        unique: {
            type: string;
            description: string;
            required: boolean;
            default: boolean;
        };
        guildId?: undefined;
        userId?: undefined;
        limit?: undefined;
        before?: undefined;
        after?: undefined;
        around?: undefined;
        content?: undefined;
        embeds?: undefined;
        tts?: undefined;
        allowedMentions?: undefined;
        messageId?: undefined;
        emoji?: undefined;
        inviteCode?: undefined;
    };
    examples: {
        description: string;
        parameters: {
            channelId: string;
            maxAge: number;
            maxUses: number;
        };
    }[];
})[];
//# sourceMappingURL=tools.d.ts.map