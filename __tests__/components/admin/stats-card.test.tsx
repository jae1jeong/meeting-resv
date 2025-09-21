import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { StatsCard } from '@/packages/frontend/components/admin/dashboard/stats-card'
import { Users } from 'lucide-react'

describe('StatsCard 컴포넌트', () => {
  const defaultProps = {
    title: '전체 사용자',
    value: 156,
    icon: Users
  }

  it('기본 정보를 올바르게 렌더링해야 함', () => {
    render(<StatsCard {...defaultProps} />)

    expect(screen.getByText('전체 사용자')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
  })

  it('설명이 있을 때 표시해야 함', () => {
    render(
      <StatsCard
        {...defaultProps}
        description="등록된 사용자 수"
      />
    )

    expect(screen.getByText('등록된 사용자 수')).toBeInTheDocument()
  })

  it('트렌드 정보를 올바르게 표시해야 함', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 12.5, isPositive: true }}
      />
    )

    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('음수 트렌드도 올바르게 표시해야 함', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 5.2, isPositive: false }}
      />
    )

    expect(screen.getByText('5.2%')).toBeInTheDocument()
  })

  it('다양한 색상 변형을 적용할 수 있어야 함', () => {
    const colors = ['blue', 'purple', 'green', 'orange', 'pink'] as const

    colors.forEach(color => {
      const { container } = render(
        <StatsCard {...defaultProps} color={color} />
      )

      const card = container.firstChild
      expect(card).toBeTruthy()
    })
  })

  it('문자열 값도 표시할 수 있어야 함', () => {
    render(
      <StatsCard
        {...defaultProps}
        value="82%"
      />
    )

    expect(screen.getByText('82%')).toBeInTheDocument()
  })
})