export const IOC_REGEX_PATTERNS = {
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  ipv6: /([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}/g,
  domain: /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g,
  fqdn: /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g, // same as domain
  url: /https?:\/\/[\w\-\.!~*'();:@&=+$,/?#[\]]+/g,
  email: /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g,
  md5: /\b[a-fA-F0-9]{32}\b/g,
  sha1: /\b[a-fA-F0-9]{40}\b/g,
  sha256: /\b[a-fA-F0-9]{64}\b/g,
  windowsFilePath: /[a-zA-Z]:\\(?:[^\\\s/:*?"<>|]+\\)*[^\\\s/:*?"<>|]*/g,
  unixFilePath: /\/(?:[^\/\s]+\/?)*/g,
  windowsRegistryKey: /HKEY_[A-Z_]+(?:[^\s\/:*?"<>|]+)/g,
  userAgent: /User-Agent:\s?.+/g, // or extract full UA string from logs
  base64: /\b(?:[A-Za-z0-9+/]{4}){3,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?\b/g,
};
