"use client"

import { Plus } from "lucide-react"

export function CreateButton() {
  const handleCreate = () => {
    console.log("Create new event")
    // TODO: Implement create functionality
  }

  return (
    <>
      <button 
        onClick={handleCreate}
        className="mb-6 flex items-center justify-center gap-2 glass-button rounded-full px-4 py-3 text-white w-full glass-glow"
      >
        <Plus className="h-5 w-5" />
        <span>Create</span>
      </button>

      {/* Floating Action Button */}
      <button 
        onClick={handleCreate}
        className="mt-6 flex items-center justify-center glass-button rounded-full p-4 text-white w-14 h-14 self-start glass-glow"
      >
        <Plus className="h-6 w-6" />
      </button>
    </>
  )
}