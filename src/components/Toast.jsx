import React from "react"

const Toast = ({message, type, closerCallback}) => {
    
    let animation_ref = React.useRef({message, type})
    let toast_body_ref = React.useRef(null)
    let toast_animations_ref = React.useRef(null)

    React.useEffect(() => {

        if (!toast_animations_ref.current) {
            toast_animations_ref.current = toast_body_ref.current.getAnimations()
        }
        
        toast_animations_ref.current.forEach((animation) => {
            animation.cancel()
            animation.play()
        })
        
        toast_body_ref.current?.addEventListener("animationend", () => {
            closerCallback(null)
        })

        return () => {
            toast_body_ref.current?.removeEventListener("animationEnd", () => {
                closerCallback(null)
            })
        }
    })  

    return (
        <div className={
            `
                toast_body 
                ${type ? "toast_success" : "toast_error"}
                toast_fade
            `
            }
            ref={toast_body_ref}
        >
            <span>{message}</span>
        </div>
    )
}

export { Toast }