import { createRoot } from "react-dom/client";
import Dialog from "../Components/Dialog";
import { AppState } from "../Interface/Interfaces";
import updateProperty from "../Scripts/UpdateProperty";
import DatabaseInput from "../Scripts/DatabaseInput";
import { useEffect, useRef, useState } from "react";

interface Props {
    updateState: React.Dispatch<React.SetStateAction<AppState>>
}
export default function Render({ updateState }: Props) {
    const defaultValues = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}");
    let [dialogShown, showDialog] = useState(false);
    let dialogRef = useRef<HTMLDivElement>(null);
    let canvasExportRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasExportRef.current) {
            const canvases = (Array.from(document.querySelectorAll("[data-canvasexport]")) as HTMLCanvasElement[]).sort((a, b) => +a.style.zIndex - +b.style.zIndex);
            const ctx = canvasExportRef.current?.getContext("2d");
            canvasExportRef.current.width = canvases[0].width;
            canvasExportRef.current.height = canvases[0].height;
            if (ctx) for (let canvas of canvases) ctx.drawImage(canvas, 0, 0);
        }
    }, [dialogShown])
    return <>
        <h3>Render options:</h3>
        <label style={{ marginRight: "10px" }}>Font family:</label><input type="text" onChange={(e) => {
            updateProperty("font", e.target.value);
        }} defaultValue={defaultValues.font ?? `"SF Pro", sans-serif`}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Text color:</label><input type="color" defaultValue={defaultValues.color ?? "#fafafa"} onChange={(e) => {
            updateProperty("color", e.target.value);
        }}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Metadata bubble color:</label><input type="color" defaultValue={defaultValues.metadataColor ?? "#ffffff"} onChange={(e) => {
            updateProperty("metadataColor", e.target.value);
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