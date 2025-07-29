export = app;
declare const app: import("express-serve-static-core").Express;
declare namespace app {
    export { AuthenticatedRequest };
}
type AuthenticatedRequest = import('./middleware/credentialAuth.js').AuthenticatedRequest;
//# sourceMappingURL=index.d.ts.map