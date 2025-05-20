import { IOCEnrichmentProvider } from '../iocEnrichmentProviders';

export const virustotalIPProvider: IOCEnrichmentProvider = {
  type: 'ip',
  name: 'VirusTotal',
  async enrich(ip: string) {
    // Mocked response
    return {
      provider: 'VirusTotal',
      ip,
      vt_malicious: 1,
      vt_harmless: 10,
      vt_suspicious: 0,
    };
  },
};

export const virustotalDomainProvider: IOCEnrichmentProvider = {
  type: 'domain',
  name: 'VirusTotal',
  async enrich(domain: string) {
    // Mocked response
    return {
      provider: 'VirusTotal',
      domain,
      vt_malicious: 0,
      vt_harmless: 15,
      vt_suspicious: 0,
    };
  },
};

export const virustotalHashProvider: IOCEnrichmentProvider = {
  type: 'hash',
  name: 'VirusTotal',
  async enrich(hash: string) {
    // Mocked response
    return {
      provider: 'VirusTotal',
      hash,
      vt_malicious: 2,
      vt_harmless: 8,
      vt_suspicious: 1,
    };
  },
}; 