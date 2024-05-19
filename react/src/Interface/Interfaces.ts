export interface RenderState {
    img: string,
    background: string,
    title: string,
    author: string,
    album: string,
    currentPlayback: number,
    maxPlayback: number,
    pause: string,
    prev: string,
    next: string,
    play: string,
    width: number,
    height: number,
    font: string,
    color: string,
    playbackDevice: string,
    imgRadius: number,
    iconSize: number,
    metadataColor: string,
    isPlaying: boolean,
    automobile: string,
    game_console: string,
    computer: string,
    smartphone: string,
    speaker: string,
    tablet: string,
    tv: string,
    devicePlaybackType: string,
    forceReRender: number,
    dataProvided: boolean,
    tokenUpdate: number,
    backgroundFilter: string,
    albumArtAsBackground: boolean,
    metadataColorOption: number,
    metadataColorFilter: string,
    metadataColorForceRefresh: number,
    progressBarColor?: HTMLCanvasElement,
    useProgressBarColor: boolean,
    remainingColor: string
}
export interface AppState {
    token: null | string,
    refreshPlayback: number,
    next: boolean,
    forceReRender: boolean,
    sendDataProvided: boolean
}
export interface SpotifyDevice {
    id: string,
    name: string,
    type: string
}
export const availableCustomIcons = ["automobile", "game_console", "computer", "smartphone", "speaker", "tablet", "tv"];