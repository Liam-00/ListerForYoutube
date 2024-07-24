import React from "react"
import { Toast_Data } from "../types"

interface Toast_Prop {
  toast: Toast_Data
  setToast(toast_data_new: Toast_Data | null): void
}

const Toast = ({ toast, setToast }: Toast_Prop) => {
  let toast_body_ref = React.useRef<HTMLDivElement | null>(null)
  let toast_animations_ref = React.useRef<Animation[] | null>(null)

  React.useEffect(() => {
    if (!toast_animations_ref.current) {
      toast_animations_ref.current = toast_body_ref.current!.getAnimations()
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
