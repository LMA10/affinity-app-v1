import { IOCEnrichmentProvider } from '../iocEnrichmentProviders';

export const ipinfoProvider: IOCEnrichmentProvider = {
  type: 'ip',
  name: 'IPinfo',
  async enrich(ip: string) {
    // Mocked response
    return {
      provider: 'IPinfo',
      ip,
      country: 'US',
      org: 'MockOrg',
      asn: 'AS12345',
    };
  },
}; 