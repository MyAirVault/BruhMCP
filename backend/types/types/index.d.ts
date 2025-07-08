export type User = {
    id: number;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};
export type ApiResponse = {
    success: boolean;
    data?: any;
    error?: string | undefined;
    message?: string | undefined;
};
export type PaginationParams = {
    page: number;
    limit: number;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
};
