export function validateToken(token: any): string;
export function validateMessageContent(content: any): {
    content: string;
    tts: boolean;
    embeds: {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline: boolean;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }[];
    allowedMentions: {
        repliedUser: boolean;
        users?: string[] | undefined;
        roles?: string[] | undefined;
        parse?: ("users" | "roles" | "everyone")[] | undefined;
    };
};
export function validateEmbed(embed: any): {
    timestamp?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
    image?: {
        url: string;
    } | undefined;
    fields?: {
        name: string;
        value: string;
        inline: boolean;
    }[] | undefined;
    title?: string | undefined;
    author?: {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    } | undefined;
    color?: number | undefined;
    footer?: {
        text: string;
        iconUrl?: string | undefined;
    } | undefined;
    thumbnail?: {
        url: string;
    } | undefined;
};
export function validateDiscordId(id: any, type?: string): string;
export const discordColorSchema: z.ZodOptional<z.ZodNumber>;
export const discordSnowflakeSchema: z.ZodString;
export const discordUrlSchema: z.ZodOptional<z.ZodString>;
export const embedFieldSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
    inline: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value: string;
    inline: boolean;
}, {
    name: string;
    value: string;
    inline?: boolean | undefined;
}>;
export const embedFooterSchema: z.ZodObject<{
    text: z.ZodString;
    iconUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    iconUrl?: string | undefined;
}, {
    text: string;
    iconUrl?: string | undefined;
}>;
export const embedImageSchema: z.ZodObject<{
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>;
export const embedThumbnailSchema: z.ZodObject<{
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>;
export const embedAuthorSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    iconUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    url?: string | undefined;
    iconUrl?: string | undefined;
}, {
    name: string;
    url?: string | undefined;
    iconUrl?: string | undefined;
}>;
export const embedSchema: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodNumber>;
    footer: z.ZodOptional<z.ZodObject<{
        text: z.ZodString;
        iconUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        iconUrl?: string | undefined;
    }, {
        text: string;
        iconUrl?: string | undefined;
    }>>;
    image: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>>;
    thumbnail: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>>;
    author: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        iconUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    }, {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    }>>;
    fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        inline: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value: string;
        inline: boolean;
    }, {
        name: string;
        value: string;
        inline?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    timestamp?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
    image?: {
        url: string;
    } | undefined;
    fields?: {
        name: string;
        value: string;
        inline: boolean;
    }[] | undefined;
    title?: string | undefined;
    author?: {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    } | undefined;
    color?: number | undefined;
    footer?: {
        text: string;
        iconUrl?: string | undefined;
    } | undefined;
    thumbnail?: {
        url: string;
    } | undefined;
}, {
    timestamp?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
    image?: {
        url: string;
    } | undefined;
    fields?: {
        name: string;
        value: string;
        inline?: boolean | undefined;
    }[] | undefined;
    title?: string | undefined;
    author?: {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    } | undefined;
    color?: number | undefined;
    footer?: {
        text: string;
        iconUrl?: string | undefined;
    } | undefined;
    thumbnail?: {
        url: string;
    } | undefined;
}>, {
    timestamp?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
    image?: {
        url: string;
    } | undefined;
    fields?: {
        name: string;
        value: string;
        inline: boolean;
    }[] | undefined;
    title?: string | undefined;
    author?: {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    } | undefined;
    color?: number | undefined;
    footer?: {
        text: string;
        iconUrl?: string | undefined;
    } | undefined;
    thumbnail?: {
        url: string;
    } | undefined;
}, {
    timestamp?: string | undefined;
    description?: string | undefined;
    url?: string | undefined;
    image?: {
        url: string;
    } | undefined;
    fields?: {
        name: string;
        value: string;
        inline?: boolean | undefined;
    }[] | undefined;
    title?: string | undefined;
    author?: {
        name: string;
        url?: string | undefined;
        iconUrl?: string | undefined;
    } | undefined;
    color?: number | undefined;
    footer?: {
        text: string;
        iconUrl?: string | undefined;
    } | undefined;
    thumbnail?: {
        url: string;
    } | undefined;
}>;
export const allowedMentionsSchema: z.ZodObject<{
    parse: z.ZodOptional<z.ZodArray<z.ZodEnum<["roles", "users", "everyone"]>, "many">>;
    roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    users: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    repliedUser: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    repliedUser: boolean;
    users?: string[] | undefined;
    roles?: string[] | undefined;
    parse?: ("users" | "roles" | "everyone")[] | undefined;
}, {
    users?: string[] | undefined;
    roles?: string[] | undefined;
    parse?: ("users" | "roles" | "everyone")[] | undefined;
    repliedUser?: boolean | undefined;
}>;
export const messageContentSchema: z.ZodObject<{
    content: z.ZodString;
    embeds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEffects<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodNumber>;
        footer: z.ZodOptional<z.ZodObject<{
            text: z.ZodString;
            iconUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            iconUrl?: string | undefined;
        }, {
            text: string;
            iconUrl?: string | undefined;
        }>>;
        image: z.ZodOptional<z.ZodObject<{
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
        }, {
            url: string;
        }>>;
        thumbnail: z.ZodOptional<z.ZodObject<{
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
        }, {
            url: string;
        }>>;
        author: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            iconUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        }, {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        }>>;
        fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            inline: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            value: string;
            inline: boolean;
        }, {
            name: string;
            value: string;
            inline?: boolean | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline: boolean;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }, {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline?: boolean | undefined;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }>, {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline: boolean;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }, {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline?: boolean | undefined;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }>, "many">>>;
    tts: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    allowedMentions: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        parse: z.ZodOptional<z.ZodArray<z.ZodEnum<["roles", "users", "everyone"]>, "many">>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        users: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        repliedUser: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        repliedUser: boolean;
        users?: string[] | undefined;
        roles?: string[] | undefined;
        parse?: ("users" | "roles" | "everyone")[] | undefined;
    }, {
        users?: string[] | undefined;
        roles?: string[] | undefined;
        parse?: ("users" | "roles" | "everyone")[] | undefined;
        repliedUser?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    tts: boolean;
    embeds: {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline: boolean;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }[];
    allowedMentions: {
        repliedUser: boolean;
        users?: string[] | undefined;
        roles?: string[] | undefined;
        parse?: ("users" | "roles" | "everyone")[] | undefined;
    };
}, {
    content: string;
    tts?: boolean | undefined;
    embeds?: {
        timestamp?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        image?: {
            url: string;
        } | undefined;
        fields?: {
            name: string;
            value: string;
            inline?: boolean | undefined;
        }[] | undefined;
        title?: string | undefined;
        author?: {
            name: string;
            url?: string | undefined;
            iconUrl?: string | undefined;
        } | undefined;
        color?: number | undefined;
        footer?: {
            text: string;
            iconUrl?: string | undefined;
        } | undefined;
        thumbnail?: {
            url: string;
        } | undefined;
    }[] | undefined;
    allowedMentions?: {
        users?: string[] | undefined;
        roles?: string[] | undefined;
        parse?: ("users" | "roles" | "everyone")[] | undefined;
        repliedUser?: boolean | undefined;
    } | undefined;
}>;
export const bearerTokenSchema: z.ZodEffects<z.ZodString, string, string>;
export const channelIdSchema: z.ZodString;
export const guildIdSchema: z.ZodString;
export const messageIdSchema: z.ZodString;
export const userIdSchema: z.ZodUnion<[z.ZodString, z.ZodLiteral<"@me">]>;
export const inviteCodeSchema: z.ZodString;
export const messageFetchParamsSchema: z.ZodEffects<z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    before: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    after: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    around: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    before: string;
    after: string;
    around: string;
}, {
    limit?: number | undefined;
    before?: string | undefined;
    after?: string | undefined;
    around?: string | undefined;
}>, {
    limit: number;
    before: string;
    after: string;
    around: string;
}, {
    limit?: number | undefined;
    before?: string | undefined;
    after?: string | undefined;
    around?: string | undefined;
}>;
export const emojiSchema: z.ZodEffects<z.ZodString, string, string>;
export const inviteCreateParamsSchema: z.ZodObject<{
    maxAge: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxUses: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    temporary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    unique: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    maxAge: number;
    maxUses: number;
    temporary: boolean;
    unique: boolean;
}, {
    maxAge?: number | undefined;
    maxUses?: number | undefined;
    temporary?: boolean | undefined;
    unique?: boolean | undefined;
}>;
export const rateLimitSchema: z.ZodObject<{
    limit: z.ZodNumber;
    remaining: z.ZodNumber;
    reset: z.ZodNumber;
    resetAfter: z.ZodNumber;
    bucket: z.ZodOptional<z.ZodString>;
    global: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    global: boolean;
    remaining: number;
    reset: number;
    resetAfter: number;
    bucket?: string | undefined;
}, {
    limit: number;
    remaining: number;
    reset: number;
    resetAfter: number;
    global?: boolean | undefined;
    bucket?: string | undefined;
}>;
export const apiResponseSchema: z.ZodObject<{
    data: z.ZodAny;
    rateLimit: z.ZodOptional<z.ZodObject<{
        limit: z.ZodNumber;
        remaining: z.ZodNumber;
        reset: z.ZodNumber;
        resetAfter: z.ZodNumber;
        bucket: z.ZodOptional<z.ZodString>;
        global: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        global: boolean;
        remaining: number;
        reset: number;
        resetAfter: number;
        bucket?: string | undefined;
    }, {
        limit: number;
        remaining: number;
        reset: number;
        resetAfter: number;
        global?: boolean | undefined;
        bucket?: string | undefined;
    }>>;
    timestamp: z.ZodString;
    requestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    data?: any;
    requestId?: string | undefined;
    rateLimit?: {
        limit: number;
        global: boolean;
        remaining: number;
        reset: number;
        resetAfter: number;
        bucket?: string | undefined;
    } | undefined;
}, {
    timestamp: string;
    data?: any;
    requestId?: string | undefined;
    rateLimit?: {
        limit: number;
        remaining: number;
        reset: number;
        resetAfter: number;
        global?: boolean | undefined;
        bucket?: string | undefined;
    } | undefined;
}>;
import { z } from 'zod';
//# sourceMappingURL=discord-schemas.d.ts.map