import Image from "next/image"


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
          {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />
      {children}
    </div>
  )
}