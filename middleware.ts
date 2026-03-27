import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized (api, static files, admin)
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
