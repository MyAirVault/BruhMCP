export const createMCPSchema: z.ZodObject<{
    mcp_type: z.ZodString;
    custom_name: z.ZodString;
    expiration_option: z.ZodEnum<["never", "1h", "6h", "1day", "30days"]>;
    credentials: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    mcp_type: string;
    credentials: Record<string, string>;
    custom_name: string;
    expiration_option: "never" | "1h" | "6h" | "1day" | "30days";
    config?: Record<string, any> | undefined;
}, {
    mcp_type: string;
    credentials: Record<string, string>;
    custom_name: string;
    expiration_option: "never" | "1h" | "6h" | "1day" | "30days";
    config?: Record<string, any> | undefined;
}>;
export const updateMCPSchema: z.ZodObject<{
    custom_name: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    credentials?: Record<string, string> | undefined;
    custom_name?: string | undefined;
    config?: Record<string, any> | undefined;
}, {
    credentials?: Record<string, string> | undefined;
    custom_name?: string | undefined;
    config?: Record<string, any> | undefined;
}>;
export const toggleMCPSchema: z.ZodObject<{
    is_active: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    is_active: boolean;
}, {
    is_active: boolean;
}>;
export const renewMCPSchema: z.ZodObject<{
    expiration_option: z.ZodEnum<["never", "1h", "6h", "1day", "30days"]>;
}, "strip", z.ZodTypeAny, {
    expiration_option: "never" | "1h" | "6h" | "1day" | "30days";
}, {
    expiration_option: "never" | "1h" | "6h" | "1day" | "30days";
}>;
import { z } from 'zod';
//# sourceMappingURL=schemas.d.ts.map