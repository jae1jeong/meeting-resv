import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, jest } from '@jest/globals'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'

describe('GlassButton 컴포넌트', () => {
  it('기본적으로 렌더링되어야 한다', () => {
    render(<GlassButton>테스트 버튼</GlassButton>)
    
    const button = screen.getByRole('button', { name: '테스트 버튼' })
    expect(button).toBeInTheDocument()
  })

  it('클릭 이벤트가 호출되어야 한다', () => {
    const handleClick = jest.fn()
    
    render(
      <GlassButton onClick={handleClick}>
        클릭 가능한 버튼
      </GlassButton>
    )
    
    const button = screen.getByRole('button', { name: '클릭 가능한 버튼' })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled 상태일 때 클릭이 비활성화되어야 한다', () => {
    const handleClick = jest.fn()
    
    render(
      <GlassButton disabled onClick={handleClick}>
        비활성화된 버튼
      </GlassButton>
    )
    
    const button = screen.getByRole('button', { name: '비활성화된 버튼' })
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('다양한 크기와 variant prop을 처리해야 한다', () => {
    const { rerender } = render(
      <GlassButton size="sm" variant="ghost">
        작은 버튼
      </GlassButton>
    )
    
    let button = screen.getByRole('button', { name: '작은 버튼' })
    expect(button).toBeInTheDocument()
    
    // 다른 props로 재렌더링
    rerender(
      <GlassButton size="lg" variant="primary">
        큰 버튼
      </GlassButton>
    )
    
    button = screen.getByRole('button', { name: '큰 버튼' })
    expect(button).toBeInTheDocument()
  })
})