import React from 'react';
import {
  Home, Zap, Utensils, Car, Landmark, HeartPulse, Tv,
  ShoppingBag, GraduationCap, MoreHorizontal, CreditCard,
  Banknote, ArrowRightLeft, Smartphone, Wallet, DollarSign,
  AlertCircle
} from 'lucide-react';

const ICONS = {
  Home,
  Zap,
  Utensils,
  Car,
  Landmark,
  HeartPulse,
  Tv,
  ShoppingBag,
  GraduationCap,
  MoreHorizontal,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Smartphone,
  Wallet,
  DollarSign,
};

export default function CategoryIcon({ name, className = 'w-4 h-4', style = {} }) {
  const IconComponent = ICONS[name] || AlertCircle;
  return <IconComponent className={className} style={style} />;
}
