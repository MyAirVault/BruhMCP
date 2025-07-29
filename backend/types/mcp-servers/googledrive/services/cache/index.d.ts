import { initializeCredentialCache } from "./cacheCore";
import { getCachedCredential } from "./cacheCore";
import { setCachedCredential } from "./cacheCore";
import { removeCachedCredential } from "./cacheCore";
import { getCachedInstanceIds } from "./cacheCore";
import { isInstanceCached } from "./cacheCore";
import { clearCredentialCache } from "./cacheCore";
import { peekCachedCredential } from "./cacheCore";
import { updateCachedCredentialMetadata } from "./cacheMetadata";
import { incrementRefreshAttempts } from "./cacheMetadata";
import { resetRefreshAttempts } from "./cacheMetadata";
import { getCacheStatistics } from "./cacheStatistics";
import { cleanupInvalidCacheEntries } from "./cacheMaintenance";
import { startBackgroundCacheSync } from "./cacheSync";
export { initializeCredentialCache, getCachedCredential, setCachedCredential, removeCachedCredential, getCachedInstanceIds, isInstanceCached, clearCredentialCache, peekCachedCredential, updateCachedCredentialMetadata, incrementRefreshAttempts, resetRefreshAttempts, getCacheStatistics, cleanupInvalidCacheEntries, startBackgroundCacheSync };
//# sourceMappingURL=index.d.ts.map