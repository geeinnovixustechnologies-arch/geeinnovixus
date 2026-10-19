import { revalidateTag, unstable_cache } from "next/cache";

const CONTENT_CACHE_SECONDS = 60;

/** Cache public database reads while keeping every admin read live. */
export function createPublicContentCache(key, tag, loader) {
  return unstable_cache(
    async (...args) => JSON.parse(JSON.stringify(await loader(...args))),
    [key],
    { revalidate: CONTENT_CACHE_SECONDS, tags: [tag] }
  );
}

/** Expire a public content cache after a successful admin mutation. */
export function invalidatePublicContent(tag) {
  revalidateTag(tag, { expire: 0 });
}
