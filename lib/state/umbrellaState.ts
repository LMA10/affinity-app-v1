import { useEffect, useState } from "react";
import { fetchTop1mDomains, resolveDomainsToIPs, resolveDomainsToIPsMap, resolveIPsToPTRs } from "@/lib/services/umbrellaService";

export function useUmbrellaState(limit = 1000) {
  const [whitelist, setWhitelist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Domain resolution state
  const [resolvedDomains, setResolvedDomains] = useState<Record<string, string[]>>({});
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainWhitelist, setDomainWhitelist] = useState<string[]>([]);
  const [domainUnmatched, setDomainUnmatched] = useState<string[]>([]);
  // PTR (reverse DNS) state
  const [resolvedPTRs, setResolvedPTRs] = useState<Record<string, string[]>>({});
  const [ptrLoading, setPtrLoading] = useState(false);
  const [ptrError, setPtrError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTop1mDomains()
      .then(domains => resolveDomainsToIPs(domains.slice(0, limit)))
      .then(setWhitelist)
      .catch(e => setError(e.message || 'Failed to load whitelist'))
      .finally(() => setLoading(false));
  }, [limit]);

  // New: resolve domains and cross-reference
  async function resolveAndCrossDomains(domains: string[], whitelist: Set<string>) {
    setDomainLoading(true);
    setDomainError(null);
    try {
      const resolved = await resolveDomainsToIPsMap(domains);
      setResolvedDomains(resolved);
      const whitelisted: string[] = [];
      const unmatched: string[] = [];
      for (const domain of domains) {
        const ips = resolved[domain] || [];
        if (ips.some(ip => whitelist.has(ip))) whitelisted.push(domain);
        else unmatched.push(domain);
      }
      setDomainWhitelist(whitelisted);
      setDomainUnmatched(unmatched);
    } catch (e: any) {
      setDomainError(e.message || 'Failed to resolve domains');
    } finally {
      setDomainLoading(false);
    }
  }

  // New: resolve PTRs for IPv4s
  async function resolvePTRs(ips: string[]) {
    setPtrLoading(true);
    setPtrError(null);
    try {
      const resolved = await resolveIPsToPTRs(ips);
      setResolvedPTRs(resolved);
    } catch (e: any) {
      setPtrError(e.message || 'Failed to resolve PTRs');
    } finally {
      setPtrLoading(false);
    }
  }

  return { whitelist, loading, error, resolvedDomains, domainLoading, domainError, domainWhitelist, domainUnmatched, resolveAndCrossDomains, resolvedPTRs, ptrLoading, ptrError, resolvePTRs };
} 