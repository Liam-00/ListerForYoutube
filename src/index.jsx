import React, { useState } from 'react';
import ReactDOM from 'react-dom/client'

import { InputForm } from './components/InputForm.jsx';
import { VideoCard } from './components/VideoCard.jsx';
import { ChannelListItem } from './components/ChannelListItem.jsx';
import { 
    readFormData, readCachedPlaylistData, writePlaylistDataToCache, 
    readChannelData, writeChannelData, writeFormData, readScrollData, writeScrollData, 
    readCurrentChannel, writeCurrentChannel
    } from './utils_storage.jsx';

import { createChannelData, createPlaylistData, createScrollData } from './utils_data.jsx';


//API UTILS

const getChannelID = async (channelHandle, apiKey) => {

    const response_channelId = await fetch (
        `https://www.googleapis.com/youtube/v3/channels?forHandle=${channelHandle}&part=id&key=${apiKey}`
    )
    const json_channelId = await response_channelId.json();

    if (json_channelId.items) {
        console.log(json_channelId)
        return json_channelId['items'][0]['id']
    }

    return null
}


const getChannelPlaylist = async (channelId, apiKey, nextPageToken) => {

    const playlistId = `UULF${channelId.slice(2)}`
    const pageToken = nextPageToken ?  `&pageToken=${nextPageToken}` : ``

    let result = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?`
        +`key=${apiKey}&`
        +`part=contentDetails,id,snippet,status&`
        +`playlistId=${playlistId}&`
        +`maxResults=50`
        +`${pageToken}`
    
    )

    if (result.ok) {
        return await result.json()
    }

    return null
}

const App = () => {
    
    //STATE=================================================================
    const [FormData, setFormData] = React.useState(
        () => {
            // let storedJson = localStorage.getItem("FormData") ?? ""
            // let data = storedJson.length > 0 ? JSON.parse(storedJson) : null
            
            let data = readFormData()

            return {
                channel_handle: (data?.channel_handle && data?.do_save_video_results) ? data.channel_handle : "",
                api_key: data?.api_key && data?.do_save_api_key ? data.api_key : "",
                do_save_api_key: data?.do_save_api_key ?? false,
                do_save_video_results: data?.do_save_video_results ?? false
            }
        }
    )
    
    const [showChannelList, setShowChannelList] = React.useState(true)

    const [playlistData, setPlaylistData] = React.useState(() => {
        let Data = readCachedPlaylistData()
        if (!Data) {
            writePlaylistDataToCache(createPlaylistData())
            return {}
        }
        return Data
    })
    
    const [channelData, setChannelData] = React.useState(() => {
        let Data = readChannelData() 

        if (!Data) {
            writeChannelData(createChannelData())
            return {}
        }
        return Data
    })

    const [scrollData, setScrollData] = React.useState(() => {
        let Data = readScrollData()

        if (!Data) {
            writeScrollData(createScrollData())
        }
        return Data
    })

    const [currentChannel, setCurrentChannel] = React.useState(() => {
        let channel = readCurrentChannel()

        if (!channel) {
            return ""
        }

        return channel
    })

    const [localPlaylist, setLocalPlaylist] = React.useState(() => {
        
        if (channelData.currentChannel) {
            return playlistData[channelData.currentChannel]
        }
        
        return []
    })
 
    const refChannelList = React.useRef(null)


    //HANDLERS=================================================================
    const handleScrollToTop = () => {
        window.scrollTo( {top: 0, left: 0, behavior: "instant"} )
    }

    const handleToggleChannelListView = () => {
        showChannelList ? 
            refChannelList.current.classList.add("channel_list_hidden")
            :
            refChannelList.current.classList.remove("channel_list_hidden")
        
            setShowChannelList(!showChannelList)
    }

    const handleFormChange = (e) => {
        let newState = {...FormData, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}
        writeFormData(newState)
        setFormData(newState)
    }

    const handleFormSubmit = async (e) => {
        
        //get requested playlist by channel handle
        let id = await getChannelID(FormData.channel_handle, FormData.api_key)
        
        //TODO: spawn toast to inform error
        if (!id) {
            console.log("error")
            return null
        }

        let playlist = await getChannelPlaylist(id, FormData.api_key)
        
        //check if channel is cached and update
        let channelId = `${playlist.items[0].snippet.channelId}`
        let channelName = `${playlist.items[0].snippet.channelTitle}`

        let cache_check = Object.keys(channelData.channels).includes(channelId)
        if (cache_check) {
            setChannelData(
                {
                    ...channelData, 
                    channels: {...channelData.channels, channelId: channelName},
                    currentChannel: channelId
                }
            )
            setPlaylistData(
                {
                    ...playlistData,
                    channelId: [playlist]
                }
            )
        }

        //set local playlistData
        setLocalPlaylist([playlist])
        e.preventDefault()
    }

    const handleLoadMore = async () => {
        //uses nextpage token and id from currently loaded playlist
        let pageToken = localPlaylist[localPlaylist.length - 1].nextPageToken
        let channelId = localPlaylist[localPlaylist.length - 1].items[0].snippet.channelId
        let channelName = localPlaylist[localPlaylist.length - 1].items[0].snippet.channelName

        let nextPlaylistSet = await getChannelPlaylist(channelId, FormData.api_key, pageToken)
        
        let newCompletePlaylistArray = [...localPlaylist, nextPlaylistSet]
        
        //update cache if channel already in cache
        let cache_check = Object.keys(channelData.channels).includes(channelId)
        if (cache_check) {
            setChannelData(
                {
                    ...channelData, 
                    channels: {...channelData.channels, channelId: channelName},
                    currentChannel: channelId
                }
            )
            setPlaylistData(
                {
                    ...playlistData,
                    channelId: newCompletePlaylistArray
                }
            )
        }

        setLocalPlaylist(newCompletePlaylistArray)
    }
    
    const handleAddChannel = () => {
        let channelId = localPlaylist[0].items[0].snippet.channelId
        let channelName = localPlaylist[0].items[0].snippet.channelTitle
        setChannelData(
            {
                ...channelData, 
                channels: {...channelData.channels, [channelId]: channelName},
                currentChannel: channelId
            }
        )
        setPlaylistData(
            {
                ...playlistData,
                [channelId]: localPlaylist
            }
        )
    }

    const handleReloadChannelPlaylist = async () => {
        let channelId = localPlaylist[0].items[0].snippet.channelId
        let channelName = localPlaylist[0].items[0].snippet.channelName

        //construct new playlistdata
        let playlistCount = localPlaylist.length
        let newBasePlaylist = await getChannelPlaylist(channelId, FormData.api_key)
        
        let newPlaylistData = [newBasePlaylist]
    
        playlistCount--

        while (playlistCount > 0) {
            let nextPlaylist = await getChannelPlaylist(
                channelId, 
                FormData.api_key, 
                newPlaylistData[newPlaylistData.length - 1].nextPageToken
            )

            newPlaylistData.push(nextPlaylist)
        }

        let channelList = Object.keys(channelData.channels)

        if ( channelList.includes(channelId) ) {
            
            setChannelData(
                {
                    ...channelData, 
                    channels: {...channelData.channels, channelId: channelName},
                    currentChannel: channelId
                }
            )
            setPlaylistData(
                {
                    ...playlistData,
                    channelId: [newPlaylistData]
                }
            )
        }

        setLocalPlaylist(newPlaylistData)
    }

    const handleChannelListItemClick = (channelId) => {
        setChannelData(
            {
                ...channelData,
                currentChannel: channelId
            }
        )
        setLocalPlaylist(playlistData[`${channelId}`])
    }

    const handleChannelListItemRemove = (channelId) => {
        let newPlaylistData = {...playlistData}
        let newChannelData = {...channelData}

        delete newPlaylistData[channelId]
        delete newChannelData.channels[channelId]

        setPlaylistData(
            {
                ...newPlaylistData,
            }
        )        
        setChannelData(
            {
                ...newChannelData,
            }
        )
        
    }

    //SCROLL POSITION HANDLING
    React.useEffect (() => {
        
        //RESTORE STORED SCROLL POSITION
        let ScrollPositionJSON = localStorage.getItem("ScrollPosition")
        if (ScrollPositionJSON && FormData.do_save_video_results) window.scrollTo( {top: JSON.parse(ScrollPositionJSON), left: 0, behavior: "instant"} )

        //LISTENER THAT STORES SCROLL POSITION
        const handlescroll = (e) => {
            localStorage.setItem("ScrollPosition", JSON.stringify(window.scrollY))
        }
        
        window.addEventListener("scroll", handlescroll )

        return () => window.removeEventListener("scroll", handlescroll)
    }, [])

    //SYNC CACHE TO PLAYLISTDATA AND CHANNELDATA
    React.useEffect(() => {
        writeChannelData(channelData)
    }, [channelData])

    React.useEffect(() => {
        writePlaylistDataToCache(playlistData)
    }, [playlistData])

    React.useEffect(() => {
        writeScrollData(scrollData)
    }, [scrollData])

    React.useEffect(() => {
        writeCurrentChannel(currentChannel)
    }, [currentChannel])


    return (
        <>
            <section className="controls_section">
                <InputForm 
                    formState={FormData}
                    handleChange={handleFormChange} 
                    handleSubmit={handleFormSubmit}/>
                <div className="button_row">
                        <button 
                        className='button' 
                        onClick={handleAddChannel}
                        disabled={localPlaylist.length > 0 ? false : true}>
                            <svg viewBox='0 0 48 48'>
                                <use href="/icons/icon_map.svg#i_plus"></use>
                            </svg>
                            Add Channel
                        </button>
                        <button 
                        className='button' 
                        onClick={handleReloadChannelPlaylist}
                        disabled={localPlaylist.length > 0 ? false : true}>
                            <svg viewBox='0 0 48 48'>
                                <use href="/icons/icon_map.svg#i_reload"></use>
                            </svg>
                            Reload
                        </button>
                        <button className='button' onClick={handleToggleChannelListView}>
                            <svg viewBox='0 0 48 48'>
                                <use href={showChannelList ? "/icons/icon_map.svg#i_chevron_up": "/icons/icon_map.svg#i_chevron"}></use>
                            </svg>
                            {showChannelList ? "Hide Channels" : "Show Channels"}
                        </button>
                </div>
                <div className='channel_list' ref={refChannelList}>
                    {
                        (() => {
                            let result = []

                            for (const channelId in channelData.channels) {
                                result.push(
                                    <ChannelListItem 
                                        key={channelId}
                                        channelId={channelId}
                                        channelName={channelData.channels[channelId]}
                                        clickHandler={() => {handleChannelListItemClick(channelId)}}
                                        removeHandler={() => {handleChannelListItemRemove(channelId)}}
                                    />
                                )
                            }
                            return result
                        })()
                    }        
                </div>
            </section>
            <section>
                <div>
                    <div className="section_header">
                        <h1>{localPlaylist.length > 0 ? localPlaylist[0].items[0].snippet.channelTitle : ""}</h1>
                    </div>
                    {
                        localPlaylist.length > 0 ?
                            localPlaylist.map(playlistPage => playlistPage.items.map(item => 
                                <VideoCard 
                                    title={item.snippet.title} 
                                    date={new Date(item.snippet.publishedAt).toLocaleDateString('en-GB')}
                                    thumbnail={item.snippet.thumbnails.medium.url}
                                    key={item.id}
                                    id={item.contentDetails.videoId}/>  
                            )).reduce((full, val) => [...full, ...val], [])
                        :
                            null
                    }                
                    {localPlaylist.length > 0 ?  <button onClick={handleLoadMore} className="button videolist_button marginTop" content="Load More">Load More</button> : null}
                </div>            
            </section>
            <button className="button button_floating" onClick={handleScrollToTop}>Scroll to Top</button>
        </>
    )
}


const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>)

