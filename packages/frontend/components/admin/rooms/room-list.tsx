'use client'

import React from 'react'
import { cn } from '@/packages/shared/utils/utils'
import {
  DoorOpen,
  Users,
  MapPin,
  Wifi,
  Monitor,
  Coffee,
  Projector,
  Video,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'

interface Room {
  id: string
  name: string
  capacity: number
  location?: string
  amenities: string[]
  groupId: string
  groupName: string
  bookingCount?: number
}

interface RoomListProps {
  rooms: Room[]
  onEdit?: (roomId: string) => void
  onDelete?: (roomId: string) => void
  className?: string
}

const amenityIcons: Record<string, React.ComponentType<any>> = {
  wifi: Wifi,
  monitor: Monitor,
  coffee: Coffee,
  projector: Projector,
  video: Video
}

export function RoomList({
  rooms,
  onEdit,
  onDelete,
  className
}: RoomListProps) {
  const [showMenu, setShowMenu] = React.useState<string | null>(null)

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {rooms.map((room) => (
        <div
          key={room.id}
          className={cn(
            "group relative",
            "rounded-2xl",
            "bg-gradient-to-br from-white/5 to-white/10",
            "backdrop-blur-2xl",
            "border border-white/10",
            "transition-all duration-300",
            "hover:border-white/20",
            "hover:shadow-2xl",
            "hover:scale-[1.02]"
          )}
        >
          {/* 회의실 이미지 영역 (플레이스홀더) */}
          <div className={cn(
            "h-48 rounded-t-2xl",
            "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
            "relative overflow-hidden"
          )}>
            {/* 장식 패턴 */}
            <div className={cn(
              "absolute inset-0",
              "bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.2),transparent_50%)]"
            )} />
            <div className={cn(
              "absolute inset-0",
              "bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.2),transparent_50%)]"
            )} />

            {/* 회의실 아이콘 */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-center"
            )}>
              <DoorOpen className={cn("w-16 h-16 text-white/30")} />
            </div>

            {/* 액션 메뉴 */}
            <div className={cn("absolute top-4 right-4")}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(showMenu === room.id ? null : room.id)
                }}
                className={cn(
                  "p-2 rounded-lg",
                  "bg-black/30 backdrop-blur-xl",
                  "hover:bg-black/50",
                  "transition-colors duration-200"
                )}
              >
                <MoreVertical className={cn("w-5 h-5 text-white")} />
              </button>

              {showMenu === room.id && (
                <div className={cn(
                  "absolute right-0 top-12 z-10",
                  "w-48 rounded-xl",
                  "bg-black/90 backdrop-blur-2xl",
                  "border border-white/20",
                  "shadow-2xl"
                )}>
                  <button
                    onClick={() => {
                      onEdit?.(room.id)
                      setShowMenu(null)
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left",
                      "flex items-center space-x-3",
                      "hover:bg-white/10",
                      "transition-colors duration-200",
                      "text-white/80 hover:text-white"
                    )}
                  >
                    <Edit className={cn("w-4 h-4")} />
                    <span className={cn("text-sm")}>회의실 수정</span>
                  </button>

                  <button
                    onClick={() => {
                      onDelete?.(room.id)
                      setShowMenu(null)
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left",
                      "flex items-center space-x-3",
                      "hover:bg-red-500/20",
                      "transition-colors duration-200",
                      "text-red-400 hover:text-red-300"
                    )}
                  >
                    <Trash2 className={cn("w-4 h-4")} />
                    <span className={cn("text-sm")}>회의실 삭제</span>
                  </button>
                </div>
              )}
            </div>

            {/* 그룹 뱃지 */}
            <div className={cn(
              "absolute bottom-4 left-4",
              "px-3 py-1 rounded-lg",
              "bg-black/30 backdrop-blur-xl",
              "text-white/80 text-xs font-medium"
            )}>
              {room.groupName}
            </div>
          </div>

          {/* 회의실 정보 */}
          <div className={cn("p-6")}>
            <h3 className={cn("text-xl font-bold text-white mb-2")}>
              {room.name}
            </h3>

            {/* 위치 및 수용 인원 */}
            <div className={cn("space-y-2 mb-4")}>
              {room.location && (
                <div className={cn("flex items-center space-x-2 text-white/60 text-sm")}>
                  <MapPin className={cn("w-4 h-4")} />
                  <span>{room.location}</span>
                </div>
              )}

              <div className={cn("flex items-center space-x-2 text-white/60 text-sm")}>
                <Users className={cn("w-4 h-4")} />
                <span>최대 {room.capacity}명</span>
              </div>
            </div>

            {/* 편의시설 */}
            {room.amenities.length > 0 && (
              <div className={cn("mb-4")}>
                <p className={cn("text-white/50 text-xs mb-2")}>편의시설</p>
                <div className={cn("flex flex-wrap gap-2")}>
                  {room.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity.toLowerCase()] || DoorOpen
                    return (
                      <div
                        key={amenity}
                        className={cn(
                          "px-3 py-1 rounded-lg",
                          "bg-white/5 border border-white/10",
                          "flex items-center space-x-2"
                        )}
                      >
                        <Icon className={cn("w-3 h-3 text-white/50")} />
                        <span className={cn("text-white/70 text-xs capitalize")}>
                          {amenity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 예약 통계 */}
            {room.bookingCount !== undefined && (
              <div className={cn(
                "pt-4 border-t border-white/10",
                "flex items-center justify-between"
              )}>
                <span className={cn("text-white/50 text-xs")}>
                  이번 달 예약
                </span>
                <span className={cn("text-white font-bold")}>
                  {room.bookingCount}건
                </span>
              </div>
            )}
          </div>

          {/* 호버 효과 */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0",
            "bg-gradient-to-r from-blue-500/5 to-purple-500/5",
            "group-hover:opacity-100 transition-opacity duration-300",
            "pointer-events-none"
          )} />
        </div>
      ))}
    </div>
  )
}