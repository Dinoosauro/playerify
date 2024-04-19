import { useState } from "react"
import { RenderState } from "../Interface/Interfaces"
import Card from "../Components/Card";
import updateProperty from "../Scripts/UpdateProperty";
import DatabaseInput from "../Scripts/DatabaseInput";
interface MapVal {
    str: string,
    val: "string" | "number" | "file",
    persist?: boolean
}
const selectMap = new Map<keyof RenderState, MapVal>([
    ["album", { str: "Album name", val: "string" }],
    ["author", { str: "Song author", val: "string" }],
    ["currentPlayback", { str: "Playback position (in ms)", val: "number" }],
    ["img", { str: "Album art", val: "file" }],
    ["title", { str: "Song title", val: "string" }],
    ["maxPlayback", { str: "Song end (in ms)", val: "number" }],
    ["background", { str: "Background image", val: "file", persist: true }]
])
export default function ChangeContent() {
    let [state, updateState] = useState<keyof RenderState>("album");
    const mapVal = selectMap.get(state);
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
                <button onClick={() => {
                    if (mapVal.persist) {
                        let links = JSON.parse(localStorage.getItem("Playerify-BackgroundLinks") ?? "{}");
                        delete links[state];
                        localStorage.setItem("Playerify-BackgroundLinks", JSON.stringify(links));
                        localStorage.setItem("Playerify-IconUsed", JSON.stringify({ ...JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}"), [state]: "1" }))
                        DatabaseInput(state);
                    } else {
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
            </>}
        </Card>
    </>
}