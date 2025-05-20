"use client";
import { useIncidentResponseState } from "@/lib/state/incidentResponseState/incidentResponseState";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, FileText, ShieldCheck, ClipboardList, UploadCloud, History, X, Share2, Clock, Loader2 } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';
import { useWorkbench, WorkbenchProvider } from "../workbench-context";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
import { LogsPanel } from "@/components/logs/LogsPanel"
import useLogsState from "@/lib/state/logs/logsState";
import { Modal } from '@/components/ui/modal';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useUmbrellaState } from "@/lib/state/umbrellaState";
import { crossReferenceIPs } from "@/lib/services/umbrellaService";

const IOC_COLORS: Record<string, string> = {
    ipv4: "bg-blue-700",
    ipv6: "bg-blue-900",
    domain: "bg-green-700",
    fqdn: "bg-green-900",
    url: "bg-purple-700",
    email: "bg-pink-700",
    md5: "bg-yellow-700",
    sha1: "bg-yellow-800",
    sha256: "bg-yellow-900",
    windowsFilePath: "bg-gray-700",
    unixFilePath: "bg-gray-800",
    windowsRegistryKey: "bg-gray-900",
    userAgent: "bg-orange-700",
};

const IOC_TYPE_META: Record<string, { icon: any; color: string; label: string }> = {
    ipv4: { icon: FileText, color: 'text-blue-400', label: 'IPv4' },
    ipv6: { icon: FileText, color: 'text-blue-600', label: 'IPv6' },
    domain: { icon: FileText, color: 'text-green-400', label: 'Domain' },
    fqdn: { icon: FileText, color: 'text-green-600', label: 'FQDN' },
    url: { icon: FileText, color: 'text-purple-400', label: 'URL' },
    email: { icon: FileText, color: 'text-pink-400', label: 'Email' },
    md5: { icon: FileText, color: 'text-yellow-400', label: 'MD5' },
    sha1: { icon: FileText, color: 'text-yellow-500', label: 'SHA1' },
    sha256: { icon: FileText, color: 'text-yellow-600', label: 'SHA256' },
    windowsFilePath: { icon: FileText, color: 'text-gray-400', label: 'Win Path' },
    unixFilePath: { icon: FileText, color: 'text-gray-500', label: 'Unix Path' },
    windowsRegistryKey: { icon: FileText, color: 'text-gray-600', label: 'Registry' },
    userAgent: { icon: FileText, color: 'text-orange-400', label: 'User-Agent' },
};

const ICON_OPTIONS = [
    { label: 'FileText', value: 'FileText', icon: FileText },
    { label: 'ShieldCheck', value: 'ShieldCheck', icon: ShieldCheck },
    { label: 'ClipboardList', value: 'ClipboardList', icon: ClipboardList },
    { label: 'UploadCloud', value: 'UploadCloud', icon: UploadCloud },
    { label: 'History', value: 'History', icon: History },
    { label: 'X', value: 'X', icon: X },
    { label: 'Share2', value: 'Share2', icon: Share2 },
    { label: 'Clock', value: 'Clock', icon: Clock },
];

function AnimatedCount({ end, duration = 800 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = Math.ceil(end / (duration / 16));
        const interval = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(interval);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(interval);
    }, [end, duration]);
    return <span>{count}</span>;
}

function IOCHeatmap({ iocResults }: { iocResults: Record<string, string[]> }) {
    // Flatten all IOCs into an array of {type, value}
    const dots = Object.entries(iocResults).flatMap(([type, values]) => (values as string[]).map((v: string) => ({ type, v })));
    return (
        <div className="flex flex-wrap gap-1 items-center ml-4">
            {dots.slice(0, 60).map((dot, i) => (
                <span key={i} className={`inline-block w-2 h-2 rounded-full ${IOC_TYPE_META[dot.type]?.color || 'bg-gray-500'}`} title={dot.type} />
            ))}
            {dots.length > 60 && <span className="text-xs text-muted-foreground ml-2">+{dots.length - 60} more</span>}
        </div>
    );
}

// Add a utility for responsive masonry grid
function MasonryGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {children}
        </div>
    );
}

// Add a utility to copy all IOCs to clipboard
function copyAllIocs(iocResults: Record<string, string[]>) {
    const all = Object.entries(iocResults)
        .flatMap(([type, values]) => values.map(v => `${type}: ${v}`))
        .join('\n');
    navigator.clipboard.writeText(all);
}

// Utility to check if an IPv4 is private
function isPrivateIPv4(ip: string): boolean {
    return (
        /^10\./.test(ip) ||
        /^192\.168\./.test(ip) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
        /^127\./.test(ip) ||
        /^169\.254\./.test(ip) ||
        /^0\./.test(ip)
    );
}

