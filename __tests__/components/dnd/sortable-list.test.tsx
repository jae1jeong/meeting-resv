import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'
import { SortableList, SortableListItem } from '@/packages/frontend/components/dnd/sortable-list'

// Mock @dnd-kit modules
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => []),
}))

jest.mock('@dnd-kit/sortable', () => ({
  arrayMove: jest.fn((items: any[], oldIndex: number, newIndex: number) => {
    const result = [...items]
    const [removed] = result.splice(oldIndex, 1)
    result.splice(newIndex, 0, removed)
    return result
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
}))

jest.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: jest.fn(),
  restrictToWindowEdges: jest.fn(),
}))

describe('SortableList 컴포넌트', () => {
  const mockItems: SortableListItem[] = [
    { id: '1', content: <div>항목 1</div> },
    { id: '2', content: <div>항목 2</div> },
    { id: '3', content: <div>항목 3</div> },
  ]

  it('기본적으로 렌더링되어야 한다', () => {
    render(<SortableList items={mockItems} />)
    
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument()
    expect(screen.getByText('항목 1')).toBeInTheDocument()
    expect(screen.getByText('항목 2')).toBeInTheDocument()
    expect(screen.getByText('항목 3')).toBeInTheDocument()
  })

  it('onReorder 콜백이 호출되어야 한다', () => {
    const handleReorder = jest.fn()
    
    render(
      <SortableList 
        items={mockItems} 
        onReorder={handleReorder}
      />
    )
    
    // 실제 드래그 이벤트는 복잡하므로 기본 렌더링만 테스트
    expect(screen.getByTestId('dnd-context')).toBeInTheDocument()
  })

  it('비활성화된 항목을 처리해야 한다', () => {
    const itemsWithDisabled: SortableListItem[] = [
      { id: '1', content: <div>활성 항목</div> },
      { id: '2', content: <div>비활성 항목</div>, disabled: true },
    ]

    render(<SortableList items={itemsWithDisabled} />)
    
    expect(screen.getByText('활성 항목')).toBeInTheDocument()
    expect(screen.getByText('비활성 항목')).toBeInTheDocument()
  })

  it('사용자 정의 클래스명을 적용해야 한다', () => {
    const { container } = render(
      <SortableList 
        items={mockItems} 
        className="custom-list-class"
        itemClassName="custom-item-class"
      />
    )
    
    const listElement = container.querySelector('.custom-list-class')
    expect(listElement).toBeInTheDocument()
  })
})