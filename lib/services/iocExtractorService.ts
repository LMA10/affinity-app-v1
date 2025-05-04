import { IOC_REGEX_PATTERNS } from "../utils/ioc/regexPatterns";
import { isValidIPv4, isValidIPv6, isValidDomain, isLikelyBase64 } from "../utils/ioc/validators";
import { enrichIOC } from "./iocEnrichmentService";

const DOMAIN_WHITELIST = ["gmail.com", "microsoft.com", "google.com"];
const PRIVATE_IP_RANGES = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
];

function isPrivateIPv4(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((re) => re.test(ip));
}

function deobfuscateIOC(ioc: string): string {
  return ioc
    .replace(/hxxps?:/gi, m => m.replace('hxxp', 'http'))
    .replace(/\[\.]/g, '.')
    .replace(/\(\.\)/g, '.')
    .replace(/\{\.}/g, '.')
    .replace(/\[at\]/gi, '@')
    .replace(/\[\:\/\]/g, '://')
    .replace(/[\[\]\(\)\{\}]/g, '');
}

// Mock GeoIP enrichment
async function geoipLookup(ip: string) {
  // In production, call a real GeoIP API
  return { ip, country: "US", city: "MockCity" };
}

export async function extractIOCs(text: string): Promise<{
  iocResults: Record<string, string[]>;
  enriched: Record<string, any>;
}> {
  const results: Record<string, string[]> = {};
  for (const [iocType] of Object.entries(IOC_REGEX_PATTERNS)) {
    results[iocType] = [];
  }
  for (const [iocType, regex] of Object.entries(IOC_REGEX_PATTERNS)) {
    if (regex instanceof RegExp && regex.global) regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      let value = deobfuscateIOC(match[0]);
      // Validation and noise reduction
      if (iocType === "ipv4") {
        if (!isValidIPv4(value)) continue;
      }
      if (iocType === "ipv6" && !isValidIPv6(value)) continue;
      if ((iocType === "domain" || iocType === "fqdn")) {
        if (!isValidDomain(value) || DOMAIN_WHITELIST.includes(value.toLowerCase())) continue;
      }
      if (iocType === "base64" && !isLikelyBase64(value)) continue;
      results[iocType].push(value);
    }
  }
  // Only return IOC types with at least one result
  const iocResults = Object.fromEntries(
    Object.entries(results)
      .filter(([_, v]) => v.length > 0)
      .map(([k, v]) => [k, v])
  );
  // Enrichment for supported types
  const enriched: Record<string, any> = {};
  for (const [type, values] of Object.entries(iocResults)) {
    if (["ipv4", "domain", "md5", "sha1", "sha256"].includes(type)) {
      for (const value of Array.from(new Set(values))) {
        let iocType: any = type === "ipv4" ? "ip" : type === "domain" ? "domain" : "hash";
        enriched[value] = await enrichIOC(value, iocType);
      }
    }
  }
  return { iocResults, enriched };
}
