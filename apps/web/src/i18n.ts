import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const finalLocale = locale || "pt";
  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default,
  };
});
