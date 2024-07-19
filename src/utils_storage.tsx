const CHANNELDATA = "CHANNELDATA"
const PLAYLISTDATA = "PLAYLISTDATA"
const SCROLLDATA = "SCROLLDATA"
const CURRENTCHANNEL = "CURRENTCHANNEL"

// channelData: {
//     channels: {channelIdString: channelNameString},
//     currentChannelId: stringId
// }
// cache: {
//     playlists: {
//         channelidstring: {
//             scrollPosition: int,
//             playlistData: []
//         }
//     },
//     channelData: {
//         channelId: channelnamestring
//     }

// }

//FORMDATA
export const writeFormData = (data) => {
  localStorage.setItem("FormData", JSON.stringify(data))
}

export const readFormData = () => {
  return JSON.parse(localStorage.getItem("FormData") ?? "null")
}

//CHANNELDATA
export const readChannelData = () => {
  let channelData_json = localStorage.getItem(CHANNELDATA)

  return channelData_json ? JSON.parse(channelData_json) : null
}

export const writeChannelData = (channelData_new) => {
  let channelData_json = JSON.stringify(channelData_new)
  localStorage.setItem(CHANNELDATA, channelData_json)
}

//PLAYLISTDATA
export const readCachedPlaylistData = () => {
  let playlistData_json = localStorage.getItem(PLAYLISTDATA)
  return playlistData_json ? JSON.parse(playlistData_json) : null
}

export const writePlaylistDataToCache = (playlistData_new) => {
  let playlistData_json = JSON.stringify(playlistData_new)
  localStorage.setItem(PLAYLISTDATA, playlistData_json)
}

//SCROLLDATA
export const writeScrollData = (scrollData) => {
  let scrollData_json = JSON.stringify(scrollData)
  localStorage.setItem(SCROLLDATA, scrollData_json)
}

export const readScrollData = () => {
  let scrollData_json = localStorage.getItem(SCROLLDATA)
  return scrollData_json ? JSON.parse(scrollData_json) : null
}

//CURRENTCHANNEL
export const writeCurrentChannel = (currentChannelData) => {
  let currentChannelData_json = JSON.stringify(currentChannelData)
  localStorage.setItem(CURRENTCHANNEL, currentChannelData_json)
}

export const readCurrentChannel = () => {
  let currentChannel_json = localStorage.getItem(CURRENTCHANNEL)
  return currentChannel_json ? JSON.parse(currentChannel_json) : null
}
