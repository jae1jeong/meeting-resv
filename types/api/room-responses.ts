/**
 * Response types for Room API endpoints
 * These types define the exact shape of data returned from each API endpoint
 */

import { ApiResponse, PaginatedResponse } from './common'
import { MeetingRoomWithGroup, MeetingRoomWithBookings } from './room'

// GET /api/rooms - List rooms response
export type ListRoomsResponse = ApiResponse<PaginatedResponse<MeetingRoomWithGroup>>

// POST /api/rooms - Create room response  
export type CreateRoomResponse = ApiResponse<MeetingRoomWithGroup>

// GET /api/rooms/[id] - Get room response
export type GetRoomResponse = ApiResponse<MeetingRoomWithGroup | MeetingRoomWithBookings>

// PUT /api/rooms/[id] - Update room response
export type UpdateRoomResponse = ApiResponse<MeetingRoomWithGroup>

// DELETE /api/rooms/[id] - Delete room response
export type DeleteRoomResponse = ApiResponse<{ id: string }>

// Error response
export type RoomErrorResponse = ApiResponse<never>