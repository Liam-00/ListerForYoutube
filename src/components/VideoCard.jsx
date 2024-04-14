import React from "react"

const VideoCard = ({title, date, thumbnail, id}) => {
    let link = `http://youtube.com/watch?v=${id}`
    
    const cardRef = React.useRef(null)

    const handleImgLoad = () => {
        cardRef.current.classList.add("videocard_visible")
    }
    
    return (
        <div className={`videocard`} ref={cardRef} style={{transition: "opacity 0.5s"}}>
            <a href={link}>
                <img src={thumbnail} onLoad={handleImgLoad} />
            </a>
            <div className="videoinfoblock">
                <a href={link}> 
                    <h2>{title}</h2>
                </a>
                <p>{date}</p>    
            </div>
        </div>
    )
}

export {VideoCard}