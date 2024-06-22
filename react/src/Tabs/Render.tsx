import Dialog from "../Components/Dialog";
import { AppState } from "../Interface/Interfaces";
import updateProperty from "../Scripts/UpdateProperty";
import { useEffect, useRef, useState } from "react";
import ExportCanvas from "../Scripts/ExportCanvas";
import Card from "../Components/Card";

interface Props {
    updateState: React.Dispatch<React.SetStateAction<AppState>>
}

interface State {
    dialog: boolean,
    error?: boolean,
    link?: [string, string],
    successfulCopy?: boolean
}
interface CanvasExport {
    mimetype?: string,
    quality?: number,
    download?: boolean
}
/**
 * The tab that permits to edit a few values (without any other specific category) and to export the canvas
 * @param updateState the function that permits to update the state of the App.tsx file
 * @returns the Render tab ReactNode
 */
export default function Render({ updateState }: Props) {
    const defaultValues = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}");
    let [dialogStatus, updateDialogStatus] = useState<State>({ dialog: false });
    /**
     * The options for canvas exportation
     */
    let dialogQuality = useRef({ format: "image/png", quality: 1 });
    /**
     * The ref of the "Canvas export" dialog
     */
    let dialogRef = useRef<HTMLDivElement>(null);
    /**
     * The canvas that'll be used to save as image
     */
    let canvasExportRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        dialogStatus.dialog && canvasExportRef.current && ExportCanvas(canvasExportRef.current);
    }, [dialogStatus.dialog]);
    /**
     * Export the current canvas
     * @param quality the quality of the output image
     * @param mimetype the output image format
     * @param download if the image should be downloaded or copied to the clipboard. Note that images must be saved in PNG if they must be copied to the clipboard
     */
    function downloadCanvas({ quality, mimetype, download }: CanvasExport) {
        if (canvasExportRef.current) try {
            canvasExportRef.current.toBlob((res) => {
                if (!res) throw new Error();
                if (download) {
                    let a = document.createElement("a");
                    a.href = URL.createObjectURL(res);
                    a.download = `${window.currentTrack}`;
                    updateDialogStatus(prevState => { return { ...prevState, link: [a.href, a.download] } });
                    a.click();
                } else {
                    navigator.clipboard.write([new ClipboardItem({ [mimetype ?? "image/png"]: res })]).then(() => updateDialogStatus(prevState => { return { ...prevState, successfulCopy: true } }));
                }
            }, mimetype, quality)
        } catch (ex) {
            updateDialogStatus(prevState => { return { ...prevState, error: true } });
        }
    }
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
        <button onClick={() => updateDialogStatus({ dialog: true })}>Image download instructions</button>
        {dialogStatus.dialog && <div ref={dialogRef}><Dialog close={() => {
            if (dialogRef.current) {
                (dialogRef.current.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
                setTimeout(() => updateDialogStatus({ dialog: false }), 210);
            }
        }}>
            <h2>Image exportation:</h2>
            {!dialogStatus.error ? <>
                <Card type={1}>
                    <div className="flex hcenter">
                        <label style={{ marginRight: "10px" }}>Export as a: </label>
                        <select defaultValue={dialogQuality.current.format} style={{ width: "100%" }} onChange={(e) => (dialogQuality.current.format = e.target.value)}>
                            <option value={"image/jpeg"}>JPEG Image</option>
                            <option value={"image/png"}>PNG Image</option>
                            {document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp") && <option value={"image/webp"}>WebP Image</option>}
                        </select>
                    </div>
                    <br></br>
                    <label className="flex hcenter" style={{ gap: "10px" }}>Output image quality:
                        <input defaultValue={dialogQuality.current.quality} style={{ width: "100%" }} type="range" min={0} max={1} step={0.01} onChange={(e) => (dialogQuality.current.quality = +e.target.value)}></input>
                    </label>
                </Card><br></br>
                {dialogStatus.successfulCopy ? <p>Copied successfully into the clipboard</p> : dialogStatus.link ? <a style={{ display: "block" }} href={dialogStatus.link[0]} download={dialogStatus.link[1]}>The download has started. Click here to download it again</a> : undefined}<br></br>
            </> : <>
                <p>An error occourred while getting the image Blob, probably due to CORS. Please enable anonymous crossorigin from the `Website options` and try again. If the problem persists, you can also save this image by right-clicking it.</p>
            </>}
            <div className="exportRight">
                <canvas ref={canvasExportRef} style={{ maxWidth: "100%", maxHeight: "50vh" }}></canvas>
                {!dialogStatus.error &&
                    <span>
                        <button onClick={() => downloadCanvas({ quality: dialogQuality.current.quality, mimetype: dialogQuality.current.format, download: true })}>Export canvas</button>
                        <button onClick={() => downloadCanvas({})}>Save in the clipboard (as PNG)</button>
                    </span>}
            </div>
        </Dialog ></div >}

    </>
}