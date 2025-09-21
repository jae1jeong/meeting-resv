'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateGroup } from '@/packages/backend/actions/admin/group-actions'
import { GlassCard } from '@/packages/frontend/components/ui/glass-card'
import { GlassButton } from '@/packages/frontend/components/ui/glass-button'
import { GlassInput } from '@/packages/frontend/components/ui/glass-input'
import { cn } from '@/packages/shared/utils/utils'
import { ArrowLeft, Save, Image as ImageIcon, Sliders, Eye } from 'lucide-react'
import Image from 'next/image'

interface GroupEditClientProps {
  group: {
    id: string
    name: string
    description: string | null
    backgroundImage: string | null
    backgroundBlur: number
    backgroundOpacity: number
    backgroundPosition: string
    _count: {
      members: number
      rooms: number
    }
  }
}

// 미리 정의된 배경이미지 목록
const PRESET_BACKGROUNDS = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070',
    name: '산악 풍경'
  },
  {
    url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=2070',
    name: '일몰 호수'
  },
  {
    url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=2070',
    name: '해변'
  },
  {
    url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=2070',
    name: '숲'
  },
  {
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070',
    name: '산과 호수'
  },
  {
    url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2070',
    name: '겨울 숲'
  }
]

export default function GroupEditClient({ group }: GroupEditClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    backgroundImage: group.backgroundImage || '',
    backgroundBlur: group.backgroundBlur,
    backgroundOpacity: group.backgroundOpacity,
    backgroundPosition: group.backgroundPosition
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateGroup(group.id, {
        name: formData.name,
        description: formData.description || null,
        backgroundImage: formData.backgroundImage || null,
        backgroundBlur: formData.backgroundBlur,
        backgroundOpacity: formData.backgroundOpacity,
        backgroundPosition: formData.backgroundPosition
      })

      router.push('/admin/groups')
      router.refresh()
    } catch (error) {
      console.error('그룹 업데이트 오류:', error)
      alert('그룹 업데이트에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const selectPresetBackground = (url: string) => {
    setFormData(prev => ({ ...prev, backgroundImage: url }))
  }

  const clearBackground = () => {
    setFormData(prev => ({ ...prev, backgroundImage: '' }))
  }

  return (
    <div className={cn("min-h-screen p-6 space-y-6")}>
      {/* 헤더 */}
      <div className={cn("flex items-center justify-between")}>
        <div className={cn("flex items-center space-x-4")}>
          <button
            onClick={() => router.back()}
            className={cn(
              "p-2 rounded-xl bg-white/5 hover:bg-white/10",
              "border border-white/10 backdrop-blur-sm",
              "transition-all duration-200",
              "text-white/80 hover:text-white"
            )}
          >
            <ArrowLeft className={cn("w-5 h-5")} />
          </button>
          <div>
            <h1 className={cn("text-2xl font-bold text-white")}>그룹 편집</h1>
            <p className={cn("text-white/60 text-sm mt-1")}>
              {group._count.members}명 멤버 · {group._count.rooms}개 회의실
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-xl",
            "bg-white/5 hover:bg-white/10",
            "border border-white/10 backdrop-blur-sm",
            "transition-all duration-200",
            "text-white/80 hover:text-white"
          )}
        >
          <Eye className={cn("w-4 h-4")} />
          <span>미리보기</span>
        </button>
      </div>

      {/* 미리보기 */}
      {showPreview && formData.backgroundImage && (
        <GlassCard className={cn("relative h-48 overflow-hidden")}>
          <Image
            src={formData.backgroundImage}
            alt="미리보기"
            fill
            className="object-cover"
            style={{
              objectPosition: formData.backgroundPosition,
              filter: `blur(${formData.backgroundBlur}px)`,
              opacity: formData.backgroundOpacity
            }}
          />
          <div className={cn("absolute inset-0 bg-black/20")} />
          <div className={cn("relative z-10 p-6 h-full flex items-center justify-center")}>
            <h3 className={cn("text-2xl font-bold text-white")}>미리보기</h3>
          </div>
        </GlassCard>
      )}

      <form onSubmit={handleSubmit} className={cn("space-y-6")}>
        {/* 기본 정보 */}
        <GlassCard className={cn("p-6 space-y-4")}>
          <h3 className={cn("text-lg font-semibold text-white mb-4")}>기본 정보</h3>

          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              그룹 이름
            </label>
            <GlassInput
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="그룹 이름"
              required
            />
          </div>

          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="그룹 설명 (선택사항)"
              rows={3}
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white placeholder:text-white/40",
                "focus:bg-white/10 focus:border-white/20",
                "transition-all duration-200",
                "resize-none"
              )}
            />
          </div>
        </GlassCard>

        {/* 배경이미지 설정 */}
        <GlassCard className={cn("p-6 space-y-4")}>
          <h3 className={cn("text-lg font-semibold text-white mb-4 flex items-center space-x-2")}>
            <ImageIcon className={cn("w-5 h-5")} />
            <span>배경이미지 설정</span>
          </h3>

          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              배경이미지 URL
            </label>
            <div className={cn("flex space-x-2")}>
              <GlassInput
                value={formData.backgroundImage}
                onChange={(e) => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className={cn("flex-1")}
              />
              <GlassButton
                type="button"
                variant="secondary"
                onClick={clearBackground}
                disabled={!formData.backgroundImage}
              >
                초기화
              </GlassButton>
            </div>
          </div>

          {/* 프리셋 이미지 */}
          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              프리셋 배경이미지 선택
            </label>
            <div className={cn("grid grid-cols-3 gap-3")}>
              {PRESET_BACKGROUNDS.map((bg, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPresetBackground(bg.url)}
                  className={cn(
                    "relative h-24 rounded-lg overflow-hidden",
                    "border-2 transition-all duration-200",
                    formData.backgroundImage === bg.url
                      ? "border-blue-500"
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  <Image
                    src={bg.url}
                    alt={bg.name}
                    fill
                    className="object-cover"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent",
                    "flex items-end p-2"
                  )}>
                    <span className={cn("text-white text-xs font-medium")}>
                      {bg.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* 배경이미지 효과 설정 */}
        <GlassCard className={cn("p-6 space-y-4")}>
          <h3 className={cn("text-lg font-semibold text-white mb-4 flex items-center space-x-2")}>
            <Sliders className={cn("w-5 h-5")} />
            <span>배경이미지 효과</span>
          </h3>

          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              블러 강도: {formData.backgroundBlur}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={formData.backgroundBlur}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                backgroundBlur: parseInt(e.target.value)
              }))}
              className={cn("w-full")}
            />
          </div>

          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              투명도: {(formData.backgroundOpacity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.backgroundOpacity * 100}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                backgroundOpacity: parseInt(e.target.value) / 100
              }))}
              className={cn("w-full")}
            />
          </div>

          <div>
            <label className={cn("block text-white/80 text-sm mb-2")}>
              위치
            </label>
            <select
              value={formData.backgroundPosition}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                backgroundPosition: e.target.value
              }))}
              className={cn(
                "w-full px-4 py-3 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white",
                "focus:bg-white/10 focus:border-white/20",
                "transition-all duration-200"
              )}
            >
              <option value="center">중앙</option>
              <option value="top">상단</option>
              <option value="bottom">하단</option>
              <option value="left">왼쪽</option>
              <option value="right">오른쪽</option>
            </select>
          </div>
        </GlassCard>

        {/* 저장 버튼 */}
        <div className={cn("flex justify-end space-x-3")}>
          <GlassButton
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            취소
          </GlassButton>
          <GlassButton
            type="submit"
            disabled={isLoading || !formData.name}
            className={cn("flex items-center space-x-2")}
          >
            <Save className={cn("w-4 h-4")} />
            <span>{isLoading ? '저장 중...' : '저장'}</span>
          </GlassButton>
        </div>
      </form>
    </div>
  )
}