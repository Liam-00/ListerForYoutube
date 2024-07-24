import { YoutubePlaylistItem } from "./types_youtube"

export type ChannelId = string
export type ChannelName = string
export type ChannelHandle = string
export type ScrollDistance = number
export type CurrentChannel = ChannelId | null
export type ApiKey = string
export type PageToken = string

export type ChannelData = Record<ChannelId, ChannelName>
export type PlaylistData = Record<ChannelId, Array<YoutubePlaylistItem>>
export type ScrollData = Record<ChannelId, ScrollDistance>

export interface Toast_Data {
  message: string
  type: boolean
}

export interface FormData {
  api_key: string
  channel_handle: ChannelHandle
  do_remember_playlist: boolean
  do_save_api_key: boolean
}
