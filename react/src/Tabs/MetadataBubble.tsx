import { useState } from "react";
import Card from "../Components/Card";
import { RenderState } from "../Interface/Interfaces";
import updateProperty from "../Scripts/UpdateProperty";
import Checkbox from "../Components/Checkbox";

/**
 * The tab that permits to edit the background of the metadata bubble
 * @returns the MetadataBubble tab ReactNode
 */
export default function MetadataBubble() {
    const defaultValues = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}") as RenderState;
    let [state, updateState] = useState<number>(defaultValues.metadataColorOption ?? 0);
    let [checked, updateChecked] = useState<boolean>(defaultValues.useProgressBarColor);
    return <>
        <h3>Change how the track metadata bubble is shown:</h3>
        <Card type={1}>
            <select defaultValue={state} onChange={(e) => {
                updateProperty("metadataColorOption", +e.target.value);
                updateState(+e.target.value);
            }}>
                <option value={0}>Use a static color</option>
                <option value={1}>Get a part of the album art</option>
                <option value={2}>Get a random color from the album art</option>
                <option value={3}>Get a part of the background image</option>
                <option value={4}>Get a random color from the background image</option>
            </select>
        </Card><br></br>
        <Card type={1}>
            {state === 0 ? <><label style={{ marginRight: "10px" }}>Metadata bubble color:</label><input type="color" key={`Playerify-MetadataBubble-ChooseColor`} defaultValue={defaultValues.metadataColor ?? "#ffffff"} onChange={(e) => {
                updateProperty("metadataColor", e.target.value);
            }}></input></> : <>
                <label style={{ marginRight: "10px" }}>Metadata bubble filter:</label><input type="text" key={`Playerify-MetadataBubble-ChooseFilter`} defaultValue={defaultValues.metadataColorFilter ?? "blur(36px) brightness(35%) contrast(110%)"} onChange={(e) => {
                    updateProperty("metadataColorFilter", e.target.value);
                }}></input>
            </>}
            {(state === 2 || state === 4) && <>
                <br></br><br></br>
                <button key={`Playerify-MetadataBubble-ForceRefreshBtn`} onClick={() => window.updateRenderState(prevState => { return { ...prevState, metadataColorForceRefresh: prevState.metadataColorForceRefresh + 1 } })}>Change color</button>
            </>}
        </Card><br></br>
        {!checked && <><label style={{ marginRight: "10px" }}>Remaining time progress color:</label><input type="color" defaultValue={defaultValues.remainingColor ?? "#000000"} onChange={(e) => {
            updateProperty("remainingColor", e.target.value);
        }}></input><br></br><br></br></>}
        <Checkbox checked={defaultValues.useProgressBarColor} callback={(checked) => {
            updateProperty("useProgressBarColor", checked);
            updateChecked(checked);
        }}>Get progress color from image</Checkbox>
        {checked && <><br></br><button key={`Playerify-MetadataBubble-ForceRefreshBtnFromCheckbox`} onClick={() => window.updateRenderState(prevState => { return { ...prevState, metadataColorForceRefresh: prevState.metadataColorForceRefresh + 1 } })}>Change color</button></>}
    </>
}