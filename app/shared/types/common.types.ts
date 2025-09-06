export type ID = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export interface BaseEntity {
  id: ID
  createdAt: Date
  updatedAt: Date
}

export interface TimeRange {
  start: string // "HH:mm" format
  end: string   // "HH:mm" format
}

export interface DateTimeRange {
  startDateTime: Date
  endDateTime: Date
}

export type Status = 'active' | 'inactive' | 'pending' | 'archived'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}