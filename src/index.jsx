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

import "./index.css"

import icon_map from './icons/app_icons_map.svg'
import { Toast } from './components/Toast.jsx';

//API UTILS

const getChannelID = async (channelHandle, apiKey) => {

    const response_channelId = await fetch (
        `https://www.googleapis.com/youtube/v3/channels?forHandle=${channelHandle}&part=id&key=${apiKey}`
    )
    const json_channelId = await response_channelId.json();

    if (json_channelId.items) {
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
                channel_handle: "", //data?.channel_handle ? data.channel_handle : "",
                api_key: data?.api_key && data?.do_save_api_key ? data.api_key : "",
                do_save_api_key: data?.do_save_api_key ?? false,
                do_remember_playlist: data?.do_remember_playlist ?? false
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

    const [didScroll, setDidScroll] = React.useState(false)

    const [currentChannel, setCurrentChannel] = React.useState(() => {
        let channel = readCurrentChannel()

        if (!channel) {
            return null
        }

        return channel
    })

    const [localPlaylist, setLocalPlaylist] = React.useState(() => {
        
        if (FormData.do_remember_playlist && currentChannel) {
            return playlistData[currentChannel]
        }
        
        return []
    })
 
    const [canLoadMore, setCanLoadMore] = React.useState(true)

    const [toast, setToast] = React.useState(null)

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
        e.preventDefault()
        
        //get requested playlist by channel handle
        let id = await getChannelID(FormData.channel_handle, FormData.api_key)
        
        //TODO: spawn toast to inform error
        if (!id) {
            setToast({message: "Error: Could not find channel.", type:false })
            return null
        }

        let playlist = await getChannelPlaylist(id, FormData.api_key)

        if (!playlist) {
            setToast({message: "Error: Could not retrieve videos from channel.", type:false }) 
            return null
        }
        
        //check if channel is cached and update
        let channelId = `${playlist.items[0].snippet.channelId}`
        let channelName = `${playlist.items[0].snippet.channelTitle}`

        let cache_check = Object.keys(channelData).includes(channelId)
        if (cache_check) {
            setChannelData( createChannelData( {[channelId]: channelName}, channelData ) )
            setPlaylistData( createPlaylistData( {[channelId]: [playlist]}, playlistData) )
        }

        setLocalPlaylist([playlist])
        setCurrentChannel(null)
    }

    const handleLoadMore = async () => {
        //fetch details from local data
        let pageToken = localPlaylist[localPlaylist.length - 1].nextPageToken ?? null
        let channelId = localPlaylist[localPlaylist.length - 1].items[0].snippet.channelId ?? null
        let channelName = localPlaylist[localPlaylist.length - 1].items[0].snippet.channelTitle ?? null
    

        if (!channelId || !channelName) {
            setToast({message: "Error: Internal data error.", type:false })
            return null
        }
        
        //fetch next playlist with page token
        let nextPlaylistSet = await getChannelPlaylist(channelId, FormData.api_key, pageToken)
        if (!nextPlaylistSet) {
            setToast({message: "Error: Network or API unavailable.", type:false })
            return null
        }

        //if no more videos exist, update state to disable loadmore button
        if (nextPlaylistSet.nextPageToken === undefined) {
            setCanLoadMore(false)
        }
        
        //build playlist array
        let newCompletePlaylistArray = [...localPlaylist, nextPlaylistSet]
        
        //update cache if channel already in cache
        let cache_check = Object.keys(channelData).includes(channelId)
        if (cache_check) {
            setChannelData(createChannelData( {[channelId]: channelName}, channelData) )
            setPlaylistData(createPlaylistData({[channelId]: newCompletePlaylistArray}, playlistData))
        }

        //update local playlist
        setLocalPlaylist(newCompletePlaylistArray)
    }
    
    const handleAddChannel = () => {
        let channelId = localPlaylist[0].items[0].snippet.channelId
        let channelName = localPlaylist[0].items[0].snippet.channelTitle

        setChannelData(createChannelData({[channelId]: channelName}, channelData))
        setPlaylistData(createPlaylistData({[channelId]: localPlaylist}, playlistData))
        setScrollData(createScrollData({[channelId]: window.scrollY}, scrollData))
        setCurrentChannel(channelId)
    }

    const handleReloadChannelPlaylist = async () => {
        //get channel name and id from the current local playlist
        let channel_id = localPlaylist[0].items[0].snippet.channelId
        let channel_name = localPlaylist[0].items[0].snippet.channelTitle

        let localPlaylist_mostRecentId = localPlaylist[0].items[0].id

      
        

        //find last visible videocard on screen
        let videocards = Array.from(document.getElementsByClassName("videocard"))
        
        let videocard_lowestVisible_index
        
        //loop through videocard indexes
        for (let i_video = videocards.length - 1; i_video >= 0; i_video-- ) {
            
            //get page coordinates of videocard
            let videocard_coordinates = videocards[i_video].getBoundingClientRect()  
            
            //update index of lowest videocard
            videocard_lowestVisible_index = i_video
            
            //when lowest videocard is found, break, leaving the index available
            if( videocard_coordinates.bottom <= visualViewport.height ) {
                break
            }
        }        

        //find lowest visible videocard^ in localplaylist
        //Math.floor(videocard_lowestVisible_index / 50) -is the index of the playlist
        //videocard_lowestVisible_index % 50 -is the index of the videocard within that playlist
        //because playlists have UP TO 50 entries
        let localPlaylist_lowestVisible_entry = localPlaylist[Math.floor(videocard_lowestVisible_index / 50)].items[videocard_lowestVisible_index % 50]
        let localPlaylist_lowestVisible_entry_id = localPlaylist_lowestVisible_entry.id
        

        //fetch new playlists until we reach the lowestVisible videocard - 
        //while fetching AT LEAST the number of currently loaded playlists
        let localPlaylist_mostRecentFound = false
        let newPlaylist_lowestVisibleFound = false

        let newVideos_count = 0
        let newPlaylist_count = 0
        let newPlaylists = []

        //keep looping if we haven't found the lowestVisible in fetched playlists and -
        //the newPlaylists length is less than localPlaylist length 
        for (let i_playlist = 0; !newPlaylist_lowestVisibleFound || newPlaylists.length < localPlaylist.length; i_playlist++) {
            
            //fetch playlist
            //if first playlist already fetched, get next one with nextPageToken
            let newPlaylist = newPlaylists.length === 0 ? 
                await getChannelPlaylist(channel_id, FormData.api_key)
                :
                await getChannelPlaylist(channel_id, FormData.api_key, newPlaylists[newPlaylists.length - 1].nextPageToken)

            //if a fetch ever returns nothing, stop entire operation
            if (!newPlaylist) {
                setToast({message: "Error: Network or API unavailable", type:false })
                return null
            }

            //loop through each playlist to count videos until localPlaylists most recent is found 
            //this gives us the newVideos_count
            for (let i_video = 0; i_video < newPlaylist.items.length; i_video++) {
                
                //checking if localPlaylist most recent
                if (newPlaylist.items[i_video].id === localPlaylist[0].items[0].id) {
                    localPlaylist_mostRecentFound = true
                }
                
                //if not most recent increment newVideos_count
                if (!localPlaylist_mostRecentFound){
                    newVideos_count++
                }

                //check if lowestVisible has been found - this is one of the termination conditions
                //for the main loop
                if (newPlaylist.items[i_video].id === localPlaylist_lowestVisible_entry_id) {
                    newPlaylist_lowestVisibleFound = true
                }
                
            }

            //increment newPlaylists count and push playlist to newPlaylists  
            newPlaylist_count++
            newPlaylists.push(newPlaylist)
        }

        //CALC HEIGHT OF VIDEO CARD
        let videocard = document.getElementsByClassName("videocard")[0]
        let videocard_height = videocard.clientHeight + parseFloat(window.getComputedStyle(videocard).getPropertyValue('margin-top'))
        
        //calc necessary scroll distance given height and number of new videos
        let scrollDistance_additional = videocard_height * newVideos_count

        //update localPlaylist with new playlists
        setLocalPlaylist(newPlaylists)

        //also update cache if reloaded channel is cached
        let channelList = Object.keys(channelData)

        if ( channelList.includes(channel_id) ) {
            
            setChannelData(
                createChannelData({[channel_id]: channel_name}, channelData)
            )
            setPlaylistData(
               createPlaylistData({[channel_id]: newPlaylists}, playlistData)
            )
            setScrollData(
                createScrollData(
                    {[channel_id]: scrollData[channel_id] + scrollDistance_additional}, 
                    scrollData
                )
            )
        }

    }

    const handleChannelListItemClick = (channelId) => {
        setCurrentChannel(channelId)
        setLocalPlaylist(playlistData[channelId])
    }

    const handleChannelListItemRemove = (channelId) => {
        //clone caches
        let newPlaylistData = {...playlistData}
        let newChannelData = {...channelData}
        let newScrollData = {...scrollData}

        //delete removed channel
        delete newPlaylistData[channelId]
        delete newChannelData[channelId]
        delete newScrollData[channelId]
        
        //update current channel if necessary 
        if (channelId === currentChannel) {
            setCurrentChannel(null)
        }
        
        //update caches with new data
        setPlaylistData(
           createPlaylistData(undefined, newPlaylistData)
        )        
        setChannelData(
            createChannelData(undefined, newChannelData)
        )
        setScrollData(
            createScrollData(undefined, newScrollData)
        )
    }
    

    //SCROLL POSITION HANDLING
    //listener to write new scrolldata on scroll end and set scroll position when changing
    //channels
    React.useEffect (() => {
        //when currentChannel changes or on first render, scroll to correct position
        if (currentChannel) {
            window.scrollTo( {top: scrollData[currentChannel], left: 0, behavior: "instant"} )
        } else {
            window.scrollTo( {top: 0, left: 0, behavior: "instant"})
        }

        //listener function
        const handlescroll = (e) => {
            if (currentChannel) {
                setScrollData(createScrollData({[currentChannel]: window.scrollY}, scrollData))
                setDidScroll(true)
            }
        }
        
        window.addEventListener("scrollend", handlescroll )

        return () => window.removeEventListener("scrollend", handlescroll)

    }, [currentChannel])

    //scrollData effect
    //if scrollData change did not result from a scrollend event generated by eventlistener, then 
    //reset didScroll and do nothing.
    //if scrollData change resulted from a reload, then scroll required distance to maintain position
    React.useEffect(() => {
        if (!didScroll) {
            if (currentChannel) {
                window.scrollTo( {top: scrollData[currentChannel], left: 0, behavior: "instant"} )
            } else {
                window.scrollTo( {top: 0, left: 0, behavior: "instant"})
            }
        }
        setDidScroll(false)
    }, [scrollData])


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
                        onMouseDown={handleAddChannel}
                        disabled={localPlaylist.length > 0 ? false : true}>
                            <svg viewBox='0 0 48 48'>
                                <use href={`${icon_map}#i_plus`}></use>
                            </svg>
                            Add Channel
                        </button>
                        <button 
                        className='button' 
                        onMouseDown={handleReloadChannelPlaylist}
                        disabled={localPlaylist.length > 0 ? false : true}>
                            <svg viewBox='0 0 48 48'>
                                <use href={`${icon_map}#i_reload`}></use>
                            </svg>
                            Reload
                        </button>
                        <button 
                        className='button' 
                        onMouseDown={handleToggleChannelListView}>
                            <svg viewBox='0 0 48 48'>
                                <use href={showChannelList ? `${icon_map}#i_chevron_up`: `${icon_map}#i_chevron`}></use>
                            </svg>
                            {showChannelList ? "Channels" : "Channels"}
                        </button>
                </div>
                <div className='channel_list' ref={refChannelList}>
                    {
                        (() => {
                            let result = []

                            for (const channelId in channelData) {
                                result.push(
                                    <ChannelListItem 
                                        key={channelId}
                                        channelId={channelId}
                                        channelName={channelData[channelId]}
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
                        <h1>{localPlaylist.length > 0 ? localPlaylist[0].items[0].snippet.channelTitle : "Welcome to Lister For Youtube!"}</h1>
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
                    {localPlaylist.length > 0 ?  <button onClick={handleLoadMore} disabled={canLoadMore ? false : true} className="button videolist_button marginTop" content="Load More">Load More</button> : null}
                </div>            
            </section>
            <button className="button button_floating" onClick={handleScrollToTop}>Scroll to Top</button>
            {toast !== null ? <Toast message={toast.message} type={toast.type} closerCallback={setToast}/> : null}
        </>
    )
}


const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>)

