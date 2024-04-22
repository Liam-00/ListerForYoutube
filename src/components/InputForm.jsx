import React from "react"

const InputForm = ({formState, handleChange, handleSubmit}) => {
    return (
        <form className="inputform inputform_col" onSubmit={handleSubmit} method="post" action="javascript:void(0);" >
            <div className="inputform_row">
                <input 
                    id="textbox_channelname" 
                    type="text" 
                    name="channel_handle" 
                    placeholder="channel handle: @channelName" 
                    value={formState.channel_handle}
                    onChange={handleChange}
                    autoComplete="off"/>
                
                <input 
                    id="textbox_apikey" 
                    type="text" 
                    name="api_key" 
                    placeholder="API Key here..." 
                    value={formState.api_key} 
                    onChange={handleChange}
                    autoComplete="off"/>
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

export {InputForm}