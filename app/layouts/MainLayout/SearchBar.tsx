"use client"

import { Search } from "lucide-react"
import { useState } from "react"

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
      <input
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="glass-input rounded-full pl-10 pr-4 py-2"
      />
    </div>
  )
}