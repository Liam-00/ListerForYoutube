import React from "react"

interface VideoCard_Prop {
  title: string
  date: string
  thumbnail: string
  id: string
}

const VideoCard = ({ title, date, thumbnail, id }: VideoCard_Prop) => {
  let link = `http://youtube.com/watch?v=${id}`

  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleImgLoad = () => {
    cardRef.current?.classList.add("videocard_visible")
  }

  return (
    <div
      className={`videocard`}
      ref={cardRef}
      style={{ transition: "opacity 0.5s" }}>
      <a href={link}>
        <img src={thumbnail} onLoad={handleImgLoad} />
      </a>
      <div className="videoinfoblock">
        <h2>
          <a href={link}>{title}</a>
        </h2>
        <p>{date}</p>
      </div>
    </div>
  )
}

export { VideoCard }
