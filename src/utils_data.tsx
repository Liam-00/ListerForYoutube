/*
CHANNELDATA
{
    channeId:string : channelName:string,
    channeId:string : channelName:string,
    ...
}


PLAYLISTDATA
{
    channelId: [playlists:youtuberesponse]
}


SCROLLDATA
{
    channelId: scrollDistance:int
}

CURRENTCHANNEL
channeId:string
*/

export const createChannelData = (
  newChannelDataEntry = undefined,
  oldChannelData = undefined,
) => {
  let channelId =
    newChannelDataEntry ? Object.keys(newChannelDataEntry)[0] : null

  return {
    ...(oldChannelData ? oldChannelData : {}),
    ...(newChannelDataEntry ? newChannelDataEntry : {}),
  }
}

export const createPlaylistData = (
  newChannelPlaylistEntry = undefined,
  oldPlaylistData = undefined,
) => {
  let channelId =
    newChannelPlaylistEntry ? Object.keys(newChannelPlaylistEntry)[0] : null

  return {
    ...(oldPlaylistData ? oldPlaylistData : {}),
    ...(newChannelPlaylistEntry ? newChannelPlaylistEntry : {}),
  }
}

export const createScrollData = (
  newScrollDataEntry = undefined,
  oldScrollData = undefined,
) => {
  let channelId = newScrollDataEntry ? Object.keys(newScrollDataEntry)[0] : null

  return {
    ...(oldScrollData ? oldScrollData : {}),
    ...(newScrollDataEntry ? newScrollDataEntry : {}),
  }
}
