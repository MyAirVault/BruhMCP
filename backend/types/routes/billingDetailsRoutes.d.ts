export default router;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
export type AuthenticatedRequest = Request & {
    user: {
        id: number;
    };
};
declare const router: import("express-serve-static-core").Router;
//# sourceMappingURL=billingDetailsRoutes.d.ts.map