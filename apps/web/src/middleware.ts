import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["pt"],
  defaultLocale: "pt",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(pt)/:path*"],
};
