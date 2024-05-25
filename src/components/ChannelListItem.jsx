import React from 'react'

const ChannelListItem = ({channelId, channelName, clickHandler, removeHandler}) => {
    
    return (
        <div className='channel_item' onClick={(e) => {e.stopPropagation(); clickHandler(channelId)}}>
            {channelName}
            <svg viewBox='0 0 48 48' onClick={(e) => { e.stopPropagation(); removeHandler(channelId)}}>
                <use href="/icons/icon_map.svg#i_close"></use>
            </svg>
        </div>
    )
}

export {ChannelListItem}