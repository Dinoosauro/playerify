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
import example from "./assets/example.jpg";
import IndexedDatabase from "./Scripts/IndexedDatabase";
import OpenSource from "./Components/OpenSource";
import GetFullSize from "./Scripts/GetFullSize";

let lastRequestDate = 0;
export default function App() {
  let [state, updateState] = useState<AppState>({
    token: null,
    refreshPlayback: Date.now(),
    next: false,
    forceReRender: false,
    sendDataProvided: false
  });
  /**
   * The link of the current Spotify resource
   */
  let spotiLinkRef = useRef<HTMLAnchorElement>(null);
  /**
   * The background image, that is used in the landing page. This background image is the same as the applied image.
   */
  let backgroundImageFirstTab = useRef<HTMLImageElement>(null);
  useEffect(() => {
    window.addEventListener("message", (msg) => { // Prepare getting the token
      if (msg.origin !== window.location.origin) return;
      const json = JSON.parse(msg.data);
      if (json.token) {
        updateState(prevState => { return { ...prevState, token: json.token, next: true } });
        window.updateRenderState && window.updateRenderState(prevState => { return { ...prevState, tokenUpdate: prevState.tokenUpdate + 1 } })
      }
    });
    window.addEventListener("focus", () => { // Since browsers usually make the tab sleep when the user changes it, refresh the data when it gains again focus
      updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } })
    });
    if (document.createElement("canvas").getContext("2d")?.filter === undefined) { // Add a polyfill for old browsers (and Safari, that basically is an old browser) that doesn't support filtering in a canvas
      let script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/context-filter-polyfill@0.3.6/dist/index.min.js";
      document.body.append(script);
    }
    localStorage.getItem("iMusicUI-DefaultTheme") === "a" && ThemeManager.apply(true) // Apply the light theme if the user really prefers that... _thing_
  }, []);
  useEffect(() => { // All the data has been fetched from Spotify API. Update the State of the drawing component so that time-sensitive events can start
    state.sendDataProvided && window.updateRenderState(prevState => { return { ...prevState, dataProvided: true } })
  }, [state.sendDataProvided])
  useEffect(() => { // Make a request to Spotify API for the currently-playing track
    (async () => {
      if (state.token !== "" && state.token !== null && (Date.now() - lastRequestDate) > 4500) { // Wait at least 4500 ms from each request
        lastRequestDate = Date.now()
        const request = await fetch(`https://api.spotify.com/v1/me/player?additional_types=track,episode`, {
          headers: {
            Authorization: `Bearer ${state.token}`
          }
        });
        if (request.status === 401) {
          getSpotiToken();
          return;
        }
        if (!request.status.toString().startsWith("2")) throw new Error("Failed Spotify request");
        const json = await request.json();
        window.updateRenderState(prevState => { return { ...prevState, album: (json.item.album ?? json.item.show).name, author: json.item.artists !== undefined ? json.item.artists[0].name : json.item.show.publisher, title: json.item.name, maxPlayback: json.item.duration_ms, currentPlayback: json.progress_ms, img: json.item?.is_local ? "./samplesong.svg" : (json.item.album ?? json.item).images[0].url, devicePlaybackType: json.device.type.toLowerCase(), isPlaying: json.is_playing, forceReRender: state.forceReRender ? Date.now() : prevState.forceReRender, dataProvided: true } }) // Update the drawing state with the new values
        state.forceReRender = false;
        if (spotiLinkRef.current) spotiLinkRef.current.href = json.item.external_urls.spotify; // Update the resource link
      }
    })()
  }, [state.token, state.refreshPlayback, state.forceReRender])
  useEffect(() => { // If in the DOM, get the background image from the database and apply it as the source
    if (backgroundImageFirstTab.current) {
      (async () => {
        let background = await IndexedDatabase.get({ db: await IndexedDatabase.db(), query: "background" });
        const defaultValues = JSON.parse(localStorage.getItem("Playerify-BackgroundLinks") ?? "{}");
        if (backgroundImageFirstTab.current) backgroundImageFirstTab.current.src = defaultValues.background ? defaultValues.background : background ? URL.createObjectURL(background.blob) : "./background.jpg";
      })()
    }
  }, [backgroundImageFirstTab])
  function getSpotiToken() {
    updateState(prevState => { return { ...prevState, token: null } }); // Make the previous token null, so that, until there's a new token, requests won't be sent.
    const win = window.open(`https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent("282dc0486ba74b6d8a9acde0fee407f4")}&scope=${encodeURIComponent("user-modify-playback-state user-read-playback-state")}&redirect_uri=${window.location.href.substring(0, window.location.href.lastIndexOf("/"))}/oauth.html`, "_blank", "width=500,height=350");
    if (!win || win?.closed) {
      let div = document.createElement("div");
      createRoot(div).render(<Dialog>
        <h3>User interaction is required</h3>
        <label>Spotify token is expired. Please click on the button below to get it again.</label><br></br>
        <button onClick={() => {
          getSpotiToken();
          (div.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
          setTimeout(() => div.remove(), 210)
        }}>Get token</button>
      </Dialog>);
      (document.querySelector("[data-canvasexport]")?.parentElement ?? document.body).append(div);
    }
  }
  return <>
    <Header></Header>
    <i>A simple music controls UI, with a style similar to the iOS lock screen music controls</i><br></br><br></br>

    {!state.next ? <>
      <div className="introductionAdapt">
        <span style={{ float: "left" }}>
          <button style={{ marginRight: "10px" }} onClick={getSpotiToken}>Connect to Spotify</button>
          <button style={{ backgroundColor: "var(--card)" }} onClick={() => updateState(prevState => { return { ...prevState, next: true, sendDataProvided: true } })}>Manually add metadata</button><br></br><br></br>
          <i style={{ textDecoration: "underline", fontSize: "0.7em" }} onClick={() => {
            let div = document.createElement("div");
            createRoot(div).render(<Dialog close={() => {
              (div.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
              setTimeout(() => div.remove(), 210);
            }}>
              <OpenSource></OpenSource>
            </Dialog>);
            document.body.append(div);
          }}>Licenses</i>
        </span>
        <span style={{ borderRadius: "16px", border: "15px solid var(--second)" }}>
          <img src={example} style={{ maxHeight: "70vh" }}></img>
        </span>
        <img style={{ position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh", objectFit: "cover", zIndex: "-1", filter: "blur(16px) brightness(50%)" }} ref={backgroundImageFirstTab}></img>
      </div></> : state.token !== "" ? <>
        <div className="flex mainComponentDiv">
          <Card>
            <ImageRenderer refresh={() => { // The function called to get again the currently-played track from Spotify API
              if (state.token !== null) updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } })
            }} event={async (type, rect) => { // When the user has made an interaction with the buttons
              /**
               * Make a request to Spotify's API
               * @param link the link of the request
               * @param method the method of the request. If not specified, PUT is the default
               * @param body the body of the request. If not specified, no body is sent
               * @returns a Promise, resolved with the request
               */
              async function spotifyRequest(link: string, method = "PUT", body?: string) {
                const req = await fetch(link, {
                  method: method,
                  headers: {
                    Authorization: `Bearer ${state.token}`
                  },
                  body: body
                });
                if (req.status === 401) {
                  getSpotiToken(); // Get a new token
                  throw new Error("Failed Spotify request")
                }
                if (!link.endsWith("devices") && req.status !== 204) throw new Error("Failed Spotify request"); // The devices endpoint is the only one which returns content inside the request
                return req;
              }
              if (type !== "device") { // Simple request
                navigator.vibrate && navigator.vibrate(300);
                lastRequestDate -= 5000; // By reducing the requested date by 5000, the effect will always get the currently-playing track. In this way, if the user quickly skips more tracks, each track will be fetched.
                await spotifyRequest(`https://api.spotify.com/v1/me/player/${type === "prev" ? "previous" : type}`, type === "pause" || type === "play" || type.startsWith("seek") ? "PUT" : "POST");
                updateState(prevState => { return { ...prevState, refreshPlayback: Date.now() } });
              } else { // Make a request to Spotify API for the currently available devices
                const req = await spotifyRequest(`https://api.spotify.com/v1/me/player/devices`, "GET");
                if (req.status === 200) {
                  const devices = (await req.json()).devices as SpotifyDevice[];
                  let div = document.createElement("div");
                  function closeDialog() {
                    return new Promise<void>((resolve) => {
                      (div.firstChild as HTMLDivElement).style.opacity = "0";
                      setTimeout(() => {
                        div.remove();
                        resolve();
                      }, 210);
                      navigator.vibrate && navigator.vibrate(300);
                    })
                  }
                  const canvas = (document.querySelector("[data-canvasexport]") as HTMLCanvasElement).getBoundingClientRect();
                  if (!rect) return;
                  navigator.vibrate && navigator.vibrate(300);
                  createRoot(div).render(<div className="simpleBackdrop" style={{ bottom: `${(GetFullSize().height - (rect[1] ?? 15) + 10)}px`, width: `${(rect[0] ?? document.body.clientWidth) - canvas.left}px`, left: `${canvas.left}px` }}>
                    <div>
                      <h2>Transfer playback:</h2>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {devices.map(item => <div key={`Playerify-SpotifyDevices-${item.id}`} style={{ marginBottom: "10px", marginLeft: "10px" }} onClick={async () => {
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
                      </div><br></br>
                      <button onClick={closeDialog} className="fullWidth">Close dialog</button>
                    </div></div>);
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