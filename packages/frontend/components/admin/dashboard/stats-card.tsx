'use client'

import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
  className?: string
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    trend: 'text-blue-300'
  },
  purple: {
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    trend: 'text-purple-300'
  },
  green: {
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    trend: 'text-green-300'
  },
  orange: {
    gradient: 'from-orange-500/20 to-yellow-500/20',
    border: 'border-orange-500/30',
    icon: 'text-orange-400',
    trend: 'text-orange-300'
  },
  pink: {
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/30',
    icon: 'text-pink-400',
    trend: 'text-pink-300'
  }
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
  className
}: StatsCardProps) {
  const variant = colorVariants[color]

  return (
    <div className={cn(
      "relative group",
      className
    )}>
      {/* 글로우 효과 */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
        "bg-gradient-to-r",
        variant.gradient,
        "blur-xl transition-opacity duration-500",
        "animate-pulse-slow"
      )} />

      {/* 카드 본체 */}
      <div className={cn(
        "relative rounded-2xl",
        "bg-gradient-to-br",
        variant.gradient,
        "backdrop-blur-2xl",
        "border",
        variant.border,
        "p-6",
        "transition-all duration-300",
        "hover:scale-[1.02]",
        "hover:shadow-2xl"
      )}>
        {/* 상단 영역 */}
        <div className={cn("flex items-start justify-between mb-4")}>
          <div className={cn(
            "w-12 h-12 rounded-xl",
            "bg-white/10 backdrop-blur-xl",
            "flex items-center justify-center",
            "border border-white/20"
          )}>
            <Icon className={cn("w-6 h-6", variant.icon)} />
          </div>

          {trend && (
            <div className={cn(
              "flex items-center space-x-1",
              "px-2 py-1 rounded-lg",
              "bg-white/5",
              variant.trend
            )}>
              {trend.isPositive ? (
                <TrendingUp className={cn("w-4 h-4")} />
              ) : (
                <TrendingDown className={cn("w-4 h-4")} />
              )}
              <span className={cn("text-xs font-medium")}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>

        {/* 데이터 영역 */}
        <div>
          <h3 className={cn("text-white/70 text-sm font-medium mb-1")}>
            {title}
          </h3>
          <p className={cn("text-white text-3xl font-bold mb-2")}>
            {value}
          </p>
          {description && (
            <p className={cn("text-white/50 text-xs")}>
              {description}
            </p>
          )}
        </div>

        {/* 장식 요소 */}
        <div className={cn(
          "absolute top-0 right-0 w-32 h-32",
          "bg-gradient-to-br",
          variant.gradient,
          "rounded-full blur-3xl opacity-30",
          "animate-float"
        )} />
      </div>
    </div>
  )
}