interface Config {
  urlAPI: string;
  environment: 'development' | 'production';
  domain: string;
}

const getConfig = (): Config => {
  // Get the current hostname
  const hostname = typeof window !== 'undefined' 
    ? window.location.hostname 
    : process.env.NEXT_PUBLIC_HOSTNAME || 'localhost';

  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return {
      urlAPI: "https://api.dev.soli.solidaritylabs.io/api/v1",
      environment: 'development',
      domain: hostname
    };
  }

  // Production environment - dynamically construct API URL based on current domain
  // Extract the subdomain from the hostname (e.g., 'poincenot' from 'poincenot.solidaritylabs.io')
  const subdomain = hostname.split('.')[0];
  const apiUrl = `https://api.${subdomain}.solidaritylabs.io/api/v1`;
  
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
