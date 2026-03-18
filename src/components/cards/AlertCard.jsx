import React from 'react';
import clsx from 'clsx';
import { AlertCircle, PackageX } from 'lucide-react';
import Button from '../common/Button';

// Variant mappings based on severity
const alertStyles = {
  danger: {
    borderLeft: 'border-l-danger',
    iconColor: 'text-danger',
    iconBg: 'bg-red-50',
    Icon: PackageX,
    badgeBg: 'bg-red-100 text-red-800'
  },
  warning: {
    borderLeft: 'border-l-warning',
    iconColor: 'text-warning',
    iconBg: 'bg-amber-50',
    Icon: AlertCircle,
    badgeBg: 'bg-amber-100 text-amber-800'
  }
};

const AlertCard = ({ title, message, stock, threshold, variant = 'danger', onActionClick, actionLabel = 'Action' }) => {
  const style = alertStyles[variant];
  const Icon = style.Icon;

  return (
    <div className={clsx(
      "bg-white rounded-xl shadow-sm border-t border-r border-b border-gray-100 flex p-4 transition-all hover:bg-gray-50",
      "border-l-4", 
      style.borderLeft
    )}>
      {/* Icon Status */}
      <div className={clsx("p-2 rounded-lg flex-shrink-0 h-min mt-1", style.iconBg)}>
        <Icon className={clsx("w-5 h-5", style.iconColor)} />
      </div>

      {/* Info Body */}
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", style.badgeBg)}>
            {variant === 'danger' ? 'Critical' : 'Alert'}
          </span>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">{message}</p>
        
        <div className="mt-3 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Current</span>
            <span className="text-sm font-bold text-gray-900 leading-none">{stock}</span>
          </div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Threshold</span>
            <span className="text-sm font-bold text-gray-500 leading-none">{threshold}</span>
          </div>
        </div>
      </div>
      
      {/* Right Action */}
      <div className="ml-4 flex items-center border-l border-gray-100 pl-4">
        <Button size="sm" variant={variant} onClick={onActionClick}>
          {actionLabel}
        </Button>
      </div>
      
    </div>
  );
};

export default AlertCard;
