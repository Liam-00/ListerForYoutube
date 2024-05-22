import React from 'react'

const ChannelListItem = ({channelId, channelName, clickHandler, removeHandler}) => {
    
    return (
        <div className='channel_item' onClick={() => clickHandler(channelId)}>
            {channelName}
            <svg viewBox='0 0 48 48' onClick={() => removeHandler(channelId)}>
                <use href="/icons/icon_map.svg#i_close"></use>
            </svg>
        </div>
    )
}

export {ChannelListItem}