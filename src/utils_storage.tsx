import {
  ChannelData,
  PlaylistData,
  ScrollData,
  FormData,
  CurrentChannel,
} from "./types"

const CHANNELDATA = "CHANNELDATA"
const PLAYLISTDATA = "PLAYLISTDATA"
const SCROLLDATA = "SCROLLDATA"
const CURRENTCHANNEL = "CURRENTCHANNEL"
const FORMDATA = "FormData"

//FORMDATA
export const writeFormData = (data: FormData): void => {
  localStorage.setItem(FORMDATA, JSON.stringify(data))
}

export const readFormData = (): FormData | null => {
  let formData_json = localStorage.getItem(FORMDATA)

  return formData_json ? JSON.parse(formData_json) : null
}

//CHANNELDATA
export const readChannelData = (): ChannelData | null => {
  let channelData_json = localStorage.getItem(CHANNELDATA)

  return channelData_json ? JSON.parse(channelData_json) : null
}

export const writeChannelData = (channelData_new: ChannelData): void => {
  let channelData_json = JSON.stringify(channelData_new)

  localStorage.setItem(CHANNELDATA, channelData_json)
}

//PLAYLISTDATA
export const readCachedPlaylistData = (): PlaylistData | null => {
  let playlistData_json = localStorage.getItem(PLAYLISTDATA)

  return playlistData_json ? JSON.parse(playlistData_json) : null
}

export const writePlaylistDataToCache = (playlistData_new: PlaylistData) => {
  let playlistData_json = JSON.stringify(playlistData_new)

  localStorage.setItem(PLAYLISTDATA, playlistData_json)
}

//SCROLLDATA
export const writeScrollData = (scrollData_new: ScrollData): void => {
  let scrollData_json = JSON.stringify(scrollData_new)
  localStorage.setItem(SCROLLDATA, scrollData_json)
}

export const readScrollData = (): ScrollData | null => {
  let scrollData_json = localStorage.getItem(SCROLLDATA)

  return scrollData_json ? JSON.parse(scrollData_json) : null
}

//CURRENTCHANNEL
export const writeCurrentChannel = (currentChannelData_new: CurrentChannel) => {
  let currentChannelData_json = JSON.stringify(currentChannelData_new)

  localStorage.setItem(CURRENTCHANNEL, currentChannelData_json)
}

export const readCurrentChannel = (): CurrentChannel | null => {
  let currentChannel_json = localStorage.getItem(CURRENTCHANNEL)
  return currentChannel_json ? JSON.parse(currentChannel_json) : null
}
