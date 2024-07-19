import React from "react"

const Toast = ({ toast, setToast }) => {
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
      setToast(null)
    })

    return () => {
      toast_body_ref.current?.removeEventListener("animationEnd", () => {
        setToast(null)
      })
    }
  }, [toast, setToast])

  return (
    <div
      className={`
                toast_body 
                ${toast.type ? "toast_success" : "toast_error"}
                toast_fade
            `}
      ref={toast_body_ref}>
      <span>{toast.message}</span>
    </div>
  )
}

export { Toast }
