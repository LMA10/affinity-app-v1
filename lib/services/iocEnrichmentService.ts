import { IOCType, providerRegistry, registerProvider } from './iocEnrichmentProviders';
import { ipinfoProvider } from './providers/ipinfoProvider';
import { virustotalIPProvider, virustotalDomainProvider, virustotalHashProvider } from './providers/virustotalProvider';

// Register providers
registerProvider(ipinfoProvider);
registerProvider(virustotalIPProvider);
registerProvider(virustotalDomainProvider);
registerProvider(virustotalHashProvider);

export async function enrichIOC(ioc: string, type: IOCType): Promise<any> {
  const providers = providerRegistry.filter(p => p.type === type);
  const results = await Promise.all(providers.map(p => p.enrich(ioc)));
  // Merge results by provider name
  return results.reduce((acc, cur) => {
    acc[cur.provider] = cur;
    return acc;
  }, {} as Record<string, any>);
} 