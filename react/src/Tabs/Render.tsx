import Dialog from "../Components/Dialog";
import { AppState } from "../Interface/Interfaces";
import updateProperty from "../Scripts/UpdateProperty";
import { useEffect, useRef, useState } from "react";
import ExportCanvas from "../Scripts/ExportCanvas";

interface Props {
    updateState: React.Dispatch<React.SetStateAction<AppState>>
}
/**
 * The tab that permits to edit a few values (without any other specific category) and to export the canvas
 * @param updateState the function that permits to update the state of the App.tsx file
 * @returns the Render tab ReactNode
 */
export default function Render({ updateState }: Props) {
    const defaultValues = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}");
    let [dialogShown, showDialog] = useState(false);
    /**
     * The ref of the "Canvas export" dialog
     */
    let dialogRef = useRef<HTMLDivElement>(null);
    /**
     * The canvas that'll be used to save as image
     */
    let canvasExportRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        canvasExportRef.current && ExportCanvas(canvasExportRef.current);
    }, [dialogShown])
    return <>
        <h3>Render options:</h3>
        <label style={{ marginRight: "10px" }}>Font family:</label><input type="text" onChange={(e) => {
            updateProperty("font", e.target.value);
        }} defaultValue={defaultValues.font ?? `"SF Pro", sans-serif`}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Background image filter:</label><input type="text" onChange={(e) => {
            updateProperty("backgroundFilter", e.target.value);
        }} defaultValue={defaultValues.backgroundFilter ?? `blur(16px) brightness(50%)`}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Text color:</label><input type="color" defaultValue={defaultValues.color ?? "#fafafa"} onChange={(e) => {
            updateProperty("color", e.target.value);
        }}></input><br></br><br></br>
        <button onClick={() => updateState(prevState => { return { ...prevState, refreshPlayback: Date.now(), forceReRender: true } })}>Re-render image</button>
        <button onClick={() => showDialog(true)}>Image download instructions</button>
        {dialogShown && <div ref={dialogRef}><Dialog close={() => {
            if (dialogRef.current) {
                (dialogRef.current.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
                setTimeout(() => showDialog(false), 210);
            }
        }}>
            <h2>How to download the image</h2>
            <label>Due to CORS restrictions, the only method to download the image is to right-click it and then to click on "Save as an image". There's (un)fortunately no other way to download the image.</label><br></br><br></br>
            <canvas ref={canvasExportRef} style={{ maxWidth: "100%", maxHeight: "50vh" }}></canvas>
        </Dialog></div>}

    </>
}