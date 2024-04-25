import React from 'react';
import ReactDOM from 'react-dom/client'

import { InputForm } from './components/InputForm.jsx';
import { VideoCard } from './components/VideoCard.jsx';

//API UTILS

const getChannelID = async (channelHandle, apiKey) => {

    const response_channelId = await fetch (
        `https://www.googleapis.com/youtube/v3/channels?forHandle=${channelHandle}&part=id&key=${apiKey}`
    )
    const json_channelId = await response_channelId.json();
    
    return json_channelId['items'][0]['id'] || null
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
    
    return await result.json()
}

const App = () => {
    
    //UTILS
    const writeFormData = (data) => {
        localStorage.setItem("FormData", JSON.stringify(data))
    }
 
    const readFormData = () => {
        return JSON.parse(localStorage.getItem("FormData") ?? "null")
    }

    const writePlaylistData = (playlistArray) => {
        localStorage.setItem("PlaylistData", JSON.stringify(playlistArray))
    }

    const readPlaylistData = () => {
        return JSON.parse(localStorage.getItem("PlaylistData") ?? "null")
    }


    //STATE
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
    
    const [UsingCachedPlaylist, setUsingCachedPlaylist] = React.useState(false)

    const [PlaylistData, setPlaylistData] = React.useState(
        () => {
            //return empty if list is not saved
            if (!FormData.do_save_video_results) return []

            let data = readPlaylistData() ?? []
            setUsingCachedPlaylist(true)

            return data
        }
    )


    //HANDLERS
    const handleFormChange = (e) => {
        let newState = {...FormData, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}
        writeFormData(newState)
        setFormData(newState)
    }

    const handleFormSubmit = async (e) => {
        //prevent page reloading on submit
        
        let id = await getChannelID(FormData.channel_handle, FormData.api_key)
        
        let playlist = await getChannelPlaylist(id, FormData.api_key)
        
        writePlaylistData([playlist])
        setPlaylistData([playlist])
        setUsingCachedPlaylist(false)
        e.preventDefault()
    }

    const handleLoadMore = async () => {
        let pageToken = PlaylistData[PlaylistData.length - 1].nextPageToken
        let id = PlaylistData[PlaylistData.length - 1].items[0].snippet.channelId

        let nextPlaylistSet = await getChannelPlaylist(id, FormData.api_key, pageToken)
        
        let newCompletePlaylistArray = [...PlaylistData, nextPlaylistSet]
        
        writePlaylistData(newCompletePlaylistArray)
        setPlaylistData(newCompletePlaylistArray)
    }
    
    const handleScrollToTop = () => {
        window.scrollTo( {top: 0, left: 0, behavior: "instant"} )
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

    return (
        <>
            <section className="controls_section">
                    <InputForm 
                        formState={FormData}
                        handleChange={handleFormChange} 
                        handleSubmit={handleFormSubmit}/>
                    <div className="button_row">
                            <button className='button'>
                                <svg viewBox='0 0 48 48'><use href="/icons/icon_map.svg#i_close"></use></svg>Add Channel
                            </button>
                            <button className='button'>
                                <svg viewBox='0 0 48 48'><use href="/icons/icon_map.svg#i_reload"></use></svg>Reload
                            </button>
                            <button className='button'>
                                <svg viewBox='0 0 48 48'><use href="/icons/icon_map.svg#i_chevron"></use></svg>Expand Channels
                            </button>

                    </div>
            </section>
            <section>
                <div>
                    <div className="section_header">
                        <h1>{PlaylistData[0]?.items[0]?.snippet?.channelTitle}</h1>
                        
                    </div>
                    {
                        PlaylistData.length > 0 ?
                            PlaylistData.map(playlistPage => playlistPage.items.map(item => 
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
                    {PlaylistData.length > 0 ?  <button onClick={handleLoadMore} className="button videolist_button marginTop" content="Load More">Load More</button> : null}
                </div>            
            </section>
            <button className="button button_floating" onClick={handleScrollToTop}>Scroll to Top</button>
        </>
    )
}


const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App/>)

