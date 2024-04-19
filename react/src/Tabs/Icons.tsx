import { useState } from "react";
import Checkbox from "../Components/Checkbox";
import DatabaseInput from "../Scripts/DatabaseInput";
import IndexedDatabase from "../Scripts/IndexedDatabase";
import Card from "../Components/Card";

export default function Icons() {
    const defaultVal = JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}");
    let [state, updateState] = useState("pause");
    return <>
        <h3>Manage icons visibility and source:</h3>
        <select className="fullWidth" onChange={(e) => updateState(e.target.value)}>
            {[{ id: "pause", display: "Pause button" }, { id: "prev", display: "Previous button" }, { id: "next", display: "Next button" }, { id: "playbackDevice", display: "Playback device fallback button" }, { id: "play", display: "Play button" }, { id: "automobile", display: "Car icon" }, { id: "game_console", display: "Game console icon" }, { id: "computer", display: "Computer icon" }, { id: "smartphone", display: "Smartphone icon" }, { id: "speaker", display: "Speaker icon" }, { id: "tablet", display: "Tablet icon" }, { id: "tv", display: "TV icon" }].map(e => <option value={e.id} key={`Playerify-IconOption-${e.id}`}>{e.display}</option>)}
        </select><br></br><br></br>
        <Card type={1}>
            <select className="fullWidth" defaultValue={defaultVal[state] ?? "0"} key={`Playerify-IconSelect-${state}`} onChange={(f) => {
                localStorage.setItem("Playerify-IconUsed", JSON.stringify({ ...JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}"), [state]: f.target.value }));
                console.log(state);
                switch (f.target.value) {
                    case "-1": {
                        window.updateRenderState(prevState => { return { ...prevState, [state]: "./empty.svg" } })
                        break;
                    }
                    case "0": {
                        window.updateRenderState(prevState => { return { ...prevState, [state]: `./${state}.svg` } });
                        break;
                    }
                    case "1": {
                        DatabaseInput(state);
                        break;
                    }
                }
            }}><option value={-1}>None</option><option value={0}>Defualt</option><option value={1}>Custom icon</option></select>
        </Card><br></br>
        <Checkbox callback={(checked) => {
            localStorage.setItem("Playerify-SVGIconBackground", checked ? "a" : "b");
            window.updateRenderState(prevState => { return { ...prevState, date: Date.now() } })
        }}>Apply the text color to SVG images</Checkbox>

    </>
}