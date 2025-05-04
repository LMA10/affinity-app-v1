import { useState } from "react";
import { extractIOCs } from "../../services/iocExtractorService";

export function useIncidentResponseState() {
  const [rawText, setRawText] = useState("");
  const [iocResults, setIocResults] = useState<Record<string, string[]>>({});
  const [enriched, setEnriched] = useState<Record<string, any[]>>({});

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
  };
}
