export = router;
declare const router: import("express-serve-static-core").Router;
declare namespace router {
    export { Request, Response, NextFunction, AuthenticatedRequest };
}
type Request = import('express').Request;
type Response = import('express').Response;
type NextFunction = import('express').NextFunction;
type AuthenticatedRequest = Request & {
    user: {
        id: number;
    };
};
//# sourceMappingURL=billingDetailsRoutes.d.ts.map