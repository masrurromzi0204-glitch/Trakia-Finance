import React from 'react';
import {
  Heart, Coffee, ShoppingBag, CreditCard, Utensils,
  Car, Smartphone, Gift, Briefcase, Sparkles, Tag
} from 'lucide-react';

export default function CategoryBadge({ categoryName, txType, categories = [] }) {
  const found = categories.find(c => c.name === categoryName);
  const iconName = found?.icon || (
    categoryName?.includes('Dating') ? 'Heart' :
    categoryName?.includes('Belanja') ? 'ShoppingBag' :
    categoryName?.includes('Tagihan') ? 'CreditCard' :
    categoryName?.includes('Pribadi') || categoryName?.includes('Jajan') ? 'Coffee' :
    txType === 'income' ? 'Briefcase' : 'Tag'
  );

  const colorKey = found?.color || (
    categoryName?.includes('Dating') ? 'purple' :
    categoryName?.includes('Belanja') ? 'blue' :
    categoryName?.includes('Tagihan') ? 'rose' :
    categoryName?.includes('Pribadi') ? 'amber' :
    txType === 'income' ? 'emerald' : 'blue'
  );

  const colorMap = {
    purple: 'bg-purple-50 text-purple-600 ring-1 ring-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
    blue: 'bg-[#EFF6FF] text-[#1D63DC] ring-1 ring-blue-100',
    rose: 'bg-rose-50 text-rose-500 ring-1 ring-rose-100',
    amber: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    emerald: 'bg-[#E6FAF5] text-[#00C49A] ring-1 ring-emerald-100',
    teal: 'bg-[#E6FAF5] text-[#00C49A] ring-1 ring-emerald-100'
  };

  const badgeStyle = colorMap[colorKey] || colorMap.blue;
  const iconProps = { size: 20, strokeWidth: 2.2 };

  let IconComponent = Tag;
  if (iconName === 'Heart') IconComponent = Heart;
  else if (iconName === 'Coffee') IconComponent = Coffee;
  else if (iconName === 'ShoppingBag') IconComponent = ShoppingBag;
  else if (iconName === 'CreditCard') IconComponent = CreditCard;
  else if (iconName === 'Utensils') IconComponent = Utensils;
  else if (iconName === 'Car') IconComponent = Car;
  else if (iconName === 'Smartphone') IconComponent = Smartphone;
  else if (iconName === 'Gift') IconComponent = Gift;
  else if (iconName === 'Briefcase') IconComponent = Briefcase;
  else if (iconName === 'Sparkles') IconComponent = Sparkles;

  return (
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${badgeStyle}`}>
      <IconComponent {...iconProps} className={iconName === 'Heart' ? 'fill-current' : ''} />
    </div>
  );
}

