// Fetch the top 1M domains from the public CSV
export async function fetchTop1mDomains(): Promise<string[]> {
  const res = await fetch('/top-1m.csv');
  const text = await res.text();
  return text.split('\n').map(line => line.split(',')[1]?.trim()).filter(Boolean);
}

// Resolve a single domain to its A record IPs using Google DNS
export async function resolveDomainToIPs(domain: string): Promise<string[]> {
  const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data);
}

// Batch resolve domains to IPs with concurrency limit
export async function resolveDomainsToIPs(domains: string[], concurrency = 10): Promise<Set<string>> {
  const ips = new Set<string>();
  let i = 0;
  async function worker() {
    while (i < domains.length) {
      const idx = i++;
      const domain = domains[idx];
      try {
        const resolved = await resolveDomainToIPs(domain);
        resolved.forEach(ip => ips.add(ip));
      } catch {}
    }
  }
  await Promise.all(Array(concurrency).fill(0).map(worker));
  return ips;
}

// Batch resolve domains to IPs
export async function resolveDomainsToIPsMap(domains: string[]): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  for (const domain of domains) {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await res.json();
      if (!data.Answer) {
        results[domain] = [];
      } else {
        results[domain] = data.Answer.filter((a: any) => a.type === 1).map((a: any) => a.data);
      }
    } catch {
      results[domain] = [];
    }
  }
  return results;
}

// Cross-reference user IPs with whitelist/blacklist
export function crossReferenceIPs(userIPs: string[], whitelist: Set<string>, blacklist: Set<string>) {
  const whitelisted: string[] = [];
  const blacklisted: string[] = [];
  const unmatched: string[] = [];
  for (const ip of userIPs) {
    if (whitelist.has(ip)) whitelisted.push(ip);
    else if (blacklist.has(ip)) blacklisted.push(ip);
    else unmatched.push(ip);
  }
  return { whitelisted, blacklisted, unmatched };
}

// Cross-reference domains with whitelist
export function crossReferenceDomains(domains: string[], resolved: Record<string, string[]>, whitelist: Set<string>) {
  const whitelisted: string[] = [];
  const unmatched: string[] = [];
  for (const domain of domains) {
    const ips = resolved[domain] || [];
    if (ips.some(ip => whitelist.has(ip))) whitelisted.push(domain);
    else unmatched.push(domain);
  }
  return { whitelisted, unmatched, resolved };
}

// Resolve PTR (reverse DNS) for a list of IPv4 addresses
export async function resolveIPsToPTRs(ips: string[]): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};
  for (const ip of ips) {
    try {
      // Convert IPv4 to reverse DNS format
      const parts = ip.split('.');
      if (parts.length !== 4) {
        results[ip] = [];
        continue;
      }
      const reverse = parts.reverse().join('.') + '.in-addr.arpa';
      const res = await fetch(`https://dns.google/resolve?name=${reverse}&type=PTR`);
      const data = await res.json();
      if (!data.Answer) {
        results[ip] = [];
      } else {
        results[ip] = data.Answer.filter((a: any) => a.type === 12).map((a: any) => a.data.replace(/\.$/, ''));
      }
    } catch {
      results[ip] = [];
    }
  }
  return results;
} 