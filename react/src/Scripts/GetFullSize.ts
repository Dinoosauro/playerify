export default function GetFullSize() {
    const div = document.createElement("div");
    div.style.width = "100vw";
    div.style.height = "100vh";
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "0";
    div.style.zIndex = "-1";
    document.body.append(div);
    const rect = div.getBoundingClientRect();
    div.remove();
    return rect;
}