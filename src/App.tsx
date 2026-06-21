import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, TrendingDown, Layers, Activity, Cpu, ShieldAlert, Zap, Clock, 
  RefreshCw, DollarSign, ListFilter, Play, BarChart3, AlertCircle, 
  Workflow, Database, ChevronRight, Binary, Sliders, CheckSquare, XCircle, ChevronDown, CheckCircle2, Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Asset, IngestionLog, NewsItem, ActivePosition, CompletedTrade, 
  BacktestResult, AgentDebate, DigitalTwinResult, EconomicEvent 
} from "./types";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [activeTab, setActiveTab] = useState<"terminal" | "copilot" | "research" | "backtester" | "risk" | "twin">("terminal");
  
  // Real-time market state from server
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activePositions, setActivePositions] = useState<ActivePosition[]>([]);
  const [completedTrades, setCompletedTrades] = useState<CompletedTrade[]>([]);
  const [utcTime, setUtcTime] = useState("");
  const [systemLatency, setSystemLatency] = useState(12);

  // Advanced Chart configs
  const [chartType, setChartType] = useState<"candle" | "line">("candle");
  const [showBollinger, setShowBollinger] = useState(true);
  const [showMA, setShowMA] = useState(true);
  const [chartRecords, setChartRecords] = useState<any[]>([]);
  const [hoveredPoint, setHoverPoint] = useState<any | null>(null);

  // Economic Calendar State
  const [calendar, setCalendar] = useState<EconomicEvent[]>([]);

  // Backtester Config & Results
  const [backtestAsset, setBacktestAsset] = useState("AAPL");
  const [backtestStrategy, setBacktestStrategy] = useState("Temporal Fusion Transformer");
  const [backtestHorizon, setBacktestHorizon] = useState("1h");
  const [backtestFriction, setBacktestFriction] = useState("medium");
  const [backtestRisk, setBacktestRisk] = useState("0.02");
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState(false);

  // Multi-Agent Consensus AI engine
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentDebate, setAgentDebate] = useState<AgentDebate | null>(null);
  const [consensusAsset, setConsensusAsset] = useState("BTC");
  const [consensusDirection, setConsensusDirection] = useState<"BUY" | "SELL">("BUY");
  const [consensusTimeframe, setConsensusTimeframe] = useState("1h");

  // Portfolio Optimization target
  const [optimizationModel, setOptimizationModel] = useState<"HRP" | "BlackLitterman" | "MeanVariance" | "RiskParity">("HRP");
  const [optWeights, setOptWeights] = useState<Record<string, number>>({
    AAPL: 15, TSLA: 10, BTC: 25, EURUSD: 20, GOLD: 20, SPX: 10
  });

  // Digital Twin & Order Placement State
  const [twinAsset, setTwinAsset] = useState("BTC");
  const [twinDirection, setTwinDirection] = useState<"BUY" | "SELL">("BUY");
  const [twinSize, setTwinSize] = useState("50000");
  const [twinLeverage, setTwinLeverage] = useState("10");
  const [twinResult, setTwinResult] = useState<DigitalTwinResult | null>(null);
  const [isSimulatingTwin, setIsSimulatingTwin] = useState(false);

  // Base Risk Management & Balance parameters
  const [accountBalance, setAccountBalance] = useState(98420.50);
  const [riskPercentPerTrade, setRiskPercentPerTrade] = useState(2.0);

  // Custom ticker integration states
  const [customTickerInput, setCustomTickerInput] = useState("");
  const [tickerError, setTickerError] = useState("");
  const [isAddingTicker, setIsAddingTicker] = useState(false);

  // Copilot Chat Dialog states
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotLogs, setCopilotLogs] = useState<Array<{ sender: "user" | "copilot", text: string, timestamp: string }>>([
    {
      sender: "copilot",
      text: "### Welcome to Apex Portfolios Copilot\n\nI can analyze your paper account balance, portfolio exposure, active buy/sell positions, recent trade records, and fetch real-time stock/crypto prices from free Yahoo/Coinbase public sources! Try asking:\n\n- *'Show my active balance and asset price list'* \n- *'What is BTC, EURUSD and Gold Spot current price?'* \n- *'Suggest a trade strategy or allocation split for my portfolio'*",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const handleSendCopilotPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userPrompt = copilotInput.trim();
    setCopilotInput("");
    
    // Add user log link
    const nowTime = new Date().toLocaleTimeString();
    setCopilotLogs(prev => [...prev, {
      sender: "user",
      text: userPrompt,
      timestamp: nowTime
    }]);

    setIsCopilotLoading(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          balance: accountBalance
        })
      });
      const data = await response.json();
      if (response.ok) {
        setCopilotLogs(prev => [...prev, {
          sender: "copilot",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        setCopilotLogs(prev => [...prev, {
          sender: "copilot",
          text: `### ❌ Router Connection Failure\n\n${data.error || "Failed to parse copilot response stream."}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (err) {
      console.error(err);
      setCopilotLogs(prev => [...prev, {
        sender: "copilot",
        text: `### ❌ Network Failure\n\nUnable to reach server stream router. Ensure the dev server is active and try again.`,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleAddCustomTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTickerInput) return;
    setTickerError("");
    setIsAddingTicker(true);
    try {
      const response = await fetch("/api/add-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: customTickerInput })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCustomTickerInput("");
        setRefreshTrigger(prev => prev + 1);
        setSelectedAsset(data.asset.symbol);
      } else {
        setTickerError(data.error || "Ticker register failed");
      }
    } catch (err) {
      setTickerError("Error communicating with data pipeline");
      console.error(err);
    } finally {
      setIsAddingTicker(false);
    }
  };

  // Signal Generator state (computed from mock live analysis)
  const [signalsList, setSignalsList] = useState<any[]>([]);

  // Feed update trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch dynamic tickers and news on interval
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/market-data");
        const data = await res.json();
        setAssets(data.assets || []);
        setIngestionLogs(data.ingestion || []);
        setNews(data.news || []);
        setActivePositions(data.activePositions || []);
        setCompletedTrades(data.completedTrades || []);
      } catch (err) {
        console.error("Failed to fetch market ticks from platform server", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Fetch calendar once
  useEffect(() => {
    fetch("/api/economic-calendar")
      .then(r => r.json())
      .then(setCalendar)
      .catch(console.error);
  }, []);

  // Fetch historical data whenever selected asset or fresh updates trigger
  useEffect(() => {
    let active = true;
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/historical/${selectedAsset}?length=60`);
        const data = await res.json();
        if (active) setChartRecords(data.records || []);
      } catch (err) {
        console.error("Failed to load historical lines", err);
      }
    };
    fetchHistory();
    // Refresh history occasionally
    const interval = setInterval(fetchHistory, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedAsset]);

  // Dynamic UTC Clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().replace("Z", " UTC").slice(11, 23));
      // Latency fluctuation
      setSystemLatency(prev => Math.max(8, Math.min(24, Math.floor(prev + (Math.random() - 0.5) * 4))));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Generate mock static high-prob signals on load
  useEffect(() => {
    setSignalsList([
      { asset: "BTC", strategy: "Temporal Fusion Transformer", direction: "BUY", probability: 84, confidence: 91, return: 12.4, timeframe: "1h", status: "PENDING_CONSENSUS", regime: "Bullish Accumulation", sentimentScore: 78, fundamentalScore: 82, technicalScore: 85, riskScore: 12, date: "2026-06-21 12:00" },
      { asset: "GOLD", strategy: "Wavelet LSTM Oscillator", direction: "BUY", probability: 81, confidence: 85, return: 6.8, timeframe: "4h", status: "PENDING_CONSENSUS", regime: "Stagflation Hedging", sentimentScore: 85, fundamentalScore: 90, technicalScore: 78, riskScore: 8, date: "2026-06-21 08:30" },
      { asset: "AAPL", strategy: "Hidden Markov Market Regime AI", direction: "SELL", probability: 76, confidence: 79, return: -4.5, timeframe: "30m", status: "ACTIVE", regime: "Bearish Distribution", sentimentScore: 48, fundamentalScore: 64, technicalScore: 35, riskScore: 15, date: "2026-06-20 16:00" },
    ]);
  }, []);

  // Trigger server-side Multi-Agent Consensus
  const handleRunAgentConsensus = async () => {
    setIsAnalyzing(true);
    setAgentDebate(null);
    try {
      const response = await fetch("/api/agent-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: consensusAsset,
          direction: consensusDirection,
          timeframe: consensusTimeframe
        })
      });
      const data = await response.json();
      setAgentDebate(data);

      const currentDateNumeric = new Date().toISOString().replace('T', ' ').slice(0, 16);

      // Update signal list status dynamically to show committee feedback link
      setSignalsList(prev => prev.map(sig => {
        if (sig.asset === consensusAsset) {
          return {
            ...sig,
            status: "APPROVED_BY_COMMITTEE",
            probability: data.confidencePct,
            return: data.expectedReturnPct,
            technicalScore: consensusDirection === "BUY" ? 85 : 35,
            sl: data.sl,
            tp1: data.tp1,
            date: currentDateNumeric
          };
        }
        return sig;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger server-side quantitative backtest
  const handleRunBacktest = async () => {
    setIsBacktesting(true);
    setBacktestResult(null);
    try {
      const response = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: backtestAsset,
          strategy: backtestStrategy,
          horizon: backtestHorizon,
          frictionLevel: backtestFriction,
          riskThreshold: (riskPercentPerTrade / 100).toString(),
          balance: accountBalance
        })
      });
      const data = await response.json();
      setBacktestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBacktesting(false);
    }
  };

  // Run Digital Twin Pre-Flight simulator
  const handleRunDigitalTwin = async () => {
    setIsSimulatingTwin(true);
    setTwinResult(null);
    try {
      const response = await fetch("/api/digital-twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: twinAsset,
          direction: twinDirection,
          positionSize: parseFloat(twinSize),
          leverage: parseInt(twinLeverage)
        })
      });
      const data = await response.json();
      setTwinResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingTwin(false);
    }
  };

  // Execute actual paper order
  const handleExecutePaperOrder = async () => {
    if (!twinResult) return;
    try {
      // derive target stops based on consensus details if available
      const slMultiplier = twinDirection === "BUY" ? 0.96 : 1.04;
      const tp1Multiplier = twinDirection === "BUY" ? 1.05 : 0.95;
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: twinAsset,
          direction: twinDirection,
          positionSize: twinSize,
          entryPrice: twinResult.executionPrice,
          stopLoss: twinResult.executionPrice * slMultiplier,
          tp1: twinResult.executionPrice * tp1Multiplier,
          tp2: twinResult.executionPrice * tp1Multiplier * 1.05,
          tp3: twinResult.executionPrice * tp1Multiplier * 1.10,
          leverage: twinLeverage
        })
      });
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setTwinResult(null);
        setActiveTab("terminal");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Close Position
  const handleClosePosition = async (id: number) => {
    try {
      const res = await fetch("/api/close-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run Markowitz / Risk optimization weight recalibration
  const handleOptimizeWeights = () => {
    if (optimizationModel === "HRP") {
      setOptWeights({ AAPL: 12.5, TSLA: 5.2, BTC: 18.4, EURUSD: 35.8, GOLD: 20.1, SPX: 8.0 });
    } else if (optimizationModel === "BlackLitterman") {
      setOptWeights({ AAPL: 20.0, TSLA: 12.5, BTC: 30.0, EURUSD: 10.0, GOLD: 15.0, SPX: 12.5 });
    } else if (optimizationModel === "MeanVariance") {
      setOptWeights({ AAPL: 24.1, TSLA: 16.3, BTC: 5.0, EURUSD: 15.0, GOLD: 10.2, SPX: 29.4 });
    } else { // Risk Parity
      setOptWeights({ AAPL: 15.0, TSLA: 8.0, BTC: 10.0, EURUSD: 30.0, GOLD: 25.0, SPX: 12.0 });
    }
  };

  const activeAssetObj = assets.find(a => a.symbol === selectedAsset) || assets[0];

  // Custom calculation helper for drawing SVG candlesticks
  const renderSVGChart = () => {
    if (!chartRecords || chartRecords.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">
          [WAITING_FOR_TIMESERIES_FEED]
        </div>
      );
    }

    const padX = 40;
    const padY = 25;
    const width = 800;
    const height = 300;
    
    const chartHeight = height - padY * 2;
    const chartWidth = width - padX * 2;

    const closes = chartRecords.map(r => r.close);
    const highs = chartRecords.map(r => r.high);
    const lows = chartRecords.map(r => r.low);
    const minVal = Math.min(...lows) * 0.995;
    const maxVal = Math.max(...highs) * 1.005;
    const valRange = maxVal - minVal;

    const points = chartRecords.map((r, i) => {
      const x = padX + (i / (chartRecords.length - 1)) * chartWidth;
      const yClose = height - padY - ((r.close - minVal) / valRange) * chartHeight;
      const yOpen = height - padY - ((r.open - minVal) / valRange) * chartHeight;
      const yHigh = height - padY - ((r.high - minVal) / valRange) * chartHeight;
      const yLow = height - padY - ((r.low - minVal) / valRange) * chartHeight;
      const yMA = r.sma ? height - padY - ((r.sma - minVal) / valRange) * chartHeight : 0;
      const yUpper = r.upperBand ? height - padY - ((r.upperBand - minVal) / valRange) * chartHeight : 0;
      const yLower = r.lowerBand ? height - padY - ((r.lowerBand - minVal) / valRange) * chartHeight : 0;
      return { x, yClose, yOpen, yHigh, yLow, yMA, yUpper, yLower, raw: r };
    });

    // Create Path Strings for overlay parameters
    let linePath = `M ${points[0].x} ${points[0].yClose}`;
    let maPath = points[0].yMA ? `M ${points[0].x} ${points[0].yMA}` : "";
    let upperPath = points[0].yUpper ? `M ${points[0].x} ${points[0].yUpper}` : "";
    let lowerPath = points[0].yLower ? `M ${points[0].x} ${points[0].yLower}` : "";

    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].yClose}`;
      if (points[i].yMA) maPath += ` L ${points[i].x} ${points[i].yMA}`;
      if (points[i].yUpper) upperPath += ` L ${points[i].x} ${points[i].yUpper}`;
      if (points[i].yLower) lowerPath += ` L ${points[i].x} ${points[i].yLower}`;
    }

    // Accumulate shading data for Bollinger boundaries
    let bandPolygon = "";
    if (showBollinger && points[0].yUpper && points[0].yLower) {
      bandPolygon = `M ${points[0].x} ${points[0].yUpper}`;
      for (let i = 1; i < points.length; i++) {
        bandPolygon += ` L ${points[i].x} ${points[i].yUpper}`;
      }
      for (let i = points.length - 1; i >= 0; i--) {
        bandPolygon += ` L ${points[i].x} ${points[i].yLower}`;
      }
      bandPolygon += " Z";
    }

    return (
      <div className="relative w-full h-full bg-slate-950 p-2 rounded-lg border border-slate-800">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full"
          onMouseLeave={() => setHoverPoint(null)}
        >
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const val = minVal + p * valRange;
            const y = height - padY - p * chartHeight;
            return (
              <g key={idx} className="opacity-20">
                <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#475569" strokeDasharray="4 4" />
                <text x={padX - 8} y={y + 4} fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                  {val.toLocaleString(undefined, { maximumFractionDigits: selectedAsset === "EURUSD" ? 4 : 1 })}
                </text>
              </g>
            );
          })}

          {/* Time axis stamps */}
          {points.filter((_, idx) => idx % 12 === 0).map((pt, idx) => (
            <text key={idx} x={pt.x} y={height - 6} fill="#64748b" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">
              {pt.raw.timestamp}
            </text>
          ))}

          {/* Bollinger Shading */}
          {showBollinger && bandPolygon && (
            <path d={bandPolygon} fill="rgba(59, 130, 246, 0.04)" stroke="none" />
          )}

          {/* Bollinger boundaries lines */}
          {showBollinger && upperPath && (
            <path d={upperPath} fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.75" strokeDasharray="2 2" />
          )}
          {showBollinger && lowerPath && (
            <path d={lowerPath} fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="0.75" strokeDasharray="2 2" />
          )}

          {/* Moving average overlays */}
          {showMA && maPath && (
            <path d={maPath} fill="none" stroke="#eab308" strokeWidth="1.2" opacity="0.75" />
          )}

          {/* Core Candlesticks or Lines */}
          {chartType === "line" ? (
            <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.0" />
          ) : (
            points.map((pt, idx) => {
              const isBull = pt.raw.close >= pt.raw.open;
              const color = isBull ? "#10b981" : "#ef4444";
              const wickX = pt.x;
              const w = Math.max(3, chartWidth / points.length * 0.6);
              const rectX = pt.x - w / 2;
              const rectY = Math.min(pt.yOpen, pt.yClose);
              const rectH = Math.max(1, Math.abs(pt.yOpen - pt.yClose));

              return (
                <g 
                  key={idx} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverPoint(pt.raw)}
                >
                  {/* Wick */}
                  <line x1={wickX} y1={pt.yHigh} x2={wickX} y2={pt.yLow} stroke={color} strokeWidth="1.2" />
                  {/* Candle Body */}
                  <rect x={rectX} y={rectY} width={w} height={rectH} fill={color} stroke={color} strokeWidth="0.5" />
                </g>
              );
            })
          )}

          {/* Interactive cursor line */}
          {hoveredPoint && (
            <g>
              {/* Find coordinates */}
              {(() => {
                const idx = chartRecords.findIndex(r => r.timestamp === hoveredPoint.timestamp);
                if (idx === -1) return null;
                const pt = points[idx];
                return (
                  <>
                    <line x1={pt.x} y1={padY} x2={pt.x} y2={height - padY} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                    <line x1={padX} y1={pt.yClose} x2={width - padX} y2={pt.yClose} stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
                    <circle cx={pt.x} cy={pt.yClose} r="4" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Floating crosshair tooltip data */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div 
              style={{ contentVisibility: 'auto' }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 left-12 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded flex gap-4 text-xs font-mono select-none"
            >
              <div>TIME: <span className="text-slate-300">{hoveredPoint.timestamp}</span></div>
              <div>OPEN: <span className="text-slate-300">{hoveredPoint.open.toFixed(selectedAsset === "EURUSD" ? 4 : 2)}</span></div>
              <div>HIGH: <span className="text-emerald-400">{hoveredPoint.high.toFixed(selectedAsset === "EURUSD" ? 4 : 2)}</span></div>
              <div>LOW: <span className="text-red-400">{hoveredPoint.low.toFixed(selectedAsset === "EURUSD" ? 4 : 2)}</span></div>
              <div>CLOSE: <span className="text-emerald-400">{hoveredPoint.close.toFixed(selectedAsset === "EURUSD" ? 4 : 2)}</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Main UI frame
  return (
    <div id="trading-platform-root" className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-[#020617]/90 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-500/30">
            <Activity className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight tracking-tight flex items-center gap-2">
              QUANTUM<span className="text-blue-500">OS</span> <span className="text-xs font-mono text-blue-400 border border-blue-500/30 px-1.5 py-0.2 rounded bg-blue-500/5 uppercase">V4.9 TERMINAL</span>
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-0.5">INSTITUTIONAL PORTFOLIO COMPASS</p>
          </div>
        </div>

        {/* Global Ingestion metrics feed ticker */}
        <div className="hidden lg:flex items-center gap-6 border-l border-r border-slate-800 px-6 py-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">Ingestion:</span>
            <span className="text-slate-200">99.8% OK</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-slate-400 text-[11px] uppercase tracking-wider">Features:</span>
            <span className="text-slate-200 font-bold">1,402 stored</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-400 text-[11px] uppercase tracking-wider">Active Models:</span>
            <span className="text-slate-200">12 Parallel</span>
          </div>
        </div>

        {/* Real-time Time Clock and Latency */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#0f172a] border border-slate-800 rounded-md py-1 px-3 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span>{systemLatency}ms</span>
          </div>
          <div className="bg-[#0f172a] border border-slate-800 rounded-md py-1 px-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{utcTime || "00:00:00 UTC"}</span>
          </div>
        </div>
      </header>
      
      {/* SUB-HEADER BENTO TABS CONTROL */}
      <div className="border-b border-slate-800 bg-[#0f172a]/30 p-2 flex flex-wrap gap-2 items-center justify-between px-6">
        <nav className="flex flex-wrap gap-1">
          {[
            { id: "terminal", label: "TICKER TERMINAL", icon: BarChart3 },
            { id: "copilot", label: "AI PORTFOLIO COPILOT", icon: Layers },
            { id: "research", label: "AI RESEARCH PANEL", icon: Workflow },
            { id: "backtester", label: "QUANT LAB & BACKTEST", icon: Binary },
            { id: "risk", label: "RISK & PORTFOLIO ENGINE", icon: Sliders },
            { id: "twin", label: "DIGITAL TWIN ROUTER", icon: Cpu },
          ].map(tab => {
            const IconComp = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs font-medium tracking-wide transition-all ${
                  active 
                    ? "bg-[#0f172a] text-blue-400 border border-slate-800 shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <IconComp className={`h-3.5 w-3.5 ${active ? "text-blue-400" : "text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Paper balance summary */}
        <div className="flex gap-4 font-mono text-xs border border-slate-800/40 px-3 py-1.5 rounded-lg bg-[#0f172a]/50">
          <div className="text-slate-500">PAPER BAL: <span className="text-slate-200">${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <div className="text-slate-500">NET EXPOSURE: <span className="text-slate-200">$25,000.00</span></div>
        </div>
      </div>

      {/* CORE BODY GRID */}
      <main className="flex-1 p-6 max-w-[1800px] w-full mx-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB: AI PORTFOLIO COPILOT */}
          {activeTab === "copilot" && (
            <motion.div
              style={{ contentVisibility: 'auto' }}
              key="copilot-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* LEFT 7 COLUMNS: COPILOT TERMINAL DIALOG */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl h-[600px] flex flex-col justify-between">
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <h3 className="text-base font-display font-semibold text-slate-200">Apex Institutional Portfolio Copilot</h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">Free public data streams & instant portfolio alignment calculations</p>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                        <Cpu className="h-3.5 w-3.5 animate-pulse" />
                        <span>COSMIC COGNITION ONLINE</span>
                      </div>
                    </div>

                    {/* Chat Logs Window */}
                    <div className="space-y-4 overflow-y-auto pr-2 flex-grow flex flex-col gap-2 font-mono text-xs max-h-[380px]">
                      {copilotLogs.map((log, idx) => {
                        const isUser = log.sender === "user";
                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                              isUser 
                                ? "bg-blue-600/10 border border-blue-500/25 ml-auto text-slate-200" 
                                : "bg-[#020617]/70 border border-slate-800 mr-auto text-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 mb-1 border-b border-slate-800/50 pb-1 text-[9px] text-slate-500">
                              <span className="font-bold uppercase tracking-wider">{isUser ? "[USER INTERFACE CLIENT]" : "[APEX PORTFOLIO COPILOT]"}</span>
                              <span>{log.timestamp}</span>
                            </div>
                            <div className="markdown-body leading-relaxed prose prose-invert max-w-none">
                              <ReactMarkdown>{log.text}</ReactMarkdown>
                            </div>
                          </div>
                        );
                      })}
                      
                      {isCopilotLoading && (
                        <div className="bg-[#020617]/50 border border-slate-850/60 p-3 rounded-lg mr-auto text-slate-500 flex items-center gap-2 max-w-[50%] animate-pulse">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-400" />
                          <span>Deliberating optimal asset consensus...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit message form */}
                  <form onSubmit={handleSendCopilotPrompt} className="border-t border-slate-800/80 pt-4 mt-4 flex gap-2">
                    <input
                      type="text"
                      value={copilotInput}
                      onChange={(e) => setCopilotInput(e.target.value)}
                      placeholder="Type custom queries (e.g. 'Show my balance and exact asset price', 'Is BTC going up?')..."
                      disabled={isCopilotLoading}
                      className="flex-1 bg-[#020617]/85 border border-slate-800 rounded-lg py-2.5 px-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={isCopilotLoading || !copilotInput.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-2 px-5 rounded-lg font-mono text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                    >
                      <span>TRANSMIT</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT 5 COLUMNS: PORTFOLIO ENGINE & CORE WATCHLIST DISPATCH */}
              <div className="lg:col-span-5 flex flex-col gap-6 font-mono text-xs">
                
                {/* Active Balance Monitor */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">ACTIVE BALANCES & RISK OVERRIDES</h3>
                  
                  <div className="space-y-4 bg-[#020617]/50 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Editable Account Balance ($):</span>
                        <input 
                          type="number"
                          value={accountBalance}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setAccountBalance(isNaN(val) ? 0 : val);
                          }}
                          className="bg-[#020617] border border-slate-800 rounded px-2.5 py-0.5 text-xs text-blue-400 font-bold w-[160px] text-right focus:outline-none focus:border-blue-500/50"
                          placeholder="Arbitrary Amount"
                        />
                      </div>
                      <input 
                        type="range" 
                        min={Math.min(0, accountBalance)}
                        max={Math.max(1000000, accountBalance)}
                        step="100"
                        value={accountBalance} 
                        onChange={(e) => setAccountBalance(Number(e.target.value))}
                        className="w-full h-1 accent-blue-500 cursor-pointer" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Capital Risk per Trade (%):</span>
                        <input 
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10.0"
                          value={riskPercentPerTrade}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setRiskPercentPerTrade(isNaN(val) ? 0 : val);
                          }}
                          className="bg-[#020617] border border-slate-800 rounded px-2 py-0.5 text-xs text-blue-400 font-bold w-[80px] text-right focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="10.0" 
                        step="0.1"
                        value={riskPercentPerTrade} 
                        onChange={(e) => setRiskPercentPerTrade(Number(e.target.value))}
                        className="w-full h-1 accent-blue-500 cursor-pointer" 
                      />
                    </div>

                    <div className="border-t border-slate-800/80 pt-3.5 space-y-2">
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>CAPITAL RISK AMOUNT:</span>
                        <span className="text-blue-400 font-extrabold">${(accountBalance * (riskPercentPerTrade / 100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>SIM TRANSACTIONS SECURITY:</span>
                        <span className="text-emerald-400 font-extrabold">SECURE • COMPLIANT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live public asset prices ticker ledger */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl flex-1 max-h-[310px] overflow-y-auto">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-3 uppercase">REAL-TIME PUBLIC FEED SYNC (Yahoo / Coinbase)</h3>
                  <div className="space-y-1.5">
                    {assets.map((ast) => {
                      const dayChangePct = ((ast.price - ast.open) / ast.open) * 100;
                      const isUp = dayChangePct >= 0;
                      return (
                        <div key={ast.symbol} className="flex justify-between items-center p-2.5 bg-[#020617]/50 border border-slate-800/60 hover:border-slate-700/35 rounded-lg transition-all">
                          <div>
                            <span className="font-bold text-slate-100">{ast.symbol}</span>
                            <span className="text-[9px] text-slate-500 ml-2 italic">{ast.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-200 font-mono">
                              ${ast.price.toLocaleString(undefined, { minimumFractionDigits: ast.symbol === "EURUSD" ? 4 : 2 })}
                            </div>
                            <div className={`text-[9px] font-bold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                              {isUp ? "+" : ""}{dayChangePct.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 1: TERMINAL & CHART DASHBOARD */}
          {activeTab === "terminal" && (
            <motion.div
              style={{ contentVisibility: 'auto' }}
              key="terminal-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-6"
            >
              {/* LEFT 3 COLUMNS: LIVE WATCHLIST & TICK STATISTICS */}
              <div className="xl:col-span-3 flex flex-col gap-6">
                
                {/* Watchlist card */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">CORES WATCHLIST</h2>
                    <ListFilter className="h-4 w-4 text-slate-500 cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    {assets.map((ast) => {
                      const isSelected = ast.symbol === selectedAsset;
                      const dayChangePct = ((ast.price - ast.open) / ast.open) * 100;
                      return (
                        <div
                          key={ast.symbol}
                          onClick={() => setSelectedAsset(ast.symbol)}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                            isSelected 
                              ? "bg-blue-600/10 border-blue-500/40" 
                              : "bg-transparent border-transparent hover:bg-slate-800/30"
                          }`}
                        >
                          <div>
                            <div className="font-mono text-xs font-bold text-slate-100">{ast.symbol}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{ast.name}</div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <div className="font-mono text-xs font-semibold">
                              {ast.price.toLocaleString(undefined, { minimumFractionDigits: ast.symbol === "EURUSD" ? 4 : 2 })}
                            </div>
                            <span className={`text-[10px] font-mono flex items-center gap-0.5 ${dayChangePct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {dayChangePct >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                              {dayChangePct >= 0 ? "+" : ""}{dayChangePct.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add dynamic ticker from public API */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/50 font-mono text-[11px]">
                    <div className="text-[10px] text-slate-400/90 mb-1.5 uppercase tracking-wider font-bold">Add Custom Asset Ticker</div>
                    <form onSubmit={handleAddCustomTicker} className="flex gap-1.5">
                      <input 
                        type="text"
                        placeholder="e.g. NVDA, SOL-USD, GBPUSD=X"
                        value={customTickerInput}
                        onChange={(e) => setCustomTickerInput(e.target.value.toUpperCase().trim())}
                        className="flex-1 bg-[#020617] border border-slate-800/80 rounded px-2.5 py-1.5 text-[11px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40"
                        disabled={isAddingTicker}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-550 active:bg-blue-750 text-white rounded px-3 py-1.5 transition-all text-[10px] font-bold shrink-0 flex items-center justify-center min-w-[50px] cursor-pointer"
                        disabled={isAddingTicker}
                      >
                        {isAddingTicker ? "..." : "ADD"}
                      </button>
                    </form>
                    {tickerError && <div className="text-[9px] text-rose-400 mt-1">{tickerError}</div>}
                  </div>
                </div>

                {/* Selected Asset Metric Details */}
                {activeAssetObj && (
                  <div className="bg-[#0f172a]/40 backdrop-blur-sm p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl font-mono text-xs space-y-3">
                    <h3 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">REAL-TIME INGESTION METRICS ({activeAssetObj.symbol})</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#020617]/50 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <div className="text-slate-500">24h Volume</div>
                        <div className="text-slate-200 font-bold">${Math.floor(activeAssetObj.volume / 1000).toLocaleString()}k</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Asset Spread</div>
                        <div className="text-slate-200 font-bold">{activeAssetObj.spread}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Daily Open</span>
                        <span className="text-slate-300">{activeAssetObj.open}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Daily High</span>
                        <span className="text-emerald-400">{activeAssetObj.high}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Daily Low</span>
                        <span className="text-rose-400">{activeAssetObj.low}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Macro Regime</span>
                        <span className="text-indigo-400 font-bold text-[10px]">{activeAssetObj.macroCycle}</span>
                      </div>
                    </div>

                    {/* Order Book Depth Visualizer */}
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">L2 DEPTH REGISTER</div>
                      <div className="space-y-1 text-[11px]">
                        {activeAssetObj.orderBook.asks.map((ask, i) => (
                          <div key={i} className="flex justify-between text-rose-400/80">
                            <span>{ask.price.toFixed(selectedAsset === "EURUSD" ? 4 : 2)}</span>
                            <span className="text-slate-500 font-mono">vol: <span className="text-slate-300">{ask.size}</span></span>
                          </div>
                        ))}
                        <div className="border-b border-dashed border-slate-800 my-1"></div>
                        {activeAssetObj.orderBook.bids.map((bid, i) => (
                          <div key={i} className="flex justify-between text-emerald-400/80">
                            <span>{bid.price.toFixed(selectedAsset === "EURUSD" ? 4 : 2)}</span>
                            <span className="text-slate-500 font-mono">vol: <span className="text-slate-300">{bid.size}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER 6 COLUMNS: CHART & ORDER/POSITIONS */}
              <div className="xl:col-span-6 flex flex-col gap-6">
                
                {/* Chart main container */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl flex flex-col h-[480px]">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
                        {activeAssetObj?.symbol} <span className="text-xs font-mono font-normal text-slate-500">{activeAssetObj?.name}</span>
                      </div>
                      <div className="text-sm font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">
                        ${activeAssetObj?.price.toLocaleString(undefined, { minimumFractionDigits: activeAssetObj?.symbol === "EURUSD" ? 4 : 2 })}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <button 
                        onClick={() => setChartType("candle")} 
                        className={`px-2.5 py-1 rounded ${chartType === "candle" ? "bg-blue-600/15 border border-blue-500/30 text-blue-400" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Candles
                      </button>
                      <button 
                        onClick={() => setChartType("line")} 
                        className={`px-2.5 py-1 rounded ${chartType === "line" ? "bg-blue-600/15 border border-blue-500/30 text-blue-400" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        Line
                      </button>
                      <div className="h-4 w-px bg-slate-800 mx-1"></div>
                      <label className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200">
                        <input type="checkbox" checked={showBollinger} onChange={(e) => setShowBollinger(e.target.checked)} className="accent-blue-500 h-3 w-3" />
                        Bollinger
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer text-slate-400 hover:text-slate-200">
                        <input type="checkbox" checked={showMA} onChange={(e) => setShowMA(e.target.checked)} className="accent-blue-500 h-3 w-3" />
                        MA_Overlay
                      </label>
                    </div>
                  </div>

                  <div className="flex-1">
                    {renderSVGChart()}
                  </div>
                </div>

                {/* Sub pane: Active Portfolios Positions */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 mb-4 uppercase">ACTIVE EXCHANGING POSITIONS</h3>
                  {activePositions.length === 0 ? (
                    <div className="h-16 flex items-center justify-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-lg">
                      [NO_ACTIVE_POSITIONS_IN_CLEARING]
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-slate-850 text-slate-500 pb-2">
                            <th className="py-2">ASSET</th>
                            <th>DIR</th>
                            <th>ENTRY</th>
                            <th>MARK</th>
                            <th>LEVERAGE</th>
                            <th>POSITION</th>
                            <th>UNREALIZED PnL</th>
                            <th className="text-right">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activePositions.map((pos) => {
                            const isBuy = pos.direction === "BUY";
                            const dayChangePct = ((activeAssetObj?.price - pos.entryPrice) / pos.entryPrice) * (isBuy ? 1 : -1) * pos.leverage * 100;
                            const termPnl = pos.positionSize * (dayChangePct / 100);

                            return (
                              <tr key={pos.id} className="border-b border-slate-850/60 hover:bg-[#020617]/40 transition-colors">
                                <td className="py-3 font-semibold text-slate-100">{pos.symbol}</td>
                                <td className={isBuy ? "text-emerald-400" : "text-rose-400"}>{pos.direction}</td>
                                <td>{pos.entryPrice}</td>
                                <td>{activeAssetObj?.symbol === pos.symbol ? activeAssetObj.price : pos.entryPrice}</td>
                                <td>{pos.leverage}x</td>
                                <td>${pos.positionSize.toLocaleString()}</td>
                                <td className={termPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                  ${termPnl.toFixed(2)} ({termPnl >= 0 ? "+" : ""}{dayChangePct.toFixed(2)}%)
                                </td>
                                <td className="text-right">
                                  <button 
                                    onClick={() => handleClosePosition(pos.id)}
                                    className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-100 px-2 py-1 rounded border border-rose-500/20 transition-all text-[11px]"
                                  >
                                    Liquidate
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT 3 COLUMNS: FRED ECONOMICS CALENDAR & NEWS SENTIMENT REGISTRY */}
              <div className="xl:col-span-3 flex flex-col gap-6">
                
                {/* Ingestion feed stream */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl max-h-[220px] flex flex-col">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 mb-3 uppercase flex items-center justify-between">
                    <span>LIVE INGESTION MATRIX</span>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-500" />
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
                    {ingestionLogs.map((log, i) => {
                      const color = log.level === "success" ? "text-emerald-400" : log.level === "warn" ? "text-amber-400" : "text-blue-400";
                      return (
                        <div key={i} className="flex gap-1.5 border-b border-slate-850 pb-0.5">
                          <span className="text-slate-600">[{log.timestamp}]</span>
                          <span className={color}>{log.log}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FRED Economic Calendar */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl font-mono text-xs">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-3 uppercase">FRED ECONOMIC ANNEX</h3>
                  <div className="space-y-3">
                    {calendar.map((ev, i) => {
                      const priority = ev.impact === "CRITICAL" ? "bg-red-500 text-white" : ev.impact === "HIGH" ? "bg-orange-500 text-white" : "bg-blue-600 text-white";
                      return (
                        <div key={i} className="bg-[#020617]/50 p-2.5 rounded-lg border border-slate-800/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-slate-400 italic">{ev.date}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${priority}`}>
                              {ev.impact}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-200 font-semibold leading-tight">{ev.event}</div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] mt-1 text-slate-500">
                            <div>Est: {ev.forecast}</div>
                            <div>Act: <span className="text-slate-300">{ev.actual}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* News NLP Sentiment */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl font-mono text-xs">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-3 uppercase">NLP SENTIMENT STREAM</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {news.map((item) => {
                      const isPos = item.sentiment === "positive";
                      const color = isPos ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5";
                      return (
                        <div key={item.id} className={`p-2.5 rounded-lg border ${color} space-y-1`}>
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>[{item.timestamp}]</span>
                            <span className={isPos ? "text-emerald-400" : "text-rose-400 font-bold"}>
                              {item.sentiment.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{item.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: AI RESEARCH PANEL (SIGNALS & MULTI-AGENT COMMITTEE CONSTITUTIONS) */}
          {activeTab === "research" && (
            <motion.div
              style={{ contentVisibility: 'auto' }}
              key="research-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left Column (5 Cols) - Signals pipeline */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 mb-1 uppercase">SIGNAL CLASSIFIER MATRIX</h3>
                  <p className="text-slate-500 text-xs mb-4">Probability metrics filtered above default 75% system budget trigger.</p>
                  
                  <div className="space-y-4 font-mono">
                    {signalsList.map((sig, idx) => {
                      const isBuy = sig.direction === "BUY";
                      const livePrice = assets.find(a => a.symbol === sig.asset)?.price;
                      const entrancePrice = livePrice || (sig.asset === "BTC" ? 64200.00 : sig.asset === "GOLD" ? 2320.00 : sig.asset === "AAPL" ? 182.40 : 1.0850);
                      
                      let stopLoss = sig.sl;
                      if (!stopLoss) {
                        stopLoss = isBuy ? entrancePrice * 0.98 : entrancePrice * 1.02;
                      }
                      
                      const slDist = Math.abs(entrancePrice - stopLoss);
                      const riskAmount = accountBalance * (riskPercentPerTrade / 100);
                      
                      let lotSizeString = "";
                      if (sig.asset === "EURUSD") {
                        const units = riskAmount / Math.max(0.0001, slDist);
                        const lots = units / 100000;
                        lotSizeString = `${lots.toFixed(2)} Lots`;
                      } else if (sig.asset === "BTC") {
                        const units = riskAmount / Math.max(1, slDist);
                        lotSizeString = `${units.toFixed(3)} BTC Lots`;
                      } else if (sig.asset === "GOLD") {
                        const ounces = riskAmount / Math.max(0.1, slDist);
                        const goldLots = ounces / 100;
                        lotSizeString = `${goldLots.toFixed(2)} GOLD Lots`;
                      } else {
                        const shares = riskAmount / Math.max(0.01, slDist);
                        lotSizeString = `${Math.floor(shares).toLocaleString()} Contract Units`;
                      }

                      return (
                        <div key={idx} className="bg-[#020617]/50 p-4 rounded-xl border border-slate-800/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-100">{sig.asset}</span>
                              <span className="text-[10px] text-slate-400 border border-slate-800 px-1 py-0.2 rounded bg-[#020617]">{sig.strategy}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isBuy ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                              {sig.direction}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px] text-center bg-[#020617]/30 p-2 rounded-lg border border-slate-850/40">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">Win Prob</div>
                              <div className="text-slate-200 font-bold">{sig.probability}%</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                              <div className="text-slate-200 font-bold">{sig.confidence || 85}%</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase">Est Return</div>
                              <div className="text-slate-200 font-bold">{sig.return}%</div>
                            </div>
                          </div>

                          {/* Dynamic execution metrics depending on risk management and balance */}
                          <div className="bg-[#020617]/80 p-3 rounded-lg border border-slate-850 space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-500">ENTRANCE PRICE:</span>
                              <span className="text-slate-200 font-semibold">${entrancePrice.toLocaleString(undefined, { minimumFractionDigits: sig.asset === "EURUSD" ? 4 : 2, maximumFractionDigits: sig.asset === "EURUSD" ? 4 : 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">STOP LOSS LEVEL:</span>
                              <span className="text-rose-400 font-semibold">${stopLoss.toLocaleString(undefined, { minimumFractionDigits: sig.asset === "EURUSD" ? 4 : 2, maximumFractionDigits: sig.asset === "EURUSD" ? 4 : 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">CAPITAL RISK BUDGET:</span>
                              <span className="text-blue-400 font-semibold">{riskPercentPerTrade}% (${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-800/60 pt-1.5">
                              <span className="text-slate-400 font-bold">CALCULATED LOT SIZE:</span>
                              <span className="text-emerald-400 font-bold">{lotSizeString}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px]">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-slate-500">Regime: <span className="text-slate-300 font-bold">{sig.regime}</span></span>
                              <span className="text-slate-500">Signals Date: <span className="text-slate-300 font-bold">{sig.date}</span></span>
                            </div>
                            <button
                              onClick={() => {
                                setConsensusAsset(sig.asset);
                                setConsensusDirection(sig.direction);
                                setConsensusTimeframe(sig.timeframe);
                              }}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-600/10 hover:bg-blue-600/15 border border-blue-500/25 rounded px-2.5 py-1 transition-all"
                            >
                              Inspect Committee <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Adjust Thresholds panel */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl font-mono text-xs">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-3 uppercase">RISK THRESHOLD CONTROLLERS</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 font-mono">
                        <span className="text-slate-400">Account Balance ($):</span>
                        <input 
                          type="number"
                          value={accountBalance}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setAccountBalance(isNaN(val) ? 0 : val);
                          }}
                          className="bg-[#020617] border border-slate-800 rounded px-2 py-0.5 text-xs text-blue-400 font-bold w-[150px] text-right focus:outline-none focus:border-blue-500/50"
                          placeholder="Arbitrary Amount"
                        />
                      </div>
                      <input 
                        type="range" 
                        min={Math.min(0, accountBalance)}
                        max={Math.max(1000000, accountBalance)}
                        step="100"
                        value={accountBalance} 
                        onChange={(e) => setAccountBalance(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer animate-none" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-400">Capital Risk per Position (%):</span>
                        <input 
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10.0"
                          value={riskPercentPerTrade}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setRiskPercentPerTrade(isNaN(val) ? 0 : val);
                          }}
                          className="bg-[#020617] border border-slate-800 rounded px-2 py-0.5 text-xs text-blue-400 font-bold w-[80px] text-right focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="10.0" 
                        step="0.1"
                        value={riskPercentPerTrade} 
                        onChange={(e) => setRiskPercentPerTrade(Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer animate-none" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Minimum Win Probability Threshold:</span>
                        <span className="text-blue-400 font-bold">80%</span>
                      </div>
                      <input type="range" min="60" max="95" defaultValue="80" className="w-full accent-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Risk Reward Ratio Cap:</span>
                        <span className="text-blue-400 font-bold font-mono">2.5 : 1</span>
                      </div>
                      <input type="range" min="15" max="40" defaultValue="25" className="w-full accent-blue-500" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span>Adversarial High-News Pause:</span>
                      <input type="checkbox" defaultChecked className="accent-blue-400 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Committee Area (7 Cols) */}
              <div className="lg:col-span-7">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                      <div>
                        <h3 className="text-base font-display font-semibold text-slate-200">AI Investment Committee Debate</h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">Triggers active debate among model parameters via Gemini API 3.5-Flash</p>
                      </div>

                      {/* Select target for committee */}
                      <div className="flex gap-2 font-mono text-xs">
                        <select 
                          value={consensusAsset} 
                          onChange={(e) => setConsensusAsset(e.target.value)}
                          className="bg-[#020617] border border-slate-800 p-1.5 rounded text-xs text-slate-200"
                        >
                          {assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                        </select>
                        <select 
                          value={consensusDirection} 
                          onChange={(e) => setConsensusDirection(e.target.value as any)}
                          className="bg-[#020617] border border-slate-800 p-1.5 rounded text-xs text-slate-200"
                        >
                          <option value="BUY">BUY</option>
                          <option value="SELL">SELL</option>
                        </select>
                      </div>
                    </div>

                    {isAnalyzing ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                        <div className="font-mono text-xs text-slate-400">
                          [INITIATING_GEMINI_MULTI_AGENT_COMMITTEE_DELIBERATIONS]
                          <div className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">Evaluating FRED macroeconomic pressures, SEC cash flows, daily VaR indices, and volume profiles...</div>
                        </div>
                      </div>
                    ) : agentDebate ? (
                      <div className="space-y-4 font-mono text-xs max-h-[500px] overflow-y-auto pr-2">
                        
                        {/* CIO verdict banner */}
                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3.5 flex items-center justify-between mb-4">
                          <div>
                            <div className="text-[10px] text-slate-400 font-semibold uppercase">Committee Joint Consensus Verdict</div>
                            <div className="text-sm font-bold text-blue-400 mt-1">{agentDebate.finalVerdict} ({agentDebate.confidencePct}% Confidence)</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase">Est Return</div>
                            <div className="text-xs font-bold text-slate-100">{agentDebate.expectedReturnPct}%</div>
                          </div>
                        </div>

                        {/* Agents forum posts */}
                        <div className="space-y-3">
                          <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-400 uppercase">
                              <Cpu className="h-3.5 w-3.5" /> CIO Summary
                            </div>
                            <p className="text-slate-300 leading-snug">{agentDebate.cio}</p>
                          </div>

                          <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase">
                              <Binary className="h-3.5 w-3.5" /> Macro Analyst
                            </div>
                            <p className="text-slate-300 leading-snug">{agentDebate.macro}</p>
                          </div>

                          <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-violet-400 uppercase">
                              <BarChart3 className="h-3.5 w-3.5" /> Technical Analyst
                            </div>
                            <p className="text-slate-300 leading-snug">{agentDebate.technical}</p>
                          </div>

                          <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase">
                              <Database className="h-3.5 w-3.5" /> Fundamental Analyst
                            </div>
                            <p className="text-slate-300 leading-snug">{agentDebate.fundamental}</p>
                          </div>

                          <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase">
                              <Zap className="h-3.5 w-3.5" /> Sentiment Analyst
                            </div>
                            <p className="text-slate-300 leading-snug">{agentDebate.sentiment}</p>
                          </div>

                          <div className="bg-[#020617]/50 p-3 rounded-lg border border-slate-800 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 uppercase">
                              <ShieldAlert className="h-3.5 w-3.5" /> Risk Officer Brief
                            </div>
                            <p className="text-slate-300 leading-snug">{agentDebate.risk}</p>
                          </div>
                        </div>

                        {/* Trade recommendations target levels */}
                        <div className="grid grid-cols-4 gap-2 bg-[#020617]/60 p-3 rounded-lg border border-slate-800/60 text-[11px] font-mono mt-4">
                          <div>
                            <div className="text-slate-500 text-[10px] uppercase">STOP LOSS</div>
                            <div className="text-rose-400 font-bold font-mono">{agentDebate.sl}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px] uppercase">TARGET P1</div>
                            <div className="text-emerald-400 font-bold font-mono">{agentDebate.tp1}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px] uppercase">TARGET P2</div>
                            <div className="text-slate-300 font-bold font-mono">{agentDebate.tp2}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px] uppercase">TARGET P3</div>
                            <div className="text-slate-300 font-bold font-mono">{agentDebate.tp3}</div>
                          </div>
                        </div>

                        {/* Dynamic position sizing & risk matrix */}
                        {(() => {
                          const assetPrice = assets.find(a => a.symbol === consensusAsset)?.price || (consensusAsset === "BTC" ? 64200.00 : consensusAsset === "GOLD" ? 2320.00 : consensusAsset === "AAPL" ? 182.40 : 1.0850);
                          const isBuy = consensusDirection === "BUY";
                          const stopLoss = agentDebate.sl || (isBuy ? assetPrice * 0.98 : assetPrice * 1.02);
                          const slDist = Math.abs(assetPrice - stopLoss);
                          const riskAmount = accountBalance * (riskPercentPerTrade / 100);

                          let lotSizeString = "";
                          if (consensusAsset === "EURUSD") {
                            const units = riskAmount / Math.max(0.0001, slDist);
                            const lots = units / 100000;
                            lotSizeString = `${lots.toFixed(2)} Lots (${Math.floor(units).toLocaleString()} units)`;
                          } else if (consensusAsset === "BTC") {
                            const units = riskAmount / Math.max(1, slDist);
                            lotSizeString = `${units.toFixed(3)} BTC Lots`;
                          } else if (consensusAsset === "GOLD") {
                            const ounces = riskAmount / Math.max(0.1, slDist);
                            const goldLots = ounces / 100;
                            lotSizeString = `${goldLots.toFixed(2)} GOLD Lots (${ounces.toFixed(1)} oz)`;
                          } else {
                            const shares = riskAmount / Math.max(0.01, slDist);
                            lotSizeString = `${Math.floor(shares).toLocaleString()} Contract Units`;
                          }

                          return (
                            <div className="bg-blue-950/10 p-3.5 rounded-lg border border-blue-900/30 space-y-2.5 mt-4 text-[11px]">
                              <div className="text-blue-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                                <Sliders className="h-3 w-3 text-blue-400" /> Dynamic Risk-Weighted Position Sizing
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left font-mono">
                                <div>
                                  <div className="text-slate-500 uppercase text-[9px] mb-0.5">Entrance Price</div>
                                  <div className="text-slate-200 font-bold text-xs">${assetPrice.toLocaleString(undefined, { minimumFractionDigits: consensusAsset === "EURUSD" ? 4 : 2, maximumFractionDigits: consensusAsset === "EURUSD" ? 4 : 2 })}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 uppercase text-[9px] mb-0.5">Account Balance</div>
                                  <div className="text-slate-200 font-bold text-xs">${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 uppercase text-[9px] mb-0.5">Max Risk ({riskPercentPerTrade}%)</div>
                                  <div className="text-blue-450 font-bold text-xs">${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div>
                                  <div className="text-slate-500 uppercase text-[9px] mb-0.5">Calculated Lot Size</div>
                                  <div className="text-emerald-400 font-extrabold text-xs">{lotSizeString}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs">
                        <div>[STANDBY: INVESTMENT MEETING COMPLIANCE READY]</div>
                        <p className="text-[10px] mt-1 max-w-sm">Select an active asset and click below to draft a full simulated multi-agent debate brief from the committee.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4 flex gap-3">
                    <button
                      onClick={handleRunAgentConsensus}
                      disabled={isAnalyzing}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                    >
                      <Workflow className="h-4 w-4" />
                      Initiate Multi-Agent Committee Consensus
                    </button>
                    {agentDebate && (
                      <button
                        onClick={() => {
                          setTwinAsset(consensusAsset);
                          setTwinDirection(consensusDirection);
                          setActiveTab("twin");
                        }}
                        className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 py-2.5 px-4 rounded-lg font-mono text-xs cursor-pointer transition-all"
                      >
                        Send to Execution Router
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: BACKTESTER & WALK-FORWARD LAB */}
          {activeTab === "backtester" && (
            <motion.div
              style={{ contentVisibility: 'auto' }}
              key="backtest-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Backtester controller config panel (4 Columns) */}
              <div className="lg:col-span-4 flex flex-col gap-6 font-mono text-xs">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">SIMULATION LABORATORY CONFIGS</h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Benchmark Asset</label>
                      <select 
                        value={backtestAsset} 
                        onChange={(e) => setBacktestAsset(e.target.value)}
                        className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200 select-none"
                      >
                        {assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Forecasting Model Algorithm</label>
                      <select 
                        value={backtestStrategy} 
                        onChange={(e) => setBacktestStrategy(e.target.value)}
                        className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200"
                      >
                        <option value="Temporal Fusion Transformer">Temporal Fusion Transformer (TFT)</option>
                        <option value="Hidden Markov Regime">Hidden Markov Regime (HMM)</option>
                        <option value="Wavelet LSTM">Wavelet Transform + LSTM</option>
                        <option value="GARCH ARIMA">GARCH volatility + ARIMA</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500">Friction Cost</label>
                        <select 
                          value={backtestFriction} 
                          onChange={(e) => setBacktestFriction(e.target.value)}
                          className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200"
                        >
                          <option value="low">Low (0.02%)</option>
                          <option value="medium">Medium (0.08%)</option>
                          <option value="high">High (0.15% - slippage)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500">Sizing Risk</label>
                        <select 
                          value={backtestRisk} 
                          onChange={(e) => setBacktestRisk(e.target.value)}
                          className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200"
                        >
                          <option value="0.01">1% Risk cap</option>
                          <option value="0.02">2% Risk cap</option>
                          <option value="0.05">5% Aggressive</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500">Walk-Forward validation:</span>
                      <span className="text-blue-400 font-bold uppercase text-[10px]">ACTIVE</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRunBacktest}
                    disabled={isBacktesting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 transition-all"
                  >
                    <Play className="h-4 w-4" />
                    Run 30y Historical Validation
                  </button>
                </div>
              </div>

              {/* Backtester results panel (8 Columns) */}
              <div className="lg:col-span-8">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 mb-4 uppercase">HISTORICAL PERFORMANCE CURVES</h3>

                    {isBacktesting ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                        <span className="font-mono text-xs text-slate-500">Running Monte Carlo roll forward over historical dates...</span>
                      </div>
                    ) : backtestResult ? (
                      <div className="space-y-6 font-mono text-xs">
                        
                        {/* High level stats bento row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#020617]/50 p-4 rounded-xl border border-slate-800/80">
                          <div>
                            <div className="text-slate-500 text-[10px]">TOTAL RETURN</div>
                            <div className="text-sm font-bold text-blue-450">+{backtestResult.metrics.totalReturnPct}%</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px]">SHARPE RATIO</div>
                            <div className="text-sm font-bold text-slate-100">{backtestResult.metrics.sharpeRatio}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px]">MAX DRAWDOWN</div>
                            <div className="text-sm font-bold text-rose-450">--{backtestResult.metrics.maxDrawdownPct}%</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px]">PROFIT FACTOR</div>
                            <div className="text-sm font-bold text-slate-100">{backtestResult.metrics.profitFactor}</div>
                          </div>
                        </div>

                        {/* Custom Equity curve SVG chart */}
                        <div className="h-[200px] border border-slate-850 rounded-lg p-2.5 bg-[#020617]/40">
                          {(() => {
                            const curve = backtestResult.equityCurve;
                            const equities = curve.map(c => c.equity);
                            const minEq = Math.min(...equities) * 0.99;
                            const maxEq = Math.max(...equities) * 1.01;
                            const rangeEq = maxEq - minEq;

                            const pWidth = 700;
                            const pHeight = 180;
                            
                            const pts = curve.map((c, i) => {
                              const x = (i / (curve.length - 1)) * pWidth;
                              const y = pHeight - ((c.equity - minEq) / rangeEq) * pHeight;
                              return `${x},${y}`;
                            }).join(" ");

                            return (
                              <svg viewBox={`0 0 ${pWidth} ${pHeight}`} className="w-full h-full font-mono">
                                {/* Grid */}
                                {[0.25, 0.5, 0.75].map((p, idx) => (
                                  <line key={idx} x1="0" y1={pHeight * p} x2={pWidth} y2={pHeight * p} stroke="#475569" strokeDasharray="3 3" opacity="0.15" />
                                ))}
                                {/* Performance line */}
                                <polyline fill="none" stroke="#2563eb" strokeWidth="1.75" points={pts} />
                              </svg>
                            );
                          })()}
                          <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                            <span>REALLOCATION ENTRY</span>
                            <span>WALK FORWARD MID BOUND</span>
                            <span>COMPLETION METRIC</span>
                          </div>
                        </div>

                        {/* Sample trade list ledgers */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">SAMPLE LEDGER DETAILS</div>
                          <div className="overflow-x-auto max-h-[140px] overflow-y-auto">
                            <table className="w-full text-left font-mono text-[11px]">
                              <thead>
                                <tr className="text-slate-500 border-b border-slate-850 pb-1">
                                  <th className="pb-1">DAY</th>
                                  <th className="pb-1">ACTION</th>
                                  <th className="pb-1">ENTRY</th>
                                  <th className="pb-1">EXIT</th>
                                  <th className="pb-1">COSTS</th>
                                  <th className="pb-1 text-right">PnL</th>
                                </tr>
                              </thead>
                              <tbody>
                                {backtestResult.trades.map((tr) => (
                                  <tr key={tr.id} className="border-b border-slate-850/60 text-slate-300 hover:bg-[#020617]/45 transition-colors">
                                    <td className="py-1">{tr.timestamp}</td>
                                    <td className={tr.direction === "BUY" ? "text-emerald-400" : "text-rose-400"}>{tr.direction}</td>
                                    <td>${tr.entry}</td>
                                    <td>${tr.exit}</td>
                                    <td>${tr.costs}</td>
                                    <td className={`text-right ${tr.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                      ${tr.pnl} ({tr.pnlPct}%)
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs">
                        [STANDBY: QUANT ENGINE REALLOCATED TO IDLE]
                        <p className="text-[10px] mt-1 max-w-sm">Configure your modeling strategy in left-side controllers and click run backtest to startwalk forward validation.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 4: RISK & PORTFOLIO ENGINE */}
          {activeTab === "risk" && (
            <motion.div
              style={{ contentVisibility: 'auto' }}
              key="risk-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left optimization configs (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6 font-mono text-xs">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">PORTFOLIO OPTIMIZATION TARGET</h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Allocation Model</label>
                      <select 
                        value={optimizationModel} 
                        onChange={(e) => setOptimizationModel(e.target.value as any)}
                        className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200 select-none"
                      >
                        <option value="HRP">Hierarchical Risk Parity (HRP)</option>
                        <option value="BlackLitterman">Black-Litterman (Views-based)</option>
                        <option value="MeanVariance">Mean-Variance Optimization</option>
                        <option value="RiskParity">Standard Risk-Parity (CVaR bounds)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleOptimizeWeights}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 transition-all"
                  >
                    <Sliders className="h-4 w-4" />
                    Trigger Covariance Recalibration
                  </button>
                </div>
              </div>

              {/* Right portfolio weight chart / metrics (8 Cols) */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                
                {/* Weight allocations */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 mb-4 uppercase">MARKOWITZ PARITY DISTRIBUTION</h3>
                  <div className="space-y-3.5 pt-2">
                    {Object.entries(optWeights).map(([sym, w]) => (
                      <div key={sym} className="space-y-1 bg-[#020617]/50 p-2.5 rounded-lg border border-slate-800/60">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-200">{sym}</span>
                          <span className="text-blue-400">{(w as number).toFixed(1)}% Weight</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-650 to-indigo-500 h-full" style={{ width: `${w}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance VaR boundaries */}
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">PORTFOLIO COVARIANCE METRIC BOUNDS</h3>
                  
                  <div className="grid grid-cols-2 gap-4 bg-[#020617]/50 p-3.5 rounded-lg border border-slate-800/80">
                    <div>
                      <div className="text-slate-500 text-[10px]">95% Portfolio VaR</div>
                      <div className="text-sm font-bold text-slate-100">$2,410.80</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Expected Shortfall</div>
                      <div className="text-sm font-bold text-slate-100">$3,180.50</div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between border-b border-slate-850 pb-1">
                      <span className="text-slate-500">Portfolio Net Beta</span>
                      <span className="text-slate-200">1.18 (Moderately Bullish)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1">
                      <span className="text-slate-500">Max Historical Drawdown</span>
                      <span className="text-rose-400">14.82%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-1">
                      <span className="text-slate-500">Leverage Utilization Cap</span>
                      <span className="text-slate-200">25x System ceiling</span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <div className="font-semibold text-indigo-400 flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> Global Exposure Statement</div>
                    <p className="text-[10px] text-slate-400 mt-1">The system complies with global margin restrictions. High-impact news releases triggers auto-tightening of Kelly criteria parameters.</p>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 5: DIGITAL TWIN ROUTER & PLACE CUSTOM ORDER */}
          {activeTab === "twin" && (
            <motion.div
              style={{ contentVisibility: 'auto' }}
              key="twin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Order form console (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6 font-mono text-xs">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">BROKER EXECUTION ROUTER</h3>
                  
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Clearing Asset</label>
                      <select 
                        value={twinAsset} 
                        onChange={(e) => setTwinAsset(e.target.value)}
                        className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200 select-none"
                      >
                        {assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500">Direction</label>
                      <select 
                        value={twinDirection} 
                        onChange={(e) => setTwinDirection(e.target.value as any)}
                        className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200"
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500">Position Size ($)</label>
                        <input 
                          type="number" 
                          value={twinSize} 
                          onChange={(e) => setTwinSize(e.target.value)}
                          className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500">CME Leverage Cap</label>
                        <input 
                          type="number" 
                          value={twinLeverage} 
                          onChange={(e) => setTwinLeverage(e.target.value)}
                          className="bg-[#020617] border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200" 
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleRunDigitalTwin}
                    disabled={isSimulatingTwin}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 transition-all"
                  >
                    <Binary className="h-4 w-4" />
                    Verify Twin Pre-Flight Compliance
                  </button>
                </div>
              </div>

              {/* Digital Twin compliance checks & Monte Carlo trails (8 Cols) */}
              <div className="lg:col-span-8">
                <div className="bg-[#0f172a]/40 backdrop-blur-sm p-6 rounded-xl border border-slate-800/80 hover:border-slate-700/40 transition-all shadow-xl h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold tracking-widest text-slate-400 mb-4 uppercase">DIGITAL TWIN MONTE CARLO PROBABILITY PATHS</h3>

                    {isSimulatingTwin ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                        <span className="font-mono text-xs text-slate-500">Modeling geometric Brownian motion slippage with Order book ladder counts...</span>
                      </div>
                    ) : twinResult ? (
                      <div className="space-y-6 font-mono text-xs">
                        
                        {/* Simulation results numbers */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#020617]/50 p-4 rounded-xl border border-slate-800/80">
                          <div>
                            <div className="text-slate-500 text-[10px]">MARK PRICE</div>
                            <div className="text-xs font-bold text-slate-300">${twinResult.basePrice}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px]">EST EXECUTION</div>
                            <div className="text-xs font-bold text-blue-400">${twinResult.executionPrice}</div>
                          </div>
                          <div>
                            <div className="text-slate-500 text-[10px]">EST SLIPPAGE</div>
                            <div className="text-xs font-bold text-rose-450">{twinResult.slippagePct.toFixed(4)}%</div>
                          </div>
                        </div>

                        {/* Monte Carlo Visual Area using responsive paths */}
                        <div className="h-[140px] border border-slate-850 rounded-lg p-2 bg-[#020617]/40 relative overflow-hidden">
                          {(() => {
                            const paths = twinResult.paths;
                            const pWidth = 700;
                            const pHeight = 120;
                            const allVals = paths.flat();
                            const minV = Math.min(...allVals);
                            const maxV = Math.max(...allVals);
                            const rV = maxV - minV;

                            return (
                              <svg viewBox={`0 0 ${pWidth} ${pHeight}`} className="w-full h-full opacity-65 font-mono">
                                {paths.map((path, pIdx) => {
                                  const points = path.map((v, sIdx) => {
                                    const x = (sIdx / (path.length - 1)) * pWidth;
                                    const y = pHeight - ((v - minV) / rV) * pHeight;
                                    return `${x},${y}`;
                                  }).join(" ");

                                  return (
                                    <polyline 
                                      key={pIdx} 
                                      fill="none" 
                                      stroke={twinDirection === "BUY" ? "rgba(59, 130, 246, 0.35)" : "rgba(239, 68, 68, 0.35)"} 
                                      strokeWidth="0.5" 
                                      points={points} 
                                    />
                                  );
                                })}
                              </svg>
                            );
                          })()}
                        </div>

                        {/* Checkpoints list */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">COMPLIANCE SECURITIES CHECKLISTS</div>
                          <div className="space-y-1.5">
                            {twinResult.checks.map((c, idx) => {
                              const isApp = c.status === "APPROVED";
                              return (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-[#020617]/50 rounded-lg border border-slate-800/60">
                                  <div className="flex items-center gap-2">
                                    {isApp ? (
                                      <CheckSquare className="h-4 w-4 text-blue-400" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-rose-400 animate-pulse" />
                                    )}
                                    <span className="text-slate-200">{c.name}</span>
                                  </div>
                                  <span className="text-slate-500 text-[10px] italic">{c.info}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs">
                        [STANDBY: BROKER INTERACTION READY]
                        <p className="text-[10px] mt-1 max-w-sm">Determine order volume parameters in left panel and click verification run to clear limits.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4">
                    {twinResult && (
                      <button
                        onClick={handleExecutePaperOrder}
                        disabled={!twinResult.approved}
                        className={`w-full font-bold py-2.5 rounded-lg font-mono text-xs cursor-pointer flex items-center justify-center gap-2 transition-all ${
                          twinResult.approved 
                            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10" 
                            : "bg-slate-900/40 border border-slate-850 text-rose-400/80 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        {twinResult.approved ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Execute Compliant Order to Simulated Exchange Broker
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4" />
                            Execution Rejected: Breach of Volatility or Leverage Limits
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER BAR WITH REVENUE SUMMARY */}
      <footer className="border-t border-slate-900 bg-slate-950/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-slate-500 uppercase tracking-wider mt-auto select-none">
        <div>
          DESIGNED FOR INSTITUTIONAL TRADERS • APEX CORES ONLINE
        </div>
        <div className="flex gap-4">
          <span>SEC COUPLER: ACTIVE</span>
          <span>DISCLAIMER: DEMO PROTOCOL SYSTEM • PAUSED</span>
        </div>
      </footer>

    </div>
  );
}
