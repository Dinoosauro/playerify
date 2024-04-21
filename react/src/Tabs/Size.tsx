import updateProperty from "../Scripts/UpdateProperty"

/**
 * A tab that permits to change the size of the canvas, of the icons and the radius of the album art
 * @returns the Size tab ReactNode
 */
export default function Size() {
    const defaultValues = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}");
    return <>
        <h3>Change width and height of the canvas:</h3>
        <label style={{ marginRight: "10px" }}>Width:</label><input type="number" defaultValue={defaultValues.width ?? 1290} placeholder="Width" onChange={(e) => updateProperty("width", +e.target.value)}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Height: </label><input type="number" defaultValue={defaultValues.height ?? 2796} placeholder="Height" onChange={(e) => updateProperty("height", +e.target.value)}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Icon size (in proportion)</label><input type="number" defaultValue={defaultValues.iconSize ?? 10} placeholder="Icon size" onChange={(e) => updateProperty("iconSize", +e.target.value)}></input><br></br><br></br>
        <label style={{ marginRight: "10px" }}>Album art border radius:</label><input type="number" defaultValue={defaultValues.imgRadius ?? 32} placeholder="Border radius" min={0} onChange={(e) => updateProperty("imgRadius", +e.target.value)}></input>

    </>
}