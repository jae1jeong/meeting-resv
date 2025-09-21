import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import { StatsCard } from '@/packages/frontend/components/admin/dashboard/stats-card'
import { requireAdmin } from '@/packages/backend/lib/auth-check'
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  UserPlus,
  DoorOpen,
  Clock,
  Activity
} from 'lucide-react'

export default async function AdminDashboard() {
  // 어드민 권한 체크
  await requireAdmin()
  // TODO: 실제 데이터는 서버에서 가져오기
  const stats = {
    totalUsers: 156,
    totalGroups: 12,
    totalRooms: 24,
    totalBookings: 342,
    activeBookings: 18,
    todayBookings: 7,
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3
  }

  return (
    <div className={cn("space-y-8")}>
      {/* 페이지 헤더 */}
      <div className={cn("mb-8")}>
        <h1 className={cn(
          "text-4xl font-bold text-white mb-2",
          "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        )}>
          관리자 대시보드
        </h1>
        <p className={cn("text-white/60")}>
          시스템 전체 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 통계 카드 그리드 */}
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6")}>
        <StatsCard
          title="전체 사용자"
          value={stats.totalUsers}
          icon={Users}
          description="등록된 사용자 수"
          trend={{ value: stats.weeklyGrowth, isPositive: true }}
          color="blue"
        />

        <StatsCard
          title="그룹 수"
          value={stats.totalGroups}
          icon={UserPlus}
          description="활성 그룹"
          trend={{ value: 5.2, isPositive: true }}
          color="purple"
        />

        <StatsCard
          title="회의실"
          value={stats.totalRooms}
          icon={DoorOpen}
          description="이용 가능한 회의실"
          color="green"
        />

        <StatsCard
          title="총 예약"
          value={stats.totalBookings}
          icon={Calendar}
          description="이번 달 예약 건수"
          trend={{ value: stats.monthlyGrowth, isPositive: true }}
          color="orange"
        />
      </div>

      {/* 활동 현황 섹션 */}
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8")}>
        <div className={cn(
          "lg:col-span-2",
          "rounded-2xl",
          "bg-gradient-to-br from-indigo-500/10 to-purple-500/10",
          "backdrop-blur-2xl",
          "border border-indigo-500/20",
          "p-6"
        )}>
          <div className={cn("flex items-center justify-between mb-6")}>
            <h2 className={cn("text-xl font-bold text-white")}>
              최근 활동
            </h2>
            <Activity className={cn("w-5 h-5 text-indigo-400")} />
          </div>

          {/* 활동 목록 */}
          <div className={cn("space-y-4")}>
            {[
              { time: '5분 전', action: '새로운 예약 생성', user: '김민수', type: 'booking' },
              { time: '12분 전', action: '그룹 멤버 추가', user: '이영희', type: 'member' },
              { time: '30분 전', action: '회의실 정보 수정', user: '박철수', type: 'room' },
              { time: '1시간 전', action: '예약 취소', user: '정민아', type: 'cancel' },
              { time: '2시간 전', action: '새로운 그룹 생성', user: '최준호', type: 'group' }
            ].map((activity, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between",
                  "p-4 rounded-xl",
                  "bg-white/5 backdrop-blur-xl",
                  "border border-white/10",
                  "hover:bg-white/10 transition-colors duration-300"
                )}
              >
                <div className={cn("flex items-center space-x-4")}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.type === 'booking' && "bg-blue-400",
                    activity.type === 'member' && "bg-green-400",
                    activity.type === 'room' && "bg-purple-400",
                    activity.type === 'cancel' && "bg-red-400",
                    activity.type === 'group' && "bg-orange-400"
                  )} />
                  <div>
                    <p className={cn("text-white text-sm font-medium")}>
                      {activity.action}
                    </p>
                    <p className={cn("text-white/50 text-xs")}>
                      {activity.user}
                    </p>
                  </div>
                </div>
                <span className={cn("text-white/40 text-xs")}>
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 오늘의 예약 현황 */}
        <div className={cn(
          "rounded-2xl",
          "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
          "backdrop-blur-2xl",
          "border border-emerald-500/20",
          "p-6"
        )}>
          <div className={cn("flex items-center justify-between mb-6")}>
            <h2 className={cn("text-xl font-bold text-white")}>
              오늘의 예약
            </h2>
            <Clock className={cn("w-5 h-5 text-emerald-400")} />
          </div>

          <div className={cn("space-y-4")}>
            <div className={cn("text-center py-8")}>
              <p className={cn("text-5xl font-bold text-white mb-2")}>
                {stats.todayBookings}
              </p>
              <p className={cn("text-white/60 text-sm")}>
                건의 예약
              </p>
            </div>

            <div className={cn("space-y-3")}>
              <div className={cn(
                "flex items-center justify-between",
                "p-3 rounded-lg",
                "bg-white/5"
              )}>
                <span className={cn("text-white/70 text-sm")}>진행 중</span>
                <span className={cn("text-emerald-400 font-bold")}>3</span>
              </div>
              <div className={cn(
                "flex items-center justify-between",
                "p-3 rounded-lg",
                "bg-white/5"
              )}>
                <span className={cn("text-white/70 text-sm")}>예정</span>
                <span className={cn("text-blue-400 font-bold")}>4</span>
              </div>
              <div className={cn(
                "flex items-center justify-between",
                "p-3 rounded-lg",
                "bg-white/5"
              )}>
                <span className={cn("text-white/70 text-sm")}>완료</span>
                <span className={cn("text-white/50 font-bold")}>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 버튼들 */}
      <div className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      )}>
        {[
          { label: '새 그룹 생성', icon: UserPlus, href: '/admin/groups/new', color: 'from-blue-500/20 to-cyan-500/20' },
          { label: '회의실 추가', icon: DoorOpen, href: '/admin/rooms/new', color: 'from-purple-500/20 to-pink-500/20' },
          { label: '사용자 초대', icon: Users, href: '/admin/members/invite', color: 'from-green-500/20 to-emerald-500/20' }
        ].map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={cn(
              "group relative overflow-hidden",
              "rounded-xl p-6",
              "bg-gradient-to-br",
              action.color,
              "backdrop-blur-xl",
              "border border-white/10",
              "transition-all duration-300",
              "hover:scale-[1.02] hover:border-white/20"
            )}
          >
            <div className={cn("flex items-center space-x-4")}>
              <action.icon className={cn("w-6 h-6 text-white/70")} />
              <span className={cn("text-white font-medium")}>
                {action.label}
              </span>
            </div>

            {/* 호버 효과 */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100",
              "bg-gradient-to-r from-white/5 to-transparent",
              "transition-opacity duration-300"
            )} />
          </a>
        ))}
      </div>
    </div>
  )
}