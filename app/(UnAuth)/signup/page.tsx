"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Mail, Lock, User, Eye, EyeOff, CheckCircle } from "lucide-react"
import { GlassButton } from "@/packages/frontend/components/ui/glass-button"
import { GlassInput } from "@/packages/frontend/components/ui/glass-input"
import { GlassCard } from "@/packages/frontend/components/ui/glass-card"
import { authValidation } from "@/shared/utils/auth.utils"
import type { RegisterData } from "@/shared/types/auth.types"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 비밀번호 확인 검증
    if (formData.password !== formData.confirmPassword) {
      setErrors(["비밀번호가 일치하지 않습니다"])
      return
    }

    // 기본 유효성 검증
    const validation = authValidation.validateRegisterData({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "회원가입 중 오류가 발생했습니다")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)

    } catch (error) {
      console.error("회원가입 오류:", error)
      setErrors([error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다"])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setErrors([])
  }

  if (success) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />

        {/* Success Message */}
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <GlassCard className="w-full max-w-md text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">회원가입 완료!</h1>
            <p className="text-white/70">
              환영합니다! 잠시 후 로그인 페이지로 이동합니다.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Signup Form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <GlassCard className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">회원가입</h1>
            <p className="text-white/70">GroupMeet 계정을 생성하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 에러 메시지 */}
            {errors.length > 0 && (
              <div className="glass-card bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {errors.map((error, index) => (
                  <p key={index} className="text-red-300 text-sm">{error}</p>
                ))}
              </div>
            )}

            {/* 이름 입력 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                이름
              </label>
              <GlassInput
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange("name")}
                icon={<User className="h-5 w-5" />}
                required
              />
            </div>

            {/* 이메일 입력 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                이메일
              </label>
              <GlassInput
                type="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange("email")}
                icon={<Mail className="h-5 w-5" />}
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                비밀번호
              </label>
              <div className="relative">
                <GlassInput
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요 (최소 8자)"
                  value={formData.password}
                  onChange={handleChange("password")}
                  icon={<Lock className="h-5 w-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 입력 */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <GlassInput
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  icon={<Lock className="h-5 w-5" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <GlassButton
              type="submit"
              className="w-full"
              disabled={isLoading}
              glow
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </GlassButton>
          </form>

          {/* 로그인 링크 */}
          <div className="text-center">
            <p className="text-white/70 text-sm">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="text-white hover:text-white/80 transition-colors underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}