import { useState } from "react";
import { extractIOCs, loadIOCConfig } from "../../services/iocExtractorService";

const LOCAL_STORAGE_KEY = 'ioc_config';

export function useIncidentResponseState() {
  const [rawText, setRawText] = useState("");
  const [iocResults, setIocResults] = useState<Record<string, string[]>>({});
  const [enriched, setEnriched] = useState<Record<string, any[]>>({});
  const [iocConfig, setIocConfig] = useState<any[]>([]);

  // Load config on demand
  const loadConfig = async () => {
    let config = [];
    const local = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    if (local) {
      config = JSON.parse(local);
    } else {
      config = await loadIOCConfig();
      if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    }
    setIocConfig(config);
    return config;
  };

  // Add new IOC type to config and persist to localStorage
  const addIocType = async (newIoc: { name: string; key: string; regex: string; color: string; icon: string }) => {
    let config = iocConfig.length ? [...iocConfig] : await loadConfig();
    config.push(newIoc);
    if (typeof window !== 'undefined') localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    setIocConfig(config);
  };

  const runExtraction = async () => {
    const { iocResults, enriched } = await extractIOCs(rawText);
    setIocResults(iocResults);
    setEnriched(enriched);
    setRawText(""); // Clear textarea after extraction
  };

  return {
    rawText,
    setRawText,
    iocResults,
    setIocResults,
    enriched,
    runExtraction,
    iocConfig,
    loadConfig,
    addIocType,
  };
}
