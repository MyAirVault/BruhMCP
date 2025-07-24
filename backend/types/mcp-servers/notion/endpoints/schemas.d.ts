export namespace searchPagesSchema {
    let query: z.ZodString;
    let page_size: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    let start_cursor: z.ZodOptional<z.ZodString>;
    let sort: z.ZodOptional<z.ZodObject<{
        direction: z.ZodOptional<z.ZodEnum<["ascending", "descending"]>>;
        timestamp: z.ZodOptional<z.ZodEnum<["created_time", "last_edited_time"]>>;
    }, "strip", z.ZodTypeAny, {
        timestamp?: "created_time" | "last_edited_time" | undefined;
        direction?: "ascending" | "descending" | undefined;
    }, {
        timestamp?: "created_time" | "last_edited_time" | undefined;
        direction?: "ascending" | "descending" | undefined;
    }>>;
    let filter: z.ZodOptional<z.ZodObject<{
        value: z.ZodOptional<z.ZodEnum<["page", "database"]>>;
        property: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value?: "database" | "page" | undefined;
        property?: string | undefined;
    }, {
        value?: "database" | "page" | undefined;
        property?: string | undefined;
    }>>;
}
export namespace getPageSchema {
    let page_id: z.ZodString;
}
/**
 * Schema for get page children tool
 */
export const getPageChildrenSchema: z.ZodObject<{
    page_id: z.ZodString;
    start_cursor: z.ZodOptional<z.ZodString>;
    page_size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page_id: string;
    start_cursor?: string | undefined;
    page_size?: number | undefined;
}, {
    page_id: string;
    start_cursor?: string | undefined;
    page_size?: number | undefined;
}>;
/**
 * Schema for create page tool
 */
export const createPageSchema: z.ZodObject<{
    parent: z.ZodUnion<[z.ZodObject<{
        database_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        database_id: string;
    }, {
        database_id: string;
    }>, z.ZodObject<{
        page_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        page_id: string;
    }, {
        page_id: string;
    }>]>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    children: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    parent: {
        database_id: string;
    } | {
        page_id: string;
    };
    properties?: Record<string, unknown> | undefined;
    children?: unknown[] | undefined;
}, {
    parent: {
        database_id: string;
    } | {
        page_id: string;
    };
    properties?: Record<string, unknown> | undefined;
    children?: unknown[] | undefined;
}>;
/**
 * Schema for update page tool
 */
export const updatePageSchema: z.ZodObject<{
    page_id: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    archived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    page_id: string;
    properties?: Record<string, unknown> | undefined;
    archived?: boolean | undefined;
}, {
    page_id: string;
    properties?: Record<string, unknown> | undefined;
    archived?: boolean | undefined;
}>;
/**
 * Schema for get database tool
 */
export const getDatabaseSchema: z.ZodObject<{
    database_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    database_id: string;
}, {
    database_id: string;
}>;
/**
 * Schema for query database tool
 */
export const queryDatabaseSchema: z.ZodObject<{
    database_id: z.ZodString;
    filter: z.ZodOptional<z.ZodUnknown>;
    sorts: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    start_cursor: z.ZodOptional<z.ZodString>;
    page_size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    database_id: string;
    filter?: unknown;
    start_cursor?: string | undefined;
    page_size?: number | undefined;
    sorts?: unknown[] | undefined;
}, {
    database_id: string;
    filter?: unknown;
    start_cursor?: string | undefined;
    page_size?: number | undefined;
    sorts?: unknown[] | undefined;
}>;
/**
 * Schema for create database tool
 */
export const createDatabaseSchema: z.ZodObject<{
    parent: z.ZodObject<{
        page_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        page_id: string;
    }, {
        page_id: string;
    }>;
    title: z.ZodArray<z.ZodUnknown, "many">;
    properties: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    title: unknown[];
    properties: Record<string, unknown>;
    parent: {
        page_id: string;
    };
}, {
    title: unknown[];
    properties: Record<string, unknown>;
    parent: {
        page_id: string;
    };
}>;
/**
 * Schema for update database tool
 */
export const updateDatabaseSchema: z.ZodObject<{
    database_id: z.ZodString;
    title: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    database_id: string;
    title?: unknown[] | undefined;
    properties?: Record<string, unknown> | undefined;
}, {
    database_id: string;
    title?: unknown[] | undefined;
    properties?: Record<string, unknown> | undefined;
}>;
/**
 * Schema for append block children tool
 */
export const appendBlockChildrenSchema: z.ZodObject<{
    page_id: z.ZodString;
    children: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    children: unknown[];
    page_id: string;
}, {
    children: unknown[];
    page_id: string;
}>;
/**
 * Schema for get user tool
 */
export const getUserSchema: z.ZodObject<{
    user_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id: string;
}, {
    user_id: string;
}>;
/**
 * Schema for list users tool
 */
export const listUsersSchema: z.ZodObject<{
    start_cursor: z.ZodOptional<z.ZodString>;
    page_size: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    start_cursor?: string | undefined;
    page_size?: number | undefined;
}, {
    start_cursor?: string | undefined;
    page_size?: number | undefined;
}>;
import { z } from 'zod';
//# sourceMappingURL=schemas.d.ts.map