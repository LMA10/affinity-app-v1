interface Config {
  urlAPI: string;
  environment: 'development' | 'production';
  domain: string;
}

const getConfig = (): Config => {
  const hostname = typeof window !== 'undefined'
    ? window.location.hostname
    : process.env.NEXT_PUBLIC_HOSTNAME || 'localhost';

  // Local dev
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      urlAPI: "https://api.dev.soli.solidaritylabs.io/api/v1",
      environment: 'development',
      domain: hostname
    };
  }

  // Split hostname into parts
  const parts = hostname.split('.');
  // e.g., dev.soli.solidaritylabs.io → ['dev', 'soli', 'solidaritylabs', 'io']
  // e.g., soli.solidaritylabs.io → ['soli', 'solidaritylabs', 'io']
  // e.g., solidaritylabs.io → ['solidaritylabs', 'io']

  let apiUrl;
  if (parts.length > 3) {
    // Has environment and project: dev.soli.solidaritylabs.io
    const [env, project, ...rest] = parts;
    const baseDomain = rest.join('.');
    apiUrl = `https://api.${env}.${project}.${baseDomain}/api/v1`;
  } else if (parts.length === 3) {
    // Has project: soli.solidaritylabs.io
    const [project, ...rest] = parts;
    const baseDomain = rest.join('.');
    apiUrl = `https://api.${project}.${baseDomain}/api/v1`;
  } else {
    // Default fallback
    apiUrl = `https://api.${hostname}/api/v1`;
  }

  return {
    urlAPI: apiUrl,
    environment: 'production',
    domain: hostname
  };
};

const config = getConfig();

export const NEXT_PUBLIC_API_URL = config.urlAPI;
export const ENVIRONMENT = config.environment;
export const CURRENT_DOMAIN = config.domain;

export default config;
