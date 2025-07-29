export = router;
declare const router: import("express-serve-static-core").Router;
declare namespace router {
    export { Request, Response, NextFunction };
}
type Request = import('express').Request;
type Response = import('express').Response;
type NextFunction = import('express').NextFunction;
//# sourceMappingURL=mcpTypesRoutes.d.ts.map