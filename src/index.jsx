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
            return null
        }

        let playlist = await getChannelPlaylist(id, FormData.api_key)

        if (!playlist) return null
        
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
        //uses nextpage token and id from currently loaded playlist
        let pageToken = localPlaylist[localPlaylist.length - 1].nextPageToken
        let channelId = localPlaylist[localPlaylist.length - 1].items[0].snippet.channelId
        let channelName = localPlaylist[localPlaylist.length - 1].items[0].snippet.channelTitle

        let nextPlaylistSet = await getChannelPlaylist(channelId, FormData.api_key, pageToken)
        
        let newCompletePlaylistArray = [...localPlaylist, nextPlaylistSet]
        
        //update cache if channel already in cache
        let cache_check = Object.keys(channelData).includes(channelId)
        if (cache_check) {
            setChannelData(createChannelData( {[channelId]: channelName}, channelData) )
            setPlaylistData(createPlaylistData({[channelId]: newCompletePlaylistArray}, playlistData))
        }

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
        let channelId = localPlaylist[0].items[0].snippet.channelId
        let channelName = localPlaylist[0].items[0].snippet.channelTitle

        //construct new playlistdata
        let newBasePlaylist = await getChannelPlaylist(channelId, FormData.api_key)

        if (!newBasePlaylist) return null

        //creating the first entry of the new playlist
        let newPlaylistData = [newBasePlaylist]

        //loop through the number of playlist sets currently loaded to fetch the number of pages that equaals localPlaylist
        let playlistCount = localPlaylist.length - 1
        while (playlistCount > 0) {
            let nextPlaylist = await getChannelPlaylist(
                channelId, 
                FormData.api_key, 
                newPlaylistData[newPlaylistData.length - 1].nextPageToken
            )

            newPlaylistData.push(nextPlaylist)
            playlistCount--
        }
        
//########################################################################################
        //FIND NUMBER OF NEW VIDEO ENTRIES
        let newElement_count = 0
        let break_check = false
        
        //loop through newPlaylistData constructed so far
        for (let i_list = 0; i_list < newPlaylistData.length; i_list++) {
            //loop through each item of each list in newPlaylistData
            for (let i_video = 0; i_video < newPlaylistData[i_list].items.length; i_video++) {
                //when the 0th index video in localplaylistdata is found in the new data,
                //break both loops with break_check
                if (newPlaylistData[i_list].items[i_video].id === localPlaylist[0].items[0].id) {
                    break_check = true
                    break
                }

                //otherwise count new videos until previous most recent is found
                newElement_count ++
            }
            if (break_check) break
        }
        
        //RETRIEVE EXTRA PAGES AS NECESSARY
       
        //to calculate scroll distance and page count compensation, we: 
        //1. take the videocard closest to the center of the screen
        //2. figure out how many videos are BELOW that center video
        //3. then calc the extra pages needed
        //3.1 this is affected by A. How many new videos were loaded vs how much space the 
        //center video can be moved down the list, and B. if more than 50 new videos were loaded
        //since we can fetch a max of 50 videos per request.
        
        
        //find videocard currently at center off screen
        let centerElements = document.elementsFromPoint(screen.width/2, screen.height/2)
        let centerVideocard = centerElements.filter(element => {
            if (element.classList.contains("videocard")) return element
        })[0]

        //find how many elements there are after current middle videocard
        let videocardsParent = centerVideocard.parentElement
        let videocardsAfterCenter_count = 0
        for (let i = videocardsParent.children.length; i > 0; i--) {
            videocardsAfterCenter_count++
        }

        //calc number of extra pages necessary to keep current position in page
        let extraPage_count = (videocardsAfterCenter_count - newElement_count < 0 ? 1 : 0) + Math.floor( newElement_count / 50 )
        
        //fetch and add extra pages
        while (extraPage_count > 0) {
            let nextPlaylist = await getChannelPlaylist(
                channelId, 
                FormData.api_key, 
                newPlaylistData[newPlaylistData.length - 1].nextPageToken
            )

            newPlaylistData.push(nextPlaylist)
            extraPage_count--
        }

        //CALC HEIGHT OF VIDEO CARD
        let videocard = document.getElementsByClassName("videocard")[0]
        let videocard_height = videocard.clientHeight + parseFloat(window.getComputedStyle(videocard).getPropertyValue('margin-top'))
        
        let scrollDistance_additional = videocard_height * newElement_count
//########################################################################################


        //update cache if reloaded channel is cached
        // let channelList = Object.keys(channelData)

        // if ( channelList.includes(channelId) ) {
            
        //     setChannelData(
        //         createChannelData({[channelId]: channelName}, channelData)
        //     )
        //     setPlaylistData(
        //        createPlaylistData({[channelId]: newPlaylistData}, playlistData)
        //     )
        //     setScrollData(
        //         createScrollData(
        //             {[channelId]: scrollData[channelId] + scrollDistance_additional}, 
        //             scrollData
        //         )
        //     )
        // }

        // setLocalPlaylist(newPlaylistData)
    }

    const handleChannelListItemClick = (channelId) => {
        setCurrentChannel(channelId)
        setLocalPlaylist(playlistData[channelId])
    }

    const handleChannelListItemRemove = (channelId) => {
        let newPlaylistData = {...playlistData}
        let newChannelData = {...channelData}
        let newScrollData = {...scrollData}

        delete newPlaylistData[channelId]
        delete newChannelData[channelId]
        delete newScrollData[channelId]
        
        if (channelId === currentChannel) {
            setCurrentChannel(null)
        }
        
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
    React.useEffect (() => {
        
        //RESTORE STORED SCROLL POSITION
        
        if (currentChannel) {
            window.scrollTo( {top: scrollData[currentChannel], left: 0, behavior: "instant"} )
        } else {
            window.scrollTo( {top: 0, left: 0, behavior: "instant"})
        }

        //LISTENER THAT STORES SCROLL POSITION
        const handlescroll = (e) => {
            setScrollData(createScrollData({[currentChannel]: window.scrollY}, scrollData))
        }
        
        if (currentChannel) window.addEventListener("scrollend", handlescroll )

        return () => window.removeEventListener("scrollend", handlescroll)
    }, [currentChannel])


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
                    {localPlaylist.length > 0 ?  <button onClick={handleLoadMore} className="button videolist_button marginTop" content="Load More">Load More</button> : null}
                </div>            
            </section>
            <button className="button button_floating" onClick={handleScrollToTop}>Scroll to Top</button>
        </>
    )
}


const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>)

