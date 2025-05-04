export type IOCType = 'ip' | 'domain' | 'url' | 'hash' | 'email';

export interface IOCEnrichmentProvider {
  type: IOCType;
  name: string;
  enrich(ioc: string): Promise<any>;
}

export const providerRegistry: IOCEnrichmentProvider[] = [];

export function registerProvider(provider: IOCEnrichmentProvider) {
  providerRegistry.push(provider);
} 