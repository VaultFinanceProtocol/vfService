import { cn } from "@lib/utils";

const ASSET_COLORS: Record<string, string> = {
  'ETH': 'bg-[#627EEA]',
  'WETH': 'bg-[#627EEA]',
  'USDC': 'bg-[#2775CA]',
  'USDT': 'bg-[#26A17B]',
  'DAI': 'bg-[#F5AC37]',
  'BTC': 'bg-[#F7931A]',
  'WBTC': 'bg-[#F7931A]',
};

interface AssetIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AssetIcon({ symbol, size = "md", className }: AssetIconProps) {
  const bgColor = ASSET_COLORS[symbol] || 'bg-brand';

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-md",
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
