import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API, Next internals, files with an extension and the extension-less
  // apple-icon metadata route (otherwise it gets locale-rewritten and 404s).
  matcher: ["/((?!api|_next|_vercel|apple-icon|.*\\..*).*)"],
};
