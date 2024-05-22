    export const CHANNELDATA = "CHANNELDATA"
    export const PLAYLISTDATA = "PLAYLISTDATA"
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

    

    export const writeFormData = (data) => {
        localStorage.setItem("FormData", JSON.stringify(data))
    }
 
    export const readFormData = () => {
        return JSON.parse(localStorage.getItem("FormData") ?? "null")
    }

    export const readChannelData = () => {
        let channelData_json = localStorage.getItem(CHANNELDATA);

        return channelData_json ? JSON.parse(channelData_json) : null
    }

    export const writeChannelData = (channelData_new) => {
        let channelData_json = JSON.stringify(channelData_new)
        localStorage.setItem(CHANNELDATA, channelData_json)
    }
    
    export const readCachedPlaylistData = () => {
        let playlistData_json = localStorage.getItem(PLAYLISTDATA)
        return playlistData_json ? JSON.parse(playlistData_json) : null
    }

    export const writePlaylistDataToCache = (playlistData_new) => {
        let playlistData_json = JSON.stringify(playlistData_new)
        localStorage.setItem(PLAYLISTDATA, playlistData_json)
    }
