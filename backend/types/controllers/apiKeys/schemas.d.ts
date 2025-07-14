export const credentialValidationSchema: z.ZodObject<{
    mcp_type_id: z.ZodString;
    credentials: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    mcp_type_id: string;
}, {
    credentials: Record<string, string>;
    mcp_type_id: string;
}>;
export const storeAPIKeySchema: z.ZodObject<{
    mcp_type_id: z.ZodString;
    credentials: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    mcp_type_id: string;
}, {
    credentials: Record<string, string>;
    mcp_type_id: string;
}>;
import { z } from 'zod';
//# sourceMappingURL=schemas.d.ts.map