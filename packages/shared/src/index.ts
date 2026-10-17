export * from "./fields";
export * from "./sections";
export * from "./models";

/** URL path of a page slug. */
export const pagePath = (slug: string) => (slug === "home" ? "/" : `/${slug}/`);
