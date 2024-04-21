export default function ExportCanvas(canvas: HTMLCanvasElement) {
    const canvases = (Array.from(document.querySelectorAll("[data-canvasexport]")) as HTMLCanvasElement[]).sort((a, b) => +a.style.zIndex - +b.style.zIndex); // Get all the canvases to export, and sort them by their zIndex (just like is done in the HTML dom)
    canvas.width = canvases[0].width;
    canvas.height = canvases[0].height;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    if (ctx) for (let canvas of canvases) ctx.drawImage(canvas, 0, 0);

}