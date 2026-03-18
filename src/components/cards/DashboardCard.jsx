import React from 'react';
import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const colorVariants = {
  primary: {
    bg: 'bg-blue-50',
    iconText: 'text-primary',
    border: 'border-blue-100'
  },
  success: {
    bg: 'bg-green-50',
    iconText: 'text-success',
    border: 'border-green-100'
  },
  warning: {
    bg: 'bg-amber-50',
    iconText: 'text-warning',
    border: 'border-amber-100'
  },
  danger: {
    bg: 'bg-red-50',
    iconText: 'text-danger',
    border: 'border-red-100'
  }
};

const DashboardCard = ({ 
   title, 
   value, 
   icon: Icon, 
   trend, 
   trendValue, 
   variant = 'primary' 
}) => {
  const styles = colorVariants[variant];

  return (
    <div className={clsx("bg-white rounded-xl shadow-sm border p-6 flex items-start gap-4 transition-all hover:shadow-md", styles.border)}>
      {/* Icon Container */}
      <div className={clsx("p-3 rounded-xl flex-shrink-0", styles.bg)}>
        <Icon className={clsx("w-6 h-6", styles.iconText)} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-gray-900 text-2xl font-bold mt-1 tracking-tight">{value}</p>
        
        {/* Trend Indicator */}
        {trendValue && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' ? (
              <span className="flex items-center text-xs font-medium text-success bg-green-50 px-1.5 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {trendValue}
              </span>
            ) : trend === 'down' ? (
              <span className="flex items-center text-xs font-medium text-danger bg-red-50 px-1.5 py-0.5 rounded-full">
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                {trendValue}
              </span>
            ) : null}
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
