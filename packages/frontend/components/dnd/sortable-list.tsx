'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { SortableItem } from './sortable-item'
import { cn } from '@/shared/utils/utils'

export interface SortableListItem {
  id: string
  content: React.ReactNode
  disabled?: boolean
}

interface SortableListProps {
  items: SortableListItem[]
  onReorder?: (items: SortableListItem[]) => void
  className?: string
  itemClassName?: string
  showGrips?: boolean
}

export function SortableList({
  items: initialItems,
  onReorder,
  className,
  itemClassName,
  showGrips = true
}: SortableListProps) {
  const [items, setItems] = useState(initialItems)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      onReorder?.(newItems)
    }
  }

  // items prop이 변경될 때 내부 상태 업데이트
  React.useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext 
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn('space-y-2', className)}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              id={item.id}
              disabled={item.disabled}
              showGrip={showGrips}
              className={itemClassName}
            >
              {item.content}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}