import { useEffect, useRef, useState } from "react";
import Header from "./Components/Header";
import ImageRenderer from "./Components/ImageRenderer";
import Card from "./Components/Card";
import { createRoot } from "react-dom/client";
import Dialog from "./Components/Dialog";
import Sections from "./Components/Sections";
import Size from "./Tabs/Size";
import { AppState, SpotifyDevice, availableCustomIcons } from "./Interface/Interfaces";
import Render from "./Tabs/Render";
import GeneralTab from "./Tabs/GeneralTab";
import ThemeManager from "./Scripts/ThemeManager";

let lastRequestDate = 0;
export default function App() {
  let [state, updateState] = useState<AppState>({
    token: null,
    refreshPlayback: Date.now(),
    next: false,
    forceReRender: false,
    sendDataProvided: false
  });
  let spotiLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    window.addEventListener("message", (msg) => {
      if (msg.origin !== window.location.origin) return;
      const json = JSON.parse(msg.data);
      json.token && updateState(prevState => { return { ...prevState, token: json.token, next: true } });
    });
    window.addEventListener("focus", () => {
      updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } })
    });
    if (document.createElement("canvas").getContext("2d")?.filter === undefined) {
      let script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/context-filter-polyfill@0.3.6/dist/index.min.js";
      document.body.append(script);
    }
    localStorage.getItem("iMusicUI-DefaultTheme") === "a" && ThemeManager.apply(true)
  }, []);
  useEffect(() => {
    state.sendDataProvided && window.updateRenderState(prevState => { return { ...prevState, dataProvided: true } })
  }, [state.sendDataProvided])
  useEffect(() => {
    (async () => {
      if (state.token !== "" && state.token !== null && (Date.now() - lastRequestDate) > 4500) {
        lastRequestDate = Date.now()
        const request = await fetch(`https://api.spotify.com/v1/me/player`, {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        const json = await request.json();
        window.updateRenderState(prevState => { return { ...prevState, album: json.item.album.name, author: json.item.artists[0].name, title: json.item.name, maxPlayback: json.item.duration_ms, currentPlayback: json.progress_ms, img: json.item.album.images[0].url, devicePlaybackType: json.device.type.toLowerCase(), isPlaying: json.is_playing, forceReRender: state.forceReRender ? Date.now() : prevState.forceReRender, dataProvided: true } })
        state.forceReRender = false;
        if (spotiLinkRef.current) spotiLinkRef.current.href = json.item.external_urls.spotify
      }
    })()
  }, [state.token, state.refreshPlayback, state.forceReRender])
  return <>
    <Header></Header>
    <i>Create an iOS-like music UI, by using Spotify API</i><br></br><br></br>
    {!state.next ? <><button onClick={() => {
      window.open(`https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent("282dc0486ba74b6d8a9acde0fee407f4")}&scope=${encodeURIComponent("user-read-currently-playing user-modify-playback-state user-read-playback-state")}&redirect_uri=${window.location.href.substring(0, window.location.href.lastIndexOf("/"))}/oauth.html`, "_blank", "width=500,height=350");
    }}>Connect to Spotify</button><br></br><button style={{ backgroundColor: "var(--card)" }} onClick={() => updateState(prevState => { return { ...prevState, next: true, sendDataProvided: true } })}>Manually add metadata</button></> : state.token !== "" ? <>
      <div className="flex mainComponentDiv">
        <Card>
          <ImageRenderer refresh={() => {
            if (state.token !== null) updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } })
          }} event={async (type) => {
            async function spotifyRequest(link: string, method = "PUT", body?: string) {
              const req = await fetch(link, {
                method: method,
                headers: {
                  Authorization: `Bearer ${state.token}`
                },
                body: body
              });
              if (!link.endsWith("devices") && req.status !== 204) throw new Error("Failed Spotify request");
              return req;
            }
            if (type !== "device") {
              await spotifyRequest(`https://api.spotify.com/v1/me/player/${type === "prev" ? "previous" : type}`, type === "pause" || type === "play" || type.startsWith("seek") ? "PUT" : "POST");
              updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } });
            } else {
              const req = await spotifyRequest(`https://api.spotify.com/v1/me/player/devices`, "GET");
              if (req.status === 200) {
                const devices = (await req.json()).devices as SpotifyDevice[];
                let div = document.createElement("div");
                function closeDialog() {
                  return new Promise<void>((resolve) => {
                    (div.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
                    setTimeout(() => {
                      div.remove();
                      resolve();
                    }, 210);
                  })
                }
                createRoot(div).render(<Dialog close={() => closeDialog()}>
                  <h2>Transfer playback:</h2>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {devices.map(item => <div style={{ marginBottom: "10px", marginLeft: "10px" }} onClick={async () => {
                      await spotifyRequest(`https://api.spotify.com/v1/me/player`, "PUT", JSON.stringify({
                        device_ids: [item.id]
                      }));
                      await closeDialog();
                      updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } });
                    }}><Card type={1}>
                        <div className="flex hcenter pointer">
                          <img src={availableCustomIcons.indexOf(item.type.toLowerCase()) !== -1 ? `${item.type.toLowerCase()}.svg` : `./playbackDevice.svg`} width={24}></img>
                          <label style={{ marginLeft: "10px" }}>{item.name}</label>
                        </div>
                      </Card></div>)}
                  </div>
                </Dialog>);
                (document.fullscreenElement ?? document.body).append(div);
              }
            }

          }}></ImageRenderer>
        </Card>
        <Card fullWidth={true}>
          <GeneralTab mainState={updateState}></GeneralTab>
          {state.token !== null &&
            <><br></br><br></br><Card type={1}>
              <h4>Data provided by:</h4>
              <img src="./spotify.png" style={{ maxWidth: "200px", backdropFilter: "brightness(50%)", WebkitBackdropFilter: "brightness(50%)", borderRadius: "8px", padding: "10px" }}></img><br></br>
              <a ref={spotiLinkRef} target="_blank">Open current track on Spotify</a>
            </Card></>}
        </Card>
      </div>
    </> : <></>}
  </>
}