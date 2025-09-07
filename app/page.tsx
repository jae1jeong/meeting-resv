import Image from "next/image"
import { Header } from "@/frontend/components/layout/MainLayout"
import { Sidebar } from "@/frontend/components/layout/MainLayout"
import { CalendarContainer } from "@/frontend/features/calendar/components/CalendarContainer"
import { SidebarContent } from "@/frontend/features/calendar/components/SidebarContent"
import { SAMPLE_EVENTS } from "@/frontend/features/calendar/constants"

// Server Component - No "use client" directive
export default function Home() {
  // This could be fetched from a database in a real app
  const currentMonth = "March 2025"
  
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
          <SidebarContent 
            currentMonth={currentMonth}
          />
        </Sidebar>

        {/* Calendar View - Client Component for interactivity */}
        <div className="flex-1 flex flex-col">
          <CalendarContainer initialEvents={SAMPLE_EVENTS} />
        </div>
      </main>
    </div>
  )
}