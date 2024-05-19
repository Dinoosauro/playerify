import { useRef, useState } from "react"
import { RenderState } from "../Interface/Interfaces"
import Card from "../Components/Card";
import updateProperty from "../Scripts/UpdateProperty";
import DatabaseInput from "../Scripts/DatabaseInput";
import { createRoot } from "react-dom/client";
import Dialog from "../Components/Dialog";
import APIValues from "../Scripts/APIValues";
import Checkbox from "../Components/Checkbox";
interface MapVal {
    str: string,
    val: "string" | "number" | "file",
    persist?: boolean
}
/**
 * The tab that permits to edit metadata values
 * @returns the ChangeContent ReactNode
*/
export default function ChangeContent() {
    /**
     * The map that contains the metadata whose value can be edited
     */
    const selectMap = new Map<keyof RenderState, MapVal>([
        ["album", { str: "Album name", val: "string" }],
        ["author", { str: "Song author", val: "string" }],
        ["currentPlayback", { str: "Playback position (in ms)", val: "number" }],
        ["img", { str: "Album art", val: "file" }],
        ["title", { str: "Song title", val: "string" }],
        ["maxPlayback", { str: "Song end (in ms)", val: "number" }],
        ["background", { str: "Background image", val: "file", persist: true }]
    ])
    let [state, updateState] = useState<keyof RenderState>("album");
    const mapVal = selectMap.get(state);
    let isUnsplashLoading = useRef<boolean>(false);
    return <>
        <h3>Change the content displayed in the canvas:</h3><br></br>
        <select className="fullWidth" defaultValue={state} onChange={(e) => {
            updateState(e.target.value as keyof RenderState);
        }}>
            {Array.from(selectMap).map(([key, display]) => <option value={key} key={`Playerify-UpdateMusicProps-${key}`}>{display.str}</option>)}
        </select><br></br><br></br>
        <Card type={1}>
            {mapVal?.val !== "file" ? <input className="fullWidth" type={mapVal?.val === "number" ? "number" : "text"} placeholder={mapVal?.str} onChange={(e) => window.updateRenderState(prevState => { return { ...prevState, [state]: mapVal?.val === "number" ? +e.target.value : e.target.value } })}></input> : <>
                <input className="fullWidth" type="text" placeholder="Image URL" onChange={(e) => {
                    if (mapVal.persist) localStorage.setItem("Playerify-BackgroundLinks", JSON.stringify({ ...JSON.parse(localStorage.getItem("Playerify-BackgroundLinks") ?? "{}"), [state]: e.target.value }));
                    window.updateRenderState(prevState => { return { ...prevState, [state]: e.target.value } });
                }}></input><br></br><br></br>
                <button style={{ marginRight: "10px" }} onClick={() => {
                    if (mapVal.persist) { // Save the values in the LocalStorage
                        // Delete the previous image link, since otherwise this link would be applied (links have priority over database blobs)
                        let links = JSON.parse(localStorage.getItem("Playerify-BackgroundLinks") ?? "{}");
                        delete links[state];
                        localStorage.setItem("Playerify-BackgroundLinks", JSON.stringify(links));
                        localStorage.setItem("Playerify-IconUsed", JSON.stringify({ ...JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}"), [state]: "1" }))
                        DatabaseInput(state);
                    } else { // File must not be saved: read the file, and update the state with the blob URL
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async () => {
                            if (input.files) {
                                const [buffer, type] = [await input.files[0].arrayBuffer(), input.files[0].type]
                                window.updateRenderState(prevState => { return { ...prevState, [state]: URL.createObjectURL(new Blob([buffer], { type: type })) } })
                            }
                        };
                        input.click();
                    }
                }}>Upload image</button>
                <button onClick={async () => { // Get random image from Unsplash
                    if (isUnsplashLoading.current) return;
                    isUnsplashLoading.current = true;
                    let div = document.createElement("div");
                    const req = await fetch(APIValues.unsplash.serverLink); // Get a random image using Serverless function
                    if (req.status === 200) {
                        const json = await req.json();
                        function closeDiv() {
                            (div.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
                            setTimeout(() => div.remove(), 210);
                        }
                        createRoot(div).render(<Dialog close={closeDiv}>
                            <h2>Random Unsplash image:</h2>
                            <div className="flex wcenter">
                                <img onClick={() => {
                                    if (mapVal.persist) localStorage.setItem("Playerify-BackgroundLinks", JSON.stringify({ ...JSON.parse(localStorage.getItem("Playerify-BackgroundLinks") ?? "{}"), [state]: json.url }));
                                    window.updateRenderState(prevState => { return { ...prevState, [state]: json.url } });
                                    closeDiv();
                                }} src={json.url} style={{ maxWidth: "100%", maxHeight: "40vh", borderRadius: "8px" }}></img>
                            </div><br></br><br></br>
                            <i>{json.description} — <a href={`https://unsplash.com/it/foto/${json.imgId}?utm_source=Playerify&utm_medium=referral`}>{json.imgId}</a></i><br></br>
                            <label>Image of <a href={`https://unsplash.com/@${json.user}?utm_source=Playerify&utm_medium=referral`}>{json.user}</a> on <a href="https://unsplash.com/?utm_source=Playerify&utm_medium=referral">Unsplash.</a> Click on the image to apply it.</label><br></br>
                        </Dialog>)
                        document.body.append(div);
                        isUnsplashLoading.current = false;
                    }
                }}>Get random Unsplash photo</button>
            </>}
        </Card><br></br><br></br>
        <Checkbox checked={(JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}")).albumArtAsBackground === "a"} callback={(checked) => {
            updateProperty("albumArtAsBackground", checked ? "a" : "b")
            window.updateRenderState(prevState => { return { ...prevState, albumArtAsBackground: checked } })
        }}>Use the album art as background</Checkbox>
    </>
}