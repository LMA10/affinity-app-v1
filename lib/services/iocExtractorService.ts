import { isValidIPv4, isValidIPv6, isValidDomain } from "../utils/ioc/validators";
import { enrichIOC } from "./iocEnrichmentService";

// Load config from public directory
export async function loadIOCConfig() {
  const res = await fetch('/ioc_config.json');
  return await res.json();
}

const DOMAIN_WHITELIST = ["gmail.com", "microsoft.com", "google.com"];

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

export async function extractIOCs(text: string, selectedTypes?: string[]): Promise<{
  iocResults: Record<string, string[]>;
  enriched: Record<string, any>;
}> {
  const config = await loadIOCConfig();
  const filteredConfig = selectedTypes && selectedTypes.length > 0
    ? config.filter((ioc: any) => selectedTypes.includes(ioc.key))
    : config;
  const results: Record<string, string[]> = {};
  for (const ioc of filteredConfig as any[]) {
    const iocAny: any = ioc;
    results[iocAny.key] = [];
    const regex = new RegExp(iocAny.regex, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      let value = deobfuscateIOC(match[0]);
      // Validation and noise reduction
      if (iocAny.key === "ipv4") {
        if (!isValidIPv4(value)) continue;
      }
      if (iocAny.key === "ipv6" && !isValidIPv6(value)) continue;
      if ((iocAny.key === "domain" || iocAny.key === "fqdn")) {
        if (!isValidDomain(value) || DOMAIN_WHITELIST.includes(value.toLowerCase())) continue;
      }
      results[iocAny.key].push(value);
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
