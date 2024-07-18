# Lister For Youtube

ACCESS HERE: https://liam-00.github.io/ListerForYoutube/

- This application can fetch and chronologically list all of the videos in a given youtube channel. This is meant to make watching through the history of a channel far easier by storing channels as playlists with saved progress.

# Features

- Data is stored locally in browser. Stored playlists and the scroll position for each are stored with the browsers localStorage API, this works in most desktop and mobile browsers.
- Youtube API access is provided by user and can be stored in the application.
- Playlist management: Playlists can be switched, added, removed and updated.

# Usage:

## API Key:

- Usage requires you to provide a Google API Key with `YouTube Data API v3` enabled, this can be setup on the https://console.cloud.google.com/ with a Google account.

## Loading Channels

- To load a channel, you must provide that channels `handle`. This unique identifier is often different from the channel name and can be found on the channels youtube page, prefixed with an @. The @ is optional when loading a channel.
- With the `handle` and `api key` filled in, `Get Videos` will load that channel without adding it to storage. Videos are loaded 50 at a time and `Load More` at the bottom of the page will load the next 50 entries.

## Channel Management

- `Add Channel` will add the currently loaded channel playlist to storage. When stored, the cached playlist can be opened from the `Channels` list or removed by closing the entry in the `Channels` list. If a channel is stored, your scroll position will also be saved whenever you scroll through this playlist and restored when re-opening that playlist.
- `Reload` will refresh the currently opened playlist, adding any videos new since the channel was added to storage or last reloaded.
- `Channels` will toggle visibility of the channel list.

# Building/Development

## Install

- After closing, use `npm install` to add dependencies.
- `npm run dev` will build from the `src` directory and run a Webpack dev server on `localhost:9000`. This will not emit any built files to `/dist`, the dev server runs entirely in memory.
- `npm run build-dev` will build from `src` and emit built files to `/dist` without running a dev server. These files will be build in development mode and will not be minified.
- `npm run build` will build form `src` and emit minified, production ready, files to `/dist`.

## Hosting

- The project is meant to work serverless with static hosting. After building the project, all files in `/dist` must be exposed and accessible as a public folder.
