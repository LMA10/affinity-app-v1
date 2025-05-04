"use client";
import { useIncidentResponseState } from "@/lib/state/incidentResponseState/incidentResponseState";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, FileText, ShieldCheck, ClipboardList, UploadCloud, History, X, Share2, Clock } from 'lucide-react';
import { Tabs } from '@/components/ui/tabs';

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
    base64: "bg-teal-700",
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
    base64: { icon: FileText, color: 'text-teal-400', label: 'Base64' },
};

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
function IOCTypeTable({ iocType, values, meta, collapsed, toggleCollapse, searchTerm, handleSearchChange, openInVT, openInAbuseIPDB, copyToClipboard, enriched, iocViewMode, setIocViewMode }: any) {
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
                                    <tr key={idx} className="border-b border-orange-900/10 hover:bg-orange-900/10 transition">
                                        <td className="px-4 py-2 font-mono text-orange-100 whitespace-nowrap">
                                            {val}
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

export default function ThreatHuntingPage() {
    const {
        rawText,
        setRawText,
        iocResults,
        runExtraction,
        enriched,
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
    const [inputTab, setInputTab] = useState<'paste' | 'upload' | 'history'>('paste');
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

    useEffect(() => {
        document.body.className = darkMode ? "bg-[#10181d] text-white" : "bg-white text-black";
    }, [darkMode]);

    // Handle file drop
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const text = await file.text();
            setRawText(text);
        }
    };

    // Handle file select
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const text = await file.text();
            setRawText(text);
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
    const handleGrep = async () => {
        await runExtraction();
        setExtracted(true);
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
    const iocSummary = Object.entries(iocResults).map(([type, values]) => ({ type, count: values.length }));
    const totalIocs = iocSummary.reduce((sum, { count }) => sum + count, 0);

    // Filtered IOCs by global search
    const filteredIocResults = Object.fromEntries(
        Object.entries(iocResults).map(([type, values]) => [
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

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#181c20] p-0">
            <div className="w-full max-w-5xl mt-10">
                {/* Hero Header */}
                <div className="flex items-center gap-3 mb-8">
                    <ShieldCheck className="w-10 h-10 text-orange-500 animate-pulse" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-orange-400 tracking-tight">Threat Hunting: IOC Extractor</h1>
                        <p className="text-muted-foreground text-base">Paste, upload, or drop logs. Instantly extract, enrich, and hunt IOCs.</p>
                    </div>
                </div>
                {/* Tabbed Input */}
                <div className="bg-[#20262b] border border-orange-900/40 rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => setInputTab('paste')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${inputTab === 'paste' ? 'bg-orange-500 text-white' : 'bg-[#23282e] text-orange-200 hover:bg-orange-600/20'}`}><ClipboardList className="w-5 h-5" />Paste</button>
                        <button onClick={() => setInputTab('upload')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${inputTab === 'upload' ? 'bg-orange-500 text-white' : 'bg-[#23282e] text-orange-200 hover:bg-orange-600/20'}`}><UploadCloud className="w-5 h-5" />Upload</button>
                        <button onClick={() => setInputTab('history')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold ${inputTab === 'history' ? 'bg-orange-500 text-white' : 'bg-[#23282e] text-orange-200 hover:bg-orange-600/20'}`}><History className="w-5 h-5" />History</button>
                    </div>
                    {inputTab === 'paste' && (
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
                        </div>
                        {/* IOC Results */}
                        <div className="space-y-4">
                            {Object.entries(filteredIocResults).map(([iocType, values]) => {
                                if (!values.length) return null;
                                const meta = IOC_TYPE_META[iocType] || { icon: FileText, color: 'text-gray-400', label: iocType };
                                return (
                                    <IOCTypeTable
                                        key={iocType}
                                        iocType={iocType}
                                        values={values}
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
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
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
        </div>
    );
}
