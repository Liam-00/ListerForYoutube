import React, { ChangeEventHandler, FormEventHandler } from "react"
import icon_map from "../icons/app_icons_map.svg"
import { FormData } from "../types"

interface InputForm_Prop {
  formState: FormData
  handleChange: ChangeEventHandler<HTMLInputElement>
  handleSubmit: FormEventHandler<HTMLFormElement>
}

const InputForm = ({
  formState,
  handleChange,
  handleSubmit,
}: InputForm_Prop) => {
  return (
    <form
      className="inputform inputform_col"
      onSubmit={handleSubmit}
      method="post">
      <div className="inputform_row">
        <input
          id="textbox_channelname"
          type="text"
          name="channel_handle"
          placeholder="channel handle: @channelName"
          value={formState.channel_handle}
          onChange={handleChange}
          autoComplete="off"
        />

        <input
          id="textbox_apikey"
          type="text"
          name="api_key"
          placeholder="API Key here..."
          value={formState.api_key}
          onChange={handleChange}
          autoComplete="off"
        />
        <button
          type="submit"
          id="button_submit"
          className="button inputform_button">
          <svg viewBox="0 0 48 48">
            <use href={`${icon_map}#i_search`}></use>
          </svg>
          Get Videos
        </button>
      </div>

      <div className="checkbox_row">
        <label>
          <input
            id="do_save_api_key"
            checked={formState.do_save_api_key}
            type="checkbox"
            name="do_save_api_key"
            onChange={handleChange}
          />{" "}
          Save API Key
        </label>

        <label>
          <input
            id="do_remember_playlist"
            checked={formState.do_remember_playlist}
            type="checkbox"
            name="do_remember_playlist"
            onChange={handleChange}
          />{" "}
          Remember Last Playlist
        </label>
      </div>
    </form>
  )
}

export { InputForm }
