import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface KPICardProps {
  title: string;
  cnyValue?: number;
  dzdValue?: number;
  formattedPrimary?: string;
  formattedSecondary?: string;
  trendPercent?: number;
  trendLabel?: string;
  icon: React.FC<{ className?: string }>;
  iconBgColor?: string;
  isCurrency?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  cnyValue = 0,
  dzdValue,
  formattedPrimary,
  formattedSecondary,
  trendPercent,
  trendLabel,
  icon: Icon,
  isCurrency = true,
}) => {
  const { settings, formatCNY, formatDZD } = useApp();

  const primaryCNY = formattedPrimary || (isCurrency ? formatCNY(cnyValue) : cnyValue.toString());
  const secondaryDZD =
    formattedSecondary || (dzdValue !== undefined ? formatDZD(dzdValue) : undefined);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400 shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Primary Value */}
        <div className="space-y-0.5">
          <div className="text-xl font-bold text-zinc-100 tracking-tight font-mono">
            {settings.defaultCurrency === 'DZD' && secondaryDZD
              ? secondaryDZD
              : primaryCNY}
          </div>

          {/* Secondary Dual Currency Display */}
          {settings.defaultCurrency === 'BOTH' && secondaryDZD && (
            <div className="text-[11px] font-medium text-blue-400 font-mono">
              ≈ {secondaryDZD}
            </div>
          )}

          {settings.defaultCurrency === 'DZD' && (
            <div className="text-[11px] font-medium text-zinc-500 font-mono">
              ≈ {primaryCNY}
            </div>
          )}

          {settings.defaultCurrency === 'CNY' && secondaryDZD && (
            <div className="text-[11px] font-medium text-blue-400 font-mono">
              ≈ {secondaryDZD}
            </div>
          )}
        </div>
      </div>

      {/* Trend or Subtext */}
      {(trendPercent !== undefined || trendLabel) && (
        <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
          {trendPercent !== undefined && (
            <span
              className={`inline-flex items-center space-x-1 font-bold ${
                trendPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trendPercent >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trendPercent >= 0 ? `+${trendPercent}%` : `${trendPercent}%`}</span>
            </span>
          )}

          {trendLabel && (
            <span className="text-zinc-500 font-sans truncate ml-auto">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
