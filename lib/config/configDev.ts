interface Config {
  urlAPI: string
}

const config: Config = {
  urlAPI: "https://api.dev.soli.solidaritylabs.io/api/v1",
}

export const NEXT_PUBLIC_API_URL = config.urlAPI

export default config
