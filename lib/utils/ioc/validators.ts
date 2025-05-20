export function isValidIPv4(ip: string): boolean {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  return octets.every(o => /^\d+$/.test(o) && Number(o) >= 0 && Number(o) <= 255);
}

export function isValidIPv6(ip: string): boolean {
  // Use a simple check; for production, use a library like 'ipaddr.js'
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':') && ip.length >= 2;
}

export function isValidDomain(domain: string): boolean {
  // Use a TLD list for production, here is a simple check
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain) && !domain.endsWith('.') && domain.length > 3;
}

export function isLikelyBase64(str: string): boolean {
  // Only match if length is a multiple of 4 and not a common word
  if (str.length < 8 || str.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/=]+$/.test(str);
} 