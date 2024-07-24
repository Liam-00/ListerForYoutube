import { ChannelData, PlaylistData, ScrollData } from "./types"

export const createChannelData = (
  newChannelDataEntry: ChannelData | undefined = undefined,
  oldChannelData: ChannelData | undefined = undefined,
): ChannelData => {
  let channelId =
    newChannelDataEntry ? Object.keys(newChannelDataEntry)[0] : null

  return {
    ...(oldChannelData ? oldChannelData : {}),
    ...(newChannelDataEntry ? newChannelDataEntry : {}),
  }
}

export const createPlaylistData = (
  newChannelPlaylistEntry: PlaylistData | undefined = undefined,
  oldPlaylistData: PlaylistData | undefined = undefined,
): PlaylistData => {
  let channelId =
    newChannelPlaylistEntry ? Object.keys(newChannelPlaylistEntry)[0] : null

  return {
    ...(oldPlaylistData ? oldPlaylistData : {}),
    ...(newChannelPlaylistEntry ? newChannelPlaylistEntry : {}),
  }
}

export const createScrollData = (
  newScrollDataEntry: ScrollData | undefined = undefined,
  oldScrollData: ScrollData | undefined = undefined,
): ScrollData => {
  let channelId = newScrollDataEntry ? Object.keys(newScrollDataEntry)[0] : null

  return {
    ...(oldScrollData ? oldScrollData : {}),
    ...(newScrollDataEntry ? newScrollDataEntry : {}),
  }
}
