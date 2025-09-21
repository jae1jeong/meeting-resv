'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/shared/utils/utils'
import { GripVertical } from 'lucide-react'

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  showGrip?: boolean
}

export function SortableItem({ 
  id, 
  children, 
  className,
  disabled = false,
  showGrip = true
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50 opacity-90 scale-105',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {showGrip && !disabled && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
        >
          <GripVertical className="w-4 h-4 text-white/60 hover:text-white/80" />
        </div>
      )}
      
      <div 
        className={cn(
          'transition-all duration-200',
          showGrip && !disabled && 'pl-8',
          isDragging && 'backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-2xl'
        )}
      >
        {children}
      </div>
    </div>
  )
}