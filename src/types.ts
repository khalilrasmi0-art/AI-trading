export interface Asset {
  symbol: string;
  name: string;
  category: "Stocks" | "Crypto" | "Forex" | "Commodities" | "Indices";
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  spread: number;
  orderBook: {
    bids: { price: number; size: number }[];
    asks: { price: number; size: number }[];
  };
  macroCycle: string;
}

export interface IngestionLog {
  timestamp: string;
  log: string;
  level: "info" | "warn" | "success";
}

export interface NewsItem {
  id: number;
  timestamp: string;
  title: string;
  sentiment: "positive" | "negative" | "neutral";
  volatilityImpact: number;
}

export interface ActivePosition {
  id: number;
  symbol: string;
  direction: "BUY" | "SELL";
  positionSize: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  leverage: number;
  timestamp: string;
  pnl: number;
  pnlPct: number;
}

export interface CompletedTrade {
  id: number;
  symbol: string;
  direction: "BUY" | "SELL";
  positionSize: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  leverage: number;
  timestamp: string;
  closeTimestamp: string;
  pnl: number;
  pnlPct: number;
}

export interface BacktestResult {
  symbol: string;
  strategy: string;
  metrics: {
    finalEquity: number;
    totalReturnPct: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;
    profitFactor: number;
    maxDrawdownPct: number;
    winRatePct: number;
    totalTrades: number;
  };
  equityCurve: {
    timestamp: string;
    equity: number;
    assetPrice: number;
  }[];
  trades: {
    id: number;
    timestamp: string;
    direction: "BUY" | "SELL";
    entry: number;
    exit: number;
    pnl: number;
    pnlPct: number;
    costs: number;
  }[];
}

export interface AgentDebate {
  cio: string;
  macro: string;
  technical: string;
  fundamental: string;
  sentiment: string;
  risk: string;
  finalVerdict: "BUY" | "SELL" | "HOLD";
  confidencePct: number;
  expectedReturnPct: number;
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
}

export interface DigitalTwinResult {
  symbol: string;
  direction: "BUY" | "SELL";
  basePrice: number;
  executionPrice: number;
  slippagePct: number;
  paths: number[][];
  checks: {
    name: string;
    status: "APPROVED" | "REJECTED";
    info: string;
  }[];
  approved: boolean;
}

export interface EconomicEvent {
  event: string;
  date: string;
  impact: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  forecast: string;
  actual: string;
}
