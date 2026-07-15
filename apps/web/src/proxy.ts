import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["pt", "en", "es"],
  defaultLocale: "pt",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(pt|en|es)/:path*"],
};
