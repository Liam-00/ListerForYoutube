
const VideoCard = ({title, date, thumbnail, id}) => {
    let link = `http://youtube.com/watch?v=${id}`
    
    return (
        <div className="videocard">
            <a href={link}><img src={thumbnail}/></a>
            <div className="videoinfoblock">
                <a href={link}> 
                    <h2>{title}</h2>
                </a>
                <p>{date}</p>    
            </div>
        </div>
    )
}

const InputForm = ({formState, handleChange, handleSubmit}) => {
    return (
        <form className="inputform inputform_col" onSubmit={handleSubmit} method="post">
            <div className="inputform_row">
                <input 
                    id="textbox_channelname" 
                    type="text" 
                    name="channel_handle" 
                    placeholder="channel handle: @channelName" 
                    value={formState.channel_handle}
                    onChange={handleChange}/>
                
                <input 
                    id="textbox_apikey" 
                    type="text" 
                    name="api_key" 
                    placeholder="API Key here..." 
                    value={formState.api_key} 
                    onChange={handleChange}/>
                <button type="submit" id="button_submit" className="button inputform_button">Get Videos</button>
            </div>
            
            <div className="inputform_col">

                <label htmlFor="saveApiKey">
                    <input checked={formState.do_save_api_key} type="checkbox" name="do_save_api_key" onChange={handleChange} /> Save API Key
                </label>

                <label htmlFor="saveVideoResults">
                    <input checked={formState.do_save_video_results} type="checkbox" name="do_save_video_results" onChange={handleChange}/> Cache Video Results
                </label>
                
            </div>
            
        </form>
    )
}

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
    
    //STATE
    const [FormData, setFormData] = React.useState(
        () => {
            let storedJson = localStorage.getItem("FormData") ?? ""
            let data = storedJson.length > 0 ? JSON.parse(storedJson) : null
            
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

            //
            let storedJson = localStorage.getItem("PlaylistData") ?? ""
            let data = []
            if (storedJson.length > 0) {
                data = JSON.parse(storedJson)
                setUsingCachedPlaylist(true)
            }

            return data
        }
    )

    //UTILS
    const writeFormData = (data) => {
        localStorage.setItem("FormData", JSON.stringify(data))
    }

    //HANDLERS
    const handleFormChange = (e) => {
        let newState = {...FormData, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value}
        writeFormData(newState)
        setFormData(newState)
    }

    const handleFormSubmit = async (e) => {
        //prevent page reloading on submit
        e.preventDefault()
                
        let id = await getChannelID(FormData.channel_handle, FormData.api_key)
        
        let playlist = await getChannelPlaylist(id, FormData.api_key)
        localStorage.setItem("PlaylistData", JSON.stringify([playlist]))

        setUsingCachedPlaylist(false)
        setPlaylistData([playlist])
    }

    const handleLoadMore = async () => {
        let pageToken = PlaylistData[PlaylistData.length - 1].nextPageToken

        let id = PlaylistData[PlaylistData.length - 1].items[0].snippet.channelId
        let nextPlaylistSet = await getChannelPlaylist(id, FormData.api_key, pageToken)
        
        let newCompletePlaylist = [...PlaylistData, nextPlaylistSet]
        if (FormData.do_save_video_results) localStorage.setItem("PlaylistData", JSON.stringify(newCompletePlaylist))

        setPlaylistData(newCompletePlaylist)
    }
    
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
            <section>
                <InputForm 
                    formState={FormData}
                    handleChange={handleFormChange} 
                    handleSubmit={handleFormSubmit}/>
            </section>
            <section>
                <div>
                    <h1>VIDEOS{UsingCachedPlaylist ? " - cached data" : ""}</h1>
                    {
                        PlaylistData.length > 0 ?
                            PlaylistData.map(playlistPage => playlistPage.items.map(item => 
                                <VideoCard 
                                title={item.snippet.title} 
                                date={new Date(item.snippet.publishedAt).toLocaleDateString()}
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
        </>
    )
}


const root = ReactDOM.createRoot(document.getElementById('aapp'));
root.render(<App/>)

