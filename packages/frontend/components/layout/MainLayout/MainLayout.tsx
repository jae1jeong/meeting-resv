"use client"

import Image from "next/image"
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
  isLoaded?: boolean
  sidebarContent?: React.ReactNode
}

export function MainLayout({ children, isLoaded = true, sidebarContent }: MainLayoutProps) {
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

      {/* Navigation */}
      <Header />

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <Sidebar>
          {sidebarContent}
        </Sidebar>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}