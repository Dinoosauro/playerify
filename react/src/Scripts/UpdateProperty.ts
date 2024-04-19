export default function updateProperty(key: string, value: string | number) {
    window.updateRenderState(prevState => { return { ...prevState, [key]: value } })
    let parse = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}");
    localStorage.setItem("Playerify-CanvasPreference", JSON.stringify({ ...parse, [key]: value }));
}
