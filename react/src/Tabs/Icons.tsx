import { useState } from "react";
import Checkbox from "../Components/Checkbox";
import DatabaseInput from "../Scripts/DatabaseInput";
import Card from "../Components/Card";

/**
 * Edits every icon used from the website
 * @returns a ReactNode of the Icons tab
 */
export default function Icons() {
    const defaultVal = JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}");
    let [state, updateState] = useState("pause"); // The icon that is being edited
    return <>
        <h3>Manage icons visibility and source:</h3>
        <select className="fullWidth" onChange={(e) => updateState(e.target.value)}>
            {[{ id: "pause", display: "Pause button" }, { id: "prev", display: "Previous button" }, { id: "next", display: "Next button" }, { id: "playbackDevice", display: "Playback device fallback button" }, { id: "play", display: "Play button" }, { id: "automobile", display: "Car icon" }, { id: "game_console", display: "Game console icon" }, { id: "computer", display: "Computer icon" }, { id: "smartphone", display: "Smartphone icon" }, { id: "speaker", display: "Speaker icon" }, { id: "tablet", display: "Tablet icon" }, { id: "tv", display: "TV icon" }].map(e => <option value={e.id} key={`Playerify-IconOption-${e.id}`}>{e.display}</option>)}
        </select><br></br><br></br>
        <Card type={1}>
            <select className="fullWidth" defaultValue={defaultVal[state] ?? "0"} key={`Playerify-IconSelect-${state}`} onChange={(f) => {
                localStorage.setItem("Playerify-IconUsed", JSON.stringify({ ...JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}"), [state]: f.target.value })); // Update the request in LocalStorage, remembering with the property `Playerify-IconUsed` the value of this select (therefore if the icon is custom, the default or nothing)
                switch (f.target.value) {
                    case "-1": { // Add an empty icon as the link
                        window.updateRenderState(prevState => { return { ...prevState, [state]: "./empty.svg" } })
                        break;
                    }
                    case "0": { // Default icon
                        window.updateRenderState(prevState => { return { ...prevState, [state]: `./${state}.svg` } });
                        break;
                    }
                    case "1": { // Get a new icon from the user's device, and update the state
                        DatabaseInput(state);
                        break;
                    }
                }
            }}><option value={-1}>None</option><option value={0}>Default</option><option value={1}>Custom icon</option></select>
        </Card><br></br>
        <Checkbox checked={localStorage.getItem("Playerify-SVGIconBackground") !== "b"} callback={(checked) => {
            localStorage.setItem("Playerify-SVGIconBackground", checked ? "a" : "b");
            window.updateRenderState(prevState => { return { ...prevState, date: Date.now() } })
        }}>Apply the text color to SVG images</Checkbox>

    </>
}