// Replace MasonryGrid and card view with a flat, scrollable table/list per IOC type
function IOCTypeTable({ iocType, values, meta, collapsed, toggleCollapse, searchTerm, handleSearchChange, openInVT, openInAbuseIPDB, copyToClipboard, enriched, iocViewMode, setIocViewMode, checked, handleCheck, resolvedIPs, resolvedPTRs }: any) {
    const Icon = meta.icon;
    let filteredValues = values;
    // Count occurrences for sorting and badge
    const countMap: Record<string, number> = {};
    values.forEach((val: string) => { countMap[val] = (countMap[val] || 0) + 1; });
    if (iocViewMode[iocType] === 'unique') {
        filteredValues = Array.from(new Set(filteredValues));
    } else if (iocViewMode[iocType] === 'count') {
        filteredValues = (Array.from(new Set(filteredValues)) as string[]).sort((a, b) => countMap[b] - countMap[a]);
    }
    // else 'all': show all, including duplicates
    // Toast helper
    function showToast(msg: string) {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.position = 'fixed';
        toast.style.bottom = '32px';
        toast.style.right = '32px';
        toast.style.background = '#ff9800';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.fontWeight = 'bold';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        document.body.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 1800);
    }
    // Copy helpers
    const handleCopyAll = () => {
        navigator.clipboard.writeText(filteredValues.join('\n'));
        showToast(`Copied ${filteredValues.length} ${meta.label}${filteredValues.length > 1 ? 's' : ''}`);
    };
    return (
        <div className="mb-6 bg-[#151c1f] border border-orange-900/30 rounded-md">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-orange-900/20 bg-[#181f22] sticky top-0 z-10">
                <Icon className={`w-5 h-5 ${meta.color}`} />
                <span className="font-bold capitalize text-orange-400">{meta.label}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-700 text-xs text-white font-bold shadow-md">{filteredValues.length}</span>
                {/* View mode controls for all types */}
                <div className="ml-4 flex gap-1">
                    <button
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${iocViewMode[iocType] === 'all' ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}
                        onClick={() => setIocViewMode((prev: any) => ({ ...prev, [iocType]: 'all' }))}
                    >All</button>
                    <button
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${iocViewMode[iocType] === 'unique' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}
                        onClick={() => setIocViewMode((prev: any) => ({ ...prev, [iocType]: iocViewMode[iocType] === 'unique' ? 'all' : 'unique' }))}
                        title="Show unique only"
                    >Unique</button>
                    <button
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${iocViewMode[iocType] === 'count' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}
                        onClick={() => setIocViewMode((prev: any) => ({ ...prev, [iocType]: iocViewMode[iocType] === 'count' ? 'all' : 'count' }))}
                        title="Sort by count"
                    >Count</button>
                    <button
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-700 text-white border border-orange-700 hover:bg-orange-800 transition"
                        onClick={handleCopyAll}
                        title={`Copy all ${meta.label}`}
                    >Copy All</button>
                </div>
                <button className="ml-auto text-xs text-muted-foreground flex items-center gap-1 hover:text-orange-400" onClick={() => toggleCollapse(iocType)}>{collapsed[iocType] ? <ChevronDown /> : <ChevronUp />}{collapsed[iocType] ? "Show" : "Hide"}</button>
            </div>
            {!collapsed[iocType] && (
                <>
                    <div className="px-4 py-2 border-b border-orange-900/10">
                        <Input
                            className="h-8 text-sm"
                            placeholder={`Search in ${iocType}...`}
                            value={searchTerm}
                            onChange={e => handleSearchChange(iocType, e.target.value)}
                            size={20}
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <tbody>
                                {filteredValues.map((val: string, idx: number) => (
                                    <tr key={`${iocType}:${val}:${idx}`} className="border-b border-orange-900/10 hover:bg-orange-900/10 transition">
                                        <td className="px-4 py-2 font-mono text-orange-100 whitespace-nowrap">
                                            {val}
                                            {/* Show resolved IPs for domains */}
                                            {iocType === 'domain' && resolvedIPs && resolvedIPs[val] && (
                                                <span className="ml-2 text-xs text-orange-300" title={resolvedIPs[val].join(', ') || 'No A record'}>
                                                    [IPs: {resolvedIPs[val].length ? resolvedIPs[val].join(', ') : 'none'}]
                                                </span>
                                            )}
                                            {/* Show resolved PTR for IPv4 */}
                                            {iocType === 'ipv4' && resolvedPTRs && resolvedPTRs[val] && (
                                                <span className="ml-2 text-xs text-orange-300" title={resolvedPTRs[val].join(', ') || 'No PTR'}>
                                                    [DNS: {resolvedPTRs[val].length ? resolvedPTRs[val].join(', ') : 'none'}]
                                                </span>
                                            )}
                                            {iocViewMode[iocType] === 'count' && countMap[val] > 1 && (
                                                <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-800 text-xs text-white font-bold">({countMap[val]})</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <button onClick={() => {navigator.clipboard.writeText(val); showToast('Copied!')}} className="p-1 rounded hover:bg-orange-700/30 transition" title="Copy"><ClipboardList className="w-4 h-4 text-orange-400" /></button>
                                            <button onClick={() => openInVT(val)} className="p-1 rounded hover:bg-blue-700/30 transition" title="VirusTotal"><ShieldCheck className="w-4 h-4 text-blue-400" /></button>
                                            {iocType === 'ipv4' && <button onClick={() => openInAbuseIPDB(val)} className="p-1 rounded hover:bg-green-700/30 transition" title="AbuseIPDB"><FileText className="w-4 h-4 text-green-400" /></button>}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            {enriched[val] && (
                                                <div className="flex gap-1">
                                                    {Object.entries(enriched[val]).map(([provider, data]) => (
                                                        <span key={provider} className="px-2 py-0.5 rounded-full bg-orange-800 text-xs text-white font-semibold cursor-pointer hover:bg-orange-600 transition" title={provider}>
                                                            {provider}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 whitespace-nowrap">
                                            <input type="checkbox" checked={checked[`${iocType}:${val}`] || false} onChange={e => handleCheck(iocType, val, e.target.checked)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function useWorkbenchSafe() {
  try {
    return useWorkbench();
  } catch {
    return null;
  }
}

function IncidentResponsePageInner() {
    const {
        rawText,
        setRawText,
        iocResults,
        runExtraction,
        enriched,
        iocConfig,
        loadConfig,
        addIocType,
    } = useIncidentResponseState();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
    const [extracted, setExtracted] = useState(false);
    const [iocTags, setIocTags] = useState<Record<string, string>>({});
    const [iocNotes, setIocNotes] = useState<Record<string, string>>({});
    const [globalSearch, setGlobalSearch] = useState("");
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [darkMode, setDarkMode] = useState(true);
    const [step, setStep] = useState(1);
    const exampleLog = `2024-07-16 10:00:00,123 INFO src=192.168.1.1 dst=8.8.8.8 user=alice@company.com url=hxxp://malicious[.]site/path hash=44d88612fea8a8f36de82e1278abb02f

2024-07-16 10:01:05,456 WARN src=fe80::f2de:f1ff:fe3f:307e dst=2001:4860:4860::8888 email=bob.smith@evil-domain.biz cmd="powershell -EncodedCommand ZWNobyAiSGVsbG8i" md5=098f6bcd4621d373cade4e832627b4f6

2024-07-16 10:02:10,789 ERROR domain=compromise-login.co.uk fqdn=login.compromise-login.co.uk referer=https://compromise-login.co.uk/login hash_sha1=da39a3ee5e6b4b0d3255bfef95601890afd80709

2024-07-16 10:03:15,001 CRITICAL file=C:\Users\Admin\AppData\Roaming\malicious.exe registry=HKLM\Software\Microsoft\Windows\CurrentVersion\Run service=WinUpdateChecker sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

2024-07-16 10:04:20,222 NOTICE path=/usr/local/bin/.hidden.sh user-agent="curl/7.68.0" mutex=Global\RansomwareLock42

2024-07-16 10:05:25,333 ALERT bitcoin=1BoatSLRHtKNngkdXEeobR76b53LETtpyT ja3=771,4865-4866-49195-49196,0-23-65281-10-11-13-45-51,29-23-24,0
208.67.222.222
8.26.56.26
185.228.168.9
64.6.64.6
198.101.242.72
199.85.126.10
77.88.8.8
202.83.95.229
114.114.114.114
123.125.81.6
129.250.35.250
203.107.1.1
216.146.35.35
37.235.1.174
103.86.96.100
45.90.28.0
149.112.112.112
192.168.0.1
192.168.1.100
192.168.10.10
10.0.0.1
10.10.10.10
10.1.1.1
172.16.0.1
172.20.10.5
172.31.255.255
172.30.0.100
149.112.112.112
149.112.112.112
`;
    const [inputTab, setInputTab] = useState<'text' | 'upload' | 'history'>('text');
    const [showHistory, setShowHistory] = useState(false);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const mockSessions = [
        { id: 1, name: 'Session 1', date: '2024-07-16', iocCount: 12 },
        { id: 2, name: 'Session 2', date: '2024-07-15', iocCount: 8 },
        { id: 3, name: 'Session 3', date: '2024-07-14', iocCount: 20 },
    ];
    const [ipv4Filter, setIpv4Filter] = useState<'all' | 'public' | 'private'>('all');
    const [ipv4Sort, setIpv4Sort] = useState<'original' | 'count'>('original');
    const [ipv4ViewMode, setIpv4ViewMode] = useState<'all' | 'unique' | 'count'>('all');
    const [iocViewMode, setIocViewMode] = useState<Record<string, 'all' | 'unique' | 'count'>>({});
    const workbench = useWorkbenchSafe();
    const { selectedIocs, setSelectedIocs, setQueryString } = workbench || { selectedIocs: [], setSelectedIocs: () => {}, setQueryString: () => {} };
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [logsQuery, setLogsQuery] = useState("");
    const { headers } = useLogsState();
    const [showIocModal, setShowIocModal] = useState(false);
    const [newIoc, setNewIoc] = useState({ name: '', key: '', regex: '', color: '#ff9800', icon: 'FileText' });
    const [formError, setFormError] = useState('');
    // Umbrella whitelist integration
    const [shouldLoadWhitelist, setShouldLoadWhitelist] = useState(false);
    const { whitelist, loading: whitelistLoading, error: whitelistError, resolvedDomains, domainLoading, domainError, domainWhitelist, domainUnmatched, resolveAndCrossDomains, resolvedPTRs, ptrLoading, ptrError, resolvePTRs } = useUmbrellaState(shouldLoadWhitelist ? 1000 : 0);
    const [ipv4WhitelistFilter, setIpv4WhitelistFilter] = useState<'all' | 'whitelist' | 'unmatched'>('all');
    const [ipv4PubPrivFilter, setIpv4PubPrivFilter] = useState<'all' | 'public' | 'private'>('all');
    const [domainWhitelistFilter, setDomainWhitelistFilter] = useState<'all' | 'whitelist' | 'unmatched'>('all');
    // Extract all IPv4 IOCs from iocResults
    const ipv4Iocs = iocResults?.ipv4 || [];
    // Cross-reference with whitelist
    const { whitelisted, unmatched } = crossReferenceIPs(ipv4Iocs, whitelist, new Set());
    let filteredIPv4 = ipv4Iocs;
    if (ipv4WhitelistFilter === 'whitelist') filteredIPv4 = whitelisted;
    else if (ipv4WhitelistFilter === 'unmatched') filteredIPv4 = unmatched;
    // Load config on mount
    useEffect(() => { loadConfig(); }, []);
    // Validation helpers
    const validateIoc = () => {
        if (!newIoc.name.trim() || !newIoc.key.trim() || !newIoc.regex.trim()) return 'All fields are required.';
        if (!/^([a-z0-9_]+)$/.test(newIoc.key)) return 'Key must be lowercase, alphanumeric, and no spaces.';
        if (iocConfig.some(i => i.key === newIoc.key)) return 'Key must be unique.';
        if (iocConfig.some(i => i.name.toLowerCase() === newIoc.name.trim().toLowerCase())) return 'Name must be unique.';
        try { new RegExp(newIoc.regex); } catch { return 'Regex is invalid.'; }
        if (!/^#[0-9a-fA-F]{6}$/.test(newIoc.color)) return 'Color must be a valid hex.';
        if (!ICON_OPTIONS.some(opt => opt.value === newIoc.icon)) return 'Icon is required.';
        return '';
    };
    const handleAddIoc = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validateIoc();
        if (err) { setFormError(err); return; }
        await addIocType(newIoc);
        setNewIoc({ name: '', key: '', regex: '', color: '#ff9800', icon: 'FileText' });
        setFormError('');
        setShowIocModal(false);
        await loadConfig();
    };

    useEffect(() => {
        document.body.className = darkMode ? "bg-[#10181d] text-white" : "bg-white text-black";
    }, [darkMode]);

    const CHUNK_SIZE = 256 * 1024; // 256KB

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            setUploadProgress(0);
            let offset = 0;
            let text = '';
            while (offset < file.size) {
                const slice = file.slice(offset, offset + CHUNK_SIZE);
                const chunk = await slice.text();
                text += chunk;
                offset += CHUNK_SIZE;
                setUploadProgress(Math.round((offset / file.size) * 100));
            }
            setRawText(text);
            setUploading(false);
            setUploadProgress(100);
            setInputTab('text');
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setUploading(true);
            setUploadProgress(0);
            let offset = 0;
            let text = '';
            while (offset < file.size) {
                const slice = file.slice(offset, offset + CHUNK_SIZE);
                const chunk = await slice.text();
                text += chunk;
                offset += CHUNK_SIZE;
                setUploadProgress(Math.round((offset / file.size) * 100));
            }
            setRawText(text);
            setUploading(false);
            setUploadProgress(100);
            setInputTab('text');
        }
    };

    // Copy helpers
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Handle search term change
    const handleSearchChange = (iocType: string, value: string) => {
        setSearchTerms((prev) => ({ ...prev, [iocType]: value }));
    };

    // Helper to get enrichment for an IPv4
    const getGeoIP = (ip: string) => {
        if (!enriched?.ipv4) return null;
        return enriched.ipv4.find((e: any) => e.ip === ip);
    };

    // Handle Grep button
    const [analyzing, setAnalyzing] = useState(false);
    const handleGrep = async () => {
        setAnalyzing(true);
        await runExtraction();
        setExtracted(true);
        setAnalyzing(false);
        // Only load whitelist if there are IPv4 or domain IOCs
        if ((iocResults?.ipv4 || []).length > 0 || (iocResults?.domain || []).length > 0) setShouldLoadWhitelist(true);
        // After whitelist is loaded, resolve domains if present
        setTimeout(() => {
            if ((iocResults?.domain || []).length > 0 && whitelist && whitelist.size > 0) {
                resolveAndCrossDomains(iocResults.domain, whitelist);
            }
        }, 500);
    };

    // Handle Reset button
    const handleReset = () => {
        setRawText("");
        setExtracted(false);
        setSearchTerms({});
    };

    // Add exportIOCs function to the component
    function exportIOCs(format: 'csv' | 'json') {
        const data = Object.entries(iocResults).reduce((acc, [type, values]) => {
            acc[type] = values;
            return acc;
        }, {} as Record<string, string[]>);
        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'iocs.json';
            a.click();
            URL.revokeObjectURL(url);
            // Toast
            const toast = document.createElement('div');
            toast.textContent = 'Exported as JSON!';
            toast.style.position = 'fixed';
            toast.style.bottom = '32px';
            toast.style.right = '32px';
            toast.style.background = '#ff9800';
            toast.style.color = 'white';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.fontWeight = 'bold';
            toast.style.zIndex = '9999';
            toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            document.body.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 1800);
        } else {
            // CSV: type,value\n
            let csv = 'type,value\n';
            Object.entries(data).forEach(([type, values]) => {
                values.forEach(value => {
                    csv += `${type},${value}\n`;
                });
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'iocs.csv';
            a.click();
            URL.revokeObjectURL(url);
            // Toast
            const toast = document.createElement('div');
            toast.textContent = 'Exported as CSV!';
            toast.style.position = 'fixed';
            toast.style.bottom = '32px';
            toast.style.right = '32px';
            toast.style.background = '#ff9800';
            toast.style.color = 'white';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.fontWeight = 'bold';
            toast.style.zIndex = '9999';
            toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            document.body.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 1800);
        }
    }

    // Tagging
    function handleTag(val: string, tag: string) {
        setIocTags((prev) => ({ ...prev, [val]: tag }));
    }
    // Notes
    function handleNote(val: string, note: string) {
        setIocNotes((prev) => ({ ...prev, [val]: note }));
    }
    // Collapsible
    function toggleCollapse(type: string) {
        setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
    }

    // Quick enrichment actions (mocked)
    function openInVT(val: string) {
        window.open(`https://www.virustotal.com/gui/search/${encodeURIComponent(val)}`, "_blank");
    }
    function openInAbuseIPDB(val: string) {
        window.open(`https://www.abuseipdb.com/check/${encodeURIComponent(val)}`, "_blank");
    }

    // IOC summary
    const iocSummary = Object.entries(iocResults)
        .filter(([type]) => type !== 'base64')
        .map(([type, values]) => ({ type, count: values.length }));
    const totalIocs = iocSummary.reduce((sum, { count }) => sum + count, 0);

    // Filtered IOCs by global search
    const filteredIocResults = Object.fromEntries(
        Object.entries(iocResults)
            .filter(([type]) => type !== 'base64')
            .map(([type, values]) => [
                type,
                values.filter(
                    (v) =>
                        (!globalSearch || v.toLowerCase().includes(globalSearch.toLowerCase())) ||
                        (enriched[v] && JSON.stringify(enriched[v]).toLowerCase().includes(globalSearch.toLowerCase()))
                ),
            ])
    );

    function handleShareSession() {
        navigator.clipboard.writeText('https://yourapp.com/ioc-session/12345');
        setShowShareTooltip(true);
        setTimeout(() => setShowShareTooltip(false), 2000);
    }

    // Utility: Generate SQL WHERE clause from selected IOCs
    function generateSqlQuery(iocs: { type: string; value: string }[], searchAll: boolean) {
        if (!iocs.length) return "";
        const columns = headers && headers.length > 0 ? headers : [
            "eventversion", "useridentity.type", "useridentity.principalid", "useridentity.arn", "useridentity.accountid",
            "eventtime", "eventsource", "eventname", "awsregion", "sourceIPAddress", "userAgent", "errorCode", "errorMessage",
            "requestParameters", "responseElements", "additionalEventData", "requestID", "eventID", "resources", "eventType",
            "apiVersion", "readOnly", "recipientAccountId", "serviceEventDetails", "sharedEventID", "vpcEndpointId"
        ];
        const fieldMap: Record<string, string[]> = {
            ipv4: ["sourceIPAddress"],
            ipv6: ["sourceIPAddress"],
            domain: ["domain", "fqdn", "url"],
            fqdn: ["fqdn", "domain", "url"],
            url: ["url", "domain", "fqdn"],
            email: ["userIdentity.arn", "userIdentity.principalid"],
            md5: ["file_hash", "md5"],
            sha1: ["file_hash", "sha1"],
            sha256: ["file_hash", "sha256"],
        };
        const clauses: string[] = [];
        for (const { type, value } of iocs) {
            if (searchAll) {
                columns.forEach(col => {
                    clauses.push(`CAST(\"${col}\" AS TEXT) LIKE '%${value}%'`);
                });
            } else {
                const fields = fieldMap[type] || columns;
                if (["ipv4", "ipv6", "md5", "sha1", "sha256", "email"].includes(type)) {
                    fields.forEach(field => {
                        clauses.push(`\"${field}\" = '${value}'`);
                    });
                } else {
                    fields.forEach(field => {
                        clauses.push(`CAST(\"${field}\" AS TEXT) LIKE '%${value}%'`);
                    });
                }
            }
        }
        return `SELECT * FROM \"cloudtrail\" WHERE ${clauses.join(" OR ")} LIMIT 100`;
    }

    // Handle checkbox change
    function handleCheck(iocType: string, value: string, checkedVal: boolean) {
        setChecked(prev => ({ ...prev, [`${iocType}:${value}`]: checkedVal }));
    }

    // Handle Query in Logs
    function handleQueryInLogs() {
        // Gather selected IOCs
        const selected: { type: string; value: string }[] = [];
        Object.entries(iocResults).forEach(([type, values]) => {
            values.forEach(value => {
                if (checked[`${type}:${value}`]) {
                    selected.push({ type, value });
                }
            });
        });

        if (selected.length === 0) {
            // Show a toast notification
            const toast = document.createElement('div');
            toast.textContent = 'Please select at least one IOC to query';
            toast.style.position = 'fixed';
            toast.style.bottom = '32px';
            toast.style.right = '32px';
            toast.style.background = '#ff9800';
            toast.style.color = 'white';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '8px';
            toast.style.fontWeight = 'bold';
            toast.style.zIndex = '9999';
            toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            document.body.appendChild(toast);
            setTimeout(() => { toast.remove(); }, 1800);
            return;
        }

        setSelectedIocs(selected);
        const query = generateSqlQuery(selected, false);
        setQueryString(query);
        setLogsQuery(query);
        setIsDrawerOpen(true);
    }

    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#181c20] p-0">
            <div className="w-full max-w-5xl mt-10">
                {/* IOC Add Button */}
                <div className="flex justify-end mb-2">
                    <Button onClick={() => setShowIocModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Add IOC
                    </Button>
                </div>
                {/* IOC Modal */}
                <Modal isOpen={showIocModal} onClose={() => setShowIocModal(false)} title="Add New IOC Type">
                    <form onSubmit={handleAddIoc} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Name</label>
                            <Input value={newIoc.name} onChange={e => setNewIoc({ ...newIoc, name: e.target.value })} placeholder="e.g. Bitcoin Address" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Key</label>
                            <Input value={newIoc.key} onChange={e => setNewIoc({ ...newIoc, key: e.target.value })} placeholder="e.g. bitcoin" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Regex</label>
                            <Input value={newIoc.regex} onChange={e => setNewIoc({ ...newIoc, regex: e.target.value })} placeholder="e.g. [13][a-km-zA-HJ-NP-Z1-9]{25,34}" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Color</label>
                            <input type="color" value={newIoc.color} onChange={e => setNewIoc({ ...newIoc, color: e.target.value })} className="w-12 h-8 p-0 border-none bg-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Icon</label>
                            <Select value={newIoc.icon} onValueChange={icon => setNewIoc({ ...newIoc, icon })}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ICON_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value} className="flex items-center gap-2">
                                            <opt.icon className="w-4 h-4 mr-2 inline-block" /> {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {formError && <div className="text-red-500 text-sm font-semibold">{formError}</div>}
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setShowIocModal(false)}>Cancel</Button>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Add IOC</Button>
                        </div>
                    </form>
                </Modal>
                {/* Hero Header */}
                <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck className="w-10 h-10 text-orange-500 animate-pulse" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-orange-400 tracking-tight">INCIDENT RESPONSE</h1>
                        <p className="text-muted-foreground text-base">Paste, upload, or drop logs. Instantly extract, enrich, and hunt IOCs.</p>
                    </div>
                </div>
                {/* Tabbed Input */}
                <div className="bg-[#20262b] border border-orange-900/40 rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => setInputTab('text')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${inputTab === 'text' ? 'bg-orange-500 text-white' : 'bg-[#23282e] text-orange-200 hover:bg-orange-600/20'}`}><ClipboardList className="w-5 h-5" />Text</button>
                        <button onClick={() => setInputTab('upload')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${inputTab === 'upload' ? 'bg-orange-500 text-white' : 'bg-[#23282e] text-orange-200 hover:bg-orange-600/20'}`}><UploadCloud className="w-5 h-5" />Upload</button>
                        <button onClick={() => setInputTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${inputTab === 'history' ? 'bg-orange-500 text-white' : 'bg-[#23282e] text-orange-200 hover:bg-orange-600/20'}`}><History className="w-5 h-5" />History</button>
                    </div>
                    {inputTab === 'text' && (
                        <>
                            <div className="flex gap-2 mb-4">
                                <Button onClick={() => { setRawText(exampleLog); }} variant="outline" size="sm" className="flex gap-2 items-center" title="Try a sample log!"><ClipboardList className="w-4 h-4 animate-bounce" />Paste Example</Button>
                            </div>
                            <Textarea
                                className="w-full min-h-[100px] border-orange-400/40 focus:border-orange-500 rounded-md mb-4"
                                value={rawText}
                                onChange={e => setRawText(e.target.value)}
                                placeholder="Paste or type your log data here..."
                            />
                            <Button onClick={async () => { await handleGrep(); setStep(2); }} className="w-full max-w-xs mx-auto block bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base py-2 rounded-md">
                                Analyze
                            </Button>
                        </>
                    )}
                    {inputTab === 'upload' && (
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="border-2 border-dashed border-orange-400/60 rounded-xl p-8 bg-[#23282e] hover:bg-orange-950/10 transition cursor-pointer text-center flex flex-col items-center justify-center min-h-[120px] animate-pulse"
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                title="Drag & drop a log file or click to select"
                            >
                                <input
                                    type="file"
                                    accept=".txt,.log,.json,.csv"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                <UploadCloud className="w-10 h-10 text-orange-400 mb-2 animate-bounce" />
                                <span className="text-base font-semibold text-orange-300">Drag & drop a log file here, or click to select</span>
                                <span className="block text-xs text-muted-foreground mt-1">Supported: .txt, .log, .json, .csv</span>
                            </div>
                            {uploading && (
                                <div className="w-full mt-4">
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-2 bg-orange-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                    <div className="text-xs text-orange-300 mt-1 text-center">Uploading... {uploadProgress}%</div>
                                </div>
                            )}
                        </div>
                    )}
                    {inputTab === 'history' && (
                        <div className="text-orange-200 text-center py-8 opacity-60">Session history coming soon...</div>
                    )}
                </div>
                {/* Results Card */}
                {step === 2 && (
                    <div className="bg-[#181f22] border border-orange-900/40 rounded-lg p-6 shadow-sm">
                        {/* Animated Summary Bar & Heatmap */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            {iocSummary.map(({ type, count }) => {
                                const meta = IOC_TYPE_META[type] || { icon: FileText, color: 'text-gray-400', label: type };
                                const Icon = meta.icon;
                                return (
                                    <span key={type} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border border-orange-700 ${meta.color} bg-[#151c1f]`}> <Icon className="w-4 h-4" />{meta.label}: <AnimatedCount end={count} /></span>
                                );
                            })}
                            <span className="ml-2 text-sm font-semibold text-orange-300">Total: <AnimatedCount end={totalIocs} /></span>
                            <IOCHeatmap iocResults={iocResults} />
                            <Input
                                className="ml-auto max-w-xs h-8 text-sm"
                                placeholder="Global search..."
                                value={globalSearch}
                                onChange={e => setGlobalSearch(e.target.value)}
                            />
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                            <Button onClick={() => copyAllIocs(iocResults)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-6 py-2 rounded-full shadow-md transition-transform hover:scale-110" title="Copy all IOCs to clipboard">Copy All</Button>
                            <Button onClick={() => { handleReset(); setStep(1); }} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base px-6 py-2 rounded-full shadow-md transition-transform hover:scale-105">Reset</Button>
                            <Button onClick={() => exportIOCs('csv')} className="bg-orange-700 hover:bg-orange-800 text-white font-semibold text-base px-6 py-2 rounded-full flex gap-2 items-center shadow-md transition-transform hover:scale-105"><Download className="w-5 h-5" />Export CSV</Button>
                            <Button onClick={() => exportIOCs('json')} className="bg-orange-700 hover:bg-orange-800 text-white font-semibold text-base px-6 py-2 rounded-full flex gap-2 items-center shadow-md transition-transform hover:scale-105"><Download className="w-5 h-5" />Export JSON</Button>
                            <Button onClick={handleQueryInLogs} className="bg-green-700 hover:bg-green-800 text-white font-semibold text-base px-6 py-2 rounded-full shadow-md transition-transform hover:scale-110" title="Query selected IOCs in Logs">Query in Logs</Button>
                        </div>
                        {/* IOC Results */}
                        <div className="space-y-4">
                            {Object.entries(filteredIocResults).map(([iocType, values]) => {
                                if (!values.length) return null;
                                const meta = IOC_TYPE_META[iocType] || { icon: FileText, color: 'text-gray-400', label: iocType };
                                // IPv4 filter controls and whitelist logic
                                let displayValues = values;
                                if (iocType === 'ipv4') {
                                    let whitelisted: string[] = [];
                                    let unmatched: string[] = [];
                                    if (whitelist && whitelist.size > 0) {
                                        const result = crossReferenceIPs(values, whitelist, new Set());
                                        whitelisted = result.whitelisted;
                                        unmatched = result.unmatched;
                                    }
                                    if (ipv4WhitelistFilter === 'whitelist') displayValues = whitelisted;
                                    else if (ipv4WhitelistFilter === 'unmatched') displayValues = unmatched;
                                    // Public/Private filter
                                    if (ipv4PubPrivFilter === 'public') displayValues = displayValues.filter(ip => !isPrivateIPv4(ip));
                                    else if (ipv4PubPrivFilter === 'private') displayValues = displayValues.filter(ip => isPrivateIPv4(ip));
                                }
                                // Domain filter controls and whitelist logic
                                if (iocType === 'domain') {
                                    let whitelisted: string[] = [];
                                    let unmatched: string[] = [];
                                    if (domainWhitelist && domainWhitelist.length > 0) whitelisted = domainWhitelist;
                                    if (domainUnmatched && domainUnmatched.length > 0) unmatched = domainUnmatched;
                                    if (domainWhitelistFilter === 'whitelist') displayValues = whitelisted;
                                    else if (domainWhitelistFilter === 'unmatched') displayValues = unmatched;
                                }
                                return (
                                    <div key={iocType}>
                                        {iocType === 'ipv4' && (
                                            <div className="mb-2">
                                                <div className="flex gap-2 mb-2">
                                                    <button onClick={() => setIpv4WhitelistFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${ipv4WhitelistFilter === 'all' ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>All</button>
                                                    <button onClick={() => setIpv4WhitelistFilter('whitelist')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${ipv4WhitelistFilter === 'whitelist' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>Whitelist</button>
                                                    <button onClick={() => setIpv4WhitelistFilter('unmatched')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${ipv4WhitelistFilter === 'unmatched' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>Unmatched</button>
                                                </div>
                                                <div className="flex gap-2 mb-2">
                                                    <button onClick={() => setIpv4PubPrivFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${ipv4PubPrivFilter === 'all' ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>All</button>
                                                    <button onClick={() => setIpv4PubPrivFilter('public')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${ipv4PubPrivFilter === 'public' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>Public</button>
                                                    <button onClick={() => setIpv4PubPrivFilter('private')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${ipv4PubPrivFilter === 'private' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>Private</button>
                                                </div>
                                                <div className="flex gap-2 mb-2">
                                                    <Button onClick={() => resolvePTRs(displayValues)} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full text-xs font-semibold" disabled={ptrLoading}>
                                                        {ptrLoading ? 'Resolving DNS...' : 'Resolve DNS'}
                                                    </Button>
                                                    {ptrError && <span className="text-red-500 ml-2 text-xs">{ptrError}</span>}
                                                </div>
                                            </div>
                                        )}
                                        {iocType === 'domain' && (
                                            <div className="flex gap-2 mb-2 items-center">
                                                <button onClick={() => setDomainWhitelistFilter('all')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${domainWhitelistFilter === 'all' ? 'bg-blue-700 text-white border-blue-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>All</button>
                                                <button onClick={() => setDomainWhitelistFilter('whitelist')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${domainWhitelistFilter === 'whitelist' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>Whitelist</button>
                                                <button onClick={() => setDomainWhitelistFilter('unmatched')} className={`px-3 py-1 rounded-full text-xs font-semibold border ${domainWhitelistFilter === 'unmatched' ? 'bg-orange-700 text-white border-orange-700' : 'bg-gray-700 text-gray-200 border-gray-700'} transition`}>Unmatched</button>
                                                {domainLoading && <span className="text-orange-400 ml-4">Resolving domains...</span>}
                                                {domainError && <span className="text-red-500 ml-4">Error: {domainError}</span>}
                                            </div>
                                        )}
                                        <IOCTypeTable
                                            iocType={iocType}
                                            values={displayValues}
                                            meta={meta}
                                            collapsed={collapsed}
                                            toggleCollapse={toggleCollapse}
                                            searchTerm={searchTerms[iocType] || ''}
                                            handleSearchChange={handleSearchChange}
                                            openInVT={openInVT}
                                            openInAbuseIPDB={openInAbuseIPDB}
                                            copyToClipboard={copyToClipboard}
                                            enriched={enriched}
                                            iocViewMode={iocViewMode}
                                            setIocViewMode={setIocViewMode}
                                            checked={checked}
                                            handleCheck={handleCheck}
                                            resolvedIPs={iocType === 'domain' ? resolvedDomains : undefined}
                                            resolvedPTRs={iocType === 'ipv4' ? resolvedPTRs : undefined}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {/* Character counter below the card, aligned left */}
            <div className="w-full max-w-5xl flex justify-start pl-2 pt-1 text-xs text-orange-300">
                {rawText.length} characters
            </div>
            {/* Spinner overlay when analyzing */}
            {analyzing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="flex flex-col items-center gap-2 p-8 bg-[#23282e] rounded-lg shadow-lg border border-orange-700/40">
                        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
                        <span className="text-orange-300 font-semibold mt-2">Analyzing...</span>
                    </div>
                </div>
            )}
            {/* Session History Sidebar/Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-50 bg-black/40 flex justify-end animate-fade-in">
                    <div className="w-80 h-full bg-[#23282e] border-l border-orange-900/40 shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-orange-900/30">
                            <span className="font-bold text-orange-400 text-lg">Session History</span>
                            <button onClick={() => setShowHistory(false)} className="p-2 rounded hover:bg-orange-700/20"><X className="w-5 h-5 text-orange-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {mockSessions.map(session => (
                                <div key={session.id} className="bg-[#181f22] border border-orange-900/30 rounded-lg p-3 flex flex-col gap-1 shadow-sm hover:bg-orange-900/10 transition">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-orange-300">{session.name}</span>
                                        <span className="text-xs text-muted-foreground">{session.date}</span>
                                    </div>
                                    <span className="text-xs text-orange-200">IOCs: {session.iocCount}</span>
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="text-xs px-2 py-1" onClick={() => {/* restore logic */ }}>Restore</Button>
                                        <Button size="sm" variant="destructive" className="text-xs px-2 py-1" onClick={() => {/* delete logic */ }}>Delete</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="max-w-4xl w-full right-0 fixed top-0 h-full z-50 bg-[#10181d] border-l border-orange-700/30 shadow-2xl">
                    <DrawerHeader>
                        <DrawerTitle>Security Logs</DrawerTitle>
                        <DrawerClose asChild>
                            <button onClick={() => setIsDrawerOpen(false)} className="absolute right-4 top-4 text-orange-400 hover:text-orange-600 text-2xl">×</button>
                        </DrawerClose>
                    </DrawerHeader>
                    <div className="p-0 overflow-y-auto h-[calc(100vh-60px)]">
                        <LogsPanel queryString={logsQuery} onClose={() => setIsDrawerOpen(false)} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default function IncidentResponsePageWrapper() {
  const workbench = useWorkbenchSafe();
  if (workbench) {
    return <IncidentResponsePageInner />;
  }
  return (
    <WorkbenchProvider>
      <IncidentResponsePageInner />
    </WorkbenchProvider>
  );
}
