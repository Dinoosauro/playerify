import { useEffect, useRef, useState } from "react";
import { RenderState, availableCustomIcons } from "../Interface/Interfaces";
import IndexedDatabase from "../Scripts/IndexedDatabase";
import GetFullSize from "../Scripts/GetFullSize";

interface ProxyProps {
    filter?: string,
    image: string,
    drawProps: number[],
    square?: boolean,
    roundedCorners?: boolean
}
interface WriteProps {
    ctx: CanvasRenderingContext2D,
    text: string,
    height: number,
    autoWidth?: number,
    width?: number,
    actualWrite?: boolean
}
interface RoundedRectProps {
    fill: string,
    val: [number, number, number, number, number]
}
declare global {
    interface Window {
        updateRenderState: React.Dispatch<React.SetStateAction<RenderState>>,
        updateHeaderState: React.Dispatch<React.SetStateAction<number>>
    }
}
/**
 * The object that contains all the necessary information for handling button clicks
 */
let interactiveValues = {
    pause: {
        from: [0, 0],
        length: 0
    },
    next: {
        from: [0, 0],
        length: 0
    },
    prev: {
        from: [0, 0],
        length: 0
    },
    device: {
        from: [0, 0],
        length: 0
    }
}
interface btnObject {
    from: number[],
    length: number
}
/**
 * The object that contains all the information required for handling clicks on the progress bar
 */
let interactiveProgress = {
    from: [0, 0],
    length: 0,
    size: 0
}
let interval: number | undefined;
/**
 * The array that'll contain all the contexts that are being currently modified, so that multiple operations (and therefore glitches) can be avoided
 */
let canvasDrawing: CanvasRenderingContext2D[] = [];
/**
 * Following, there are a few State properties that are made as global. 
 * This is due the fact that Timeout/Interval functions cannot access the State, and therefore this is the easiest way to permit these scripts to fetch updated values
 */
let playbackTime = 0;
let maxPlayback = 9999;
let heightProgress = -9999;
let isPlaying = true;
let textColor = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}").color ?? "#fafafa";
let widthHeight = [0, 0];
let font = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}").font ?? `"SF Pro", sans-serif`;
/**
 * A boolean that indicates if data from Spotify (or the user) has been provided to the State, so that intervals can be started
 */
let dataProvided = false;
interface Props {
    refresh: () => void,
    event: (type: string, rect?: number[]) => Promise<void>
}
export default function ImageRenderer({ refresh, event }: Props) {
    const defaultValues = JSON.parse(localStorage.getItem("Playerify-CanvasPreference") ?? "{}");
    // I know, there are A LOT of values in this State. However, is essential to re-render the component for each of these changes.
    let [state, updateState] = useState<RenderState>({
        img: "./samplesong.svg",
        background: "./background.jpg",
        title: "",
        author: "",
        album: "",
        currentPlayback: 72000,
        maxPlayback: 193000,
        pause: "./pause.svg",
        play: "./play.svg",
        prev: "./prev.svg",
        next: "./next.svg",
        width: isNaN(+defaultValues.width) ? 1290 : +defaultValues.width,
        height: isNaN(+defaultValues.height) ? 2796 : +defaultValues.height,
        font: defaultValues.font ?? `"SF Pro", sans-serif`,
        color: defaultValues.color ?? "#fafafa",
        playbackDevice: "./playbackDevice.svg",
        imgRadius: 32,
        iconSize: 10,
        metadataColor: "#ffffff",
        isPlaying: true,
        automobile: "./automobile.svg",
        game_console: "./game_console.svg",
        computer: "./computer.svg",
        smartphone: "./smartphone.svg",
        speaker: "./speaker.svg",
        tablet: "./tablet.svg",
        tv: "./tv.svg",
        devicePlaybackType: "unknown",
        forceReRender: Date.now(),
        dataProvided: false,
        tokenUpdate: 0
    });
    playbackTime = state.currentPlayback;
    maxPlayback = state.maxPlayback;
    isPlaying = state.isPlaying;
    textColor = state.color;
    widthHeight = [state.width, state.height];
    font = state.font;
    dataProvided = state.dataProvided;
    useEffect(() => { // Add a Window element to go back to previous width/height when the user exits from Fullscreen mode
        window.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) {
                if (fullscreenDiv.current) {
                    for (let item of fullscreenDiv.current.querySelectorAll("canvas")) {
                        item.style.maxWidth = "";
                        item.style.maxHeight = "";
                    }
                    updateState(prevState => { return { ...prevState, width: isNaN(+defaultValues.width) ? 1290 : +defaultValues.width, height: isNaN(+defaultValues.height) ? 2796 : +defaultValues.height } })
                }
            }
        })
    }, [])
    /**
     * The function that handles the update of time-sensitive text elements
     * @param dontUpdate don't add 1 second to the current time
     */
    function writeUpdateElements(dontUpdate?: boolean) {
        const textCtx = textCanvas.current?.getContext("2d");
        if (isPlaying && !dontUpdate) playbackTime += 1000; // One second has passed
        if (heightProgress === -9999) return; // No calculated height from the Album Art canvas has been provided. Don't do anything.
        if (dataProvided && textCtx && canvasDrawing.indexOf(textCtx) === -1) { // If data has been provided, and there aren't any current actions being done on this canvas, start drawing on it
            textCtx.clearRect(0, 0, widthHeight[0], widthHeight[1]);
            canvasDrawing.push(textCtx);
            // Minute/Hour
            textCtx.font = `bold ${widthHeight[0] * 30 / 100}px ${font}`;
            textCtx.fillStyle = textColor;
            const currentDate = [new Date().getHours(), new Date().getMinutes()];
            const finalText = `${currentDate[0] < 10 ? "0" : ""}${currentDate[0]}:${currentDate[1] < 10 ? "0" : ""}${currentDate[1]}`;
            writeText({ ctx: textCtx, text: finalText, height: (widthHeight[1] * 13 / 100) });
            // Date string
            const monthString = new Date().toLocaleDateString(navigator.languages[0], {
                weekday: "long",
                day: "numeric",
                month: "long",
            });
            textCtx.font = `${widthHeight[0] * 8 / 100}px ${font}`;
            writeText({ ctx: textCtx, text: monthString, height: (widthHeight[1] * 5 / 100) });
            // The current time of the song
            let startDate = new Date(playbackTime).toLocaleTimeString().substring(3).trim();
            if (startDate.startsWith("0")) startDate = startDate.substring(1);
            textCtx.font = `${widthHeight[0] * 3 / 100}px ${font}`;
            textCtx.fillStyle = textColor;
            writeText({ ctx: textCtx, text: startDate, height: heightProgress, width: 25 + (((widthHeight[0] * 20 / 100) - textCtx.measureText(startDate).width) / 2) });
            // The end time of the song
            let endDate = new Date(maxPlayback - playbackTime).toLocaleTimeString().substring(3).trim();
            if (endDate.startsWith("0")) endDate = endDate.substring(1);
            endDate = `-${endDate}`;
            writeText({ ctx: textCtx, text: endDate, height: heightProgress, width: (widthHeight[0] * 80 / 100) + ((textCtx.measureText(startDate).width) / 2) });
            interactiveProgress = { // Update the position of the progress bar
                from: [widthHeight[0] * 20 / 100, heightProgress],
                length: widthHeight[0] * 60 / 100,
                size: 80
            }
            // Draw the progress bar
            textCtx.drawImage(roundedRectangle({ fill: "rgba(0,0,0,0.45)", val: [widthHeight[0] * 20 / 100, heightProgress, widthHeight[0] * 60 / 100, Math.max(widthHeight[1] * 1 / 100, 15), 80] }), 0, 0);
            textCtx.drawImage(roundedRectangle({ fill: `${textColor}d9`, val: [widthHeight[0] * 20 / 100, heightProgress, Math.min((playbackTime * (widthHeight[0] * 60 / 100) / maxPlayback), widthHeight[0] * 60 / 100), Math.max(widthHeight[1] * 1 / 100, 15), 80] }), 0, 0);
            canvasDrawing.splice(canvasDrawing.indexOf(textCtx), 1);
        }
        playbackTime > maxPlayback && refresh(); // Ask to refresh data from Spotify API if the time played is greater than the track's length, since this means that the track _should_ be ended
    }
    useEffect(() => {
        window.updateRenderState = updateState; // Make it a global value so that it can be accesed also from other classes
        let storage = JSON.parse(localStorage.getItem("Playerify-IconUsed") ?? "{}");
        let imageLinks = JSON.parse(localStorage.getItem("Playerify-BackgroundLinks") ?? "{}");
        let updateObj: any = {};
        (async () => {
            for (let key in storage) {
                switch (storage[key]) {
                    case "-1": { // They must not be shown
                        updateObj[key] = "./empty.svg";
                        break;
                    }
                    case "1": { // Get value from IndexedDB
                        let blob = await IndexedDatabase.get({ db: await IndexedDatabase.db(), query: key });
                        if (blob) updateObj[key] = URL.createObjectURL(blob.blob);
                        break;
                    }
                }
            }
            for (let key in imageLinks) updateObj[key] = imageLinks[key]; // Apply also the URLs of the provided values
            updateState(prevState => { return { ...prevState, ...updateObj } });
        })();
    }, []);
    useEffect(() => { // Run this every time a token is updated
        interval && clearInterval(interval)
        interval = setInterval(() => { writeUpdateElements() }, 1000); // Update the time-sensitive values every second
    }, [state.tokenUpdate])
    /**
     * The canvas that handles the Album Art, and other metadata of the song
     */
    let canvas = useRef<HTMLCanvasElement>(null);
    /**
     * The canvas where time-sensitive text (and also the progress bar) is written
     */
    let textCanvas = useRef<HTMLCanvasElement>(null);
    /**
     * The canvas where the background image is painted
     */
    let backgroundCanvas = useRef<HTMLCanvasElement>(null);
    /**
     * The canvas that contains the clickable buttons
     */
    let buttonCanvas = useRef<HTMLCanvasElement>(null);
    /**
     * The container div of every canvas, used for fullscreen mode
     */
    let fullscreenDiv = useRef<HTMLDivElement>(null);
    /**
     * Draw an image in a proxy canvas, also applying filters
     * @param filter the filter to apply to the output canvas
     * @param image the image to draw in the canvas
     * @param drawProps position of where the image should be drawn
     * @param square if true, a 1000*1000 square will be created, instead of using width/height from the state
     * @param roundedCorners if rounded corners must be applied. The radius must be passed as the fifth value of the drawProps array
     * @returns A promise, with the painted canvas with the image as the result
     */
    function proxyCanvas({ filter = "", image, drawProps, square, roundedCorners }: ProxyProps) {
        return new Promise<HTMLCanvasElement>(async (resolve, reject) => {
            const canvas = document.createElement("canvas");
            canvas.width = square ? 1000 : widthHeight[0];
            canvas.height = square ? 1000 : widthHeight[1];
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Canvas context returned null");
            const img = new Image();
            img.onload = () => {
                ctx.filter = filter;
                if (roundedCorners) { // Create a transparent rounded rectangle, that'll be clipped so that the image can be drawn there.
                    ctx.fillStyle = "#ffffff00";
                    // @ts-ignore
                    ctx.roundRect(...drawProps);
                    ctx.fill();
                    ctx.clip();
                    drawProps.pop(); // Delete the last element so that multiple rounded corners aren't painted
                }
                // @ts-ignore
                ctx.drawImage(img, ...(drawProps));
                resolve(canvas);
            }
            img.onerror = (ex) => reject(ex);
            if (localStorage.getItem("Playerify-SVGIconBackground") !== "b" && (await fetch(image)).headers.get("content-type")?.toLowerCase() === "image/svg+xml") { // If the provided image is a SVG, and the user hasn't disabled the "Fill replacer" option, replace the fill values with the current color
                const img = await fetch(image);
                const text = await img.text();
                let split = text.replace(/'/g, `"`).split(`fill="`);
                for (let i = 1; i < split.length; i++) split[i] = `${state.color}${split[i].substring(split[i].indexOf(`"`))}`;
                image = URL.createObjectURL(new Blob([split.join(`fill="`)], { type: "image/svg+xml" }));
            }
            img.src = image;
        })
    }
    /**
     * Write a text to the Canvas, by cropping it if necessary
     * @param ctx the context used for writing text
     * @param text the text to write
     * @param height the Y position where the text will be written
     * @param autoWidth the maximum width of the text. Text will be cropped if its width is greater than this value
     * @param width the X position where the text will be written
     * @param actualWrite if true, the text won't be written, but only the measures will be returned
     * @returns The measure of the written text
     */
    function writeText({ ctx, text, height, autoWidth = Infinity, width, actualWrite }: WriteProps) {
        while (ctx.measureText(text).width > autoWidth) text = text.substring(0, text.length - 1);
        const measure = ctx.measureText(text);
        if (actualWrite) return measure;
        ctx.fillText(text, width ?? ((widthHeight[0] - measure.width) / 2), measure.actualBoundingBoxAscent + height);
        return measure;
    }
    /**
     * Draw a rounded rectangle in a proxy canvas
     * @param fill the style used for filling the rectangle
     * @param val the position of the rectangle
     * @returns a Canvas with the rounded rectangle drawn
     */
    function roundedRectangle({ fill, val }: RoundedRectProps) {
        const canvas = document.createElement("canvas");
        canvas.width = widthHeight[0];
        canvas.height = widthHeight[1];
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context returned null");
        ctx.fillStyle = fill;
        ctx.roundRect(...val);
        ctx.fill();
        return canvas;
    }
    useEffect(() => { // Draw the background image
        (async () => {
            if (!state.dataProvided) return;
            const ctx = backgroundCanvas.current?.getContext("2d");
            if (!ctx || canvasDrawing.indexOf(ctx) !== -1) return;
            canvasDrawing.push(ctx);
            ctx.clearRect(0, 0, widthHeight[0], widthHeight[1]);
            ctx.drawImage(await proxyCanvas({ filter: "blur(16px) brightness(50%)", image: state.background, drawProps: [0, 0, widthHeight[0], widthHeight[1]] }), 0, 0, widthHeight[0], widthHeight[1]);
            canvasDrawing.splice(canvasDrawing.indexOf(ctx), 1);
        })()
    }, [state.background, state.width, state.height, state.forceReRender, state.dataProvided])
    /**
     * Draw the button icons to their dedicated canvas
     */
    async function drawIcons() {
        if (!dataProvided) return;
        const ctx = buttonCanvas.current?.getContext("2d");
        if (!ctx || canvasDrawing.indexOf(ctx) !== -1) return;
        canvasDrawing.push(ctx);
        setTimeout(async () => {
            ctx.clearRect(0, 0, widthHeight[0], widthHeight[1]);
            ctx.drawImage(await proxyCanvas({ image: state.isPlaying ? state.pause : state.play, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.pause.from[0], interactiveValues.pause.from[1], interactiveValues.pause.length, interactiveValues.pause.length);
            ctx.drawImage(await proxyCanvas({ image: state.prev, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.prev.from[0], interactiveValues.prev.from[1], interactiveValues.prev.length, interactiveValues.prev.length);
            ctx.drawImage(await proxyCanvas({ image: state.next, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.next.from[0], interactiveValues.next.from[1], interactiveValues.next.length, interactiveValues.next.length);
            ctx.drawImage(await proxyCanvas({ image: availableCustomIcons.indexOf(state.devicePlaybackType) !== -1 ? state[state.devicePlaybackType as "automobile"] : state.playbackDevice, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.device.from[0], interactiveValues.device.from[1], interactiveValues.device.length, interactiveValues.device.length);
            canvasDrawing.splice(canvasDrawing.indexOf(ctx), 1);
        }, 200)
    }
    useEffect(() => { // Draw the album art and metadata of the song
        (async () => {
            if (!state.dataProvided) return;
            const ctx = canvas.current?.getContext("2d");
            if (!ctx || canvasDrawing.indexOf(ctx) !== -1) return;
            canvasDrawing.push(ctx);
            ctx.clearRect(0, 0, state.width, state.height);
            // Get the current date, and emulate writing it in the canvas
            ctx.font = `bold ${state.width * 30 / 100}px ${state.font}`;
            ctx.fillStyle = state.color;
            let albumSize = (state.width > state.height ? state.height : state.width) * 90 / 100;
            const currentDate = [new Date().getHours(), new Date().getMinutes()];
            const finalText = `${currentDate[0] < 10 ? "0" : ""}${currentDate[0]}:${currentDate[1] < 10 ? "0" : ""}${currentDate[1]}`;
            const textSize = writeText({ ctx: ctx, text: finalText, height: (state.height * 13 / 100), actualWrite: true }); // actualWrite is set to true: the date won't be written, but the TextMetrics will be returned in any case, permitting to calc the next proportions
            while (((state.height * 15 / 100) + textSize.actualBoundingBoxAscent + albumSize + 575) > state.height) albumSize--; // Make sure there's enough room for every command in the bubble
            ctx.drawImage(await proxyCanvas({ image: state.img, drawProps: [(state.width - albumSize) / 2, (state.height * 15 / 100) + textSize.actualBoundingBoxAscent, albumSize, albumSize, state.imgRadius], roundedCorners: true }), 0, 0); // Draw album image
            // Draw the rounded rectangle for the controls
            ctx.beginPath();
            const squareStart = (state.height * 17 / 100) + textSize.actualBoundingBoxAscent + albumSize + 55;
            ctx.drawImage(roundedRectangle({ fill: `${state.metadataColor}59`, val: [state.width * 2.5 / 100, squareStart, state.width * 95 / 100, state.height * 20 / 100, 80] }), 0, 0);
            // Write the album name
            ctx.fillStyle = state.color;
            ctx.font = `bold ${state.width * 5 / 100}px ${state.font}`;
            writeText({ ctx: ctx, text: state.title, height: squareStart + 75, autoWidth: state.width * 85 / 100 });
            // And now write the author and album name
            ctx.font = `${state.width * 4 / 100}px ${state.font}`;
            const heightAuthorStart = (state.width * 5 / 100) + squareStart + 105;
            const heightAuthor = writeText({ ctx: ctx, text: `${state.author}  —  ${state.album}`, height: heightAuthorStart, autoWidth: state.width * 85 / 100 });
            heightProgress = heightAuthorStart + (state.height * 2 / 100) + heightAuthor.actualBoundingBoxAscent;
            // Update all the values for the icons
            interactiveValues.pause = {
                from: [((state.width / 2) - ((state.width * state.iconSize / 100) / 2)), heightProgress + (state.height * 3.2 / 100)],
                length: state.width * state.iconSize / 100
            }
            interactiveValues.prev = {
                from: [((state.width / 2) - ((state.width * state.iconSize / 100) / 2) - (state.width * 20 / 100)), heightProgress + (state.height * 3.2 / 100)],
                length: state.width * state.iconSize / 100
            }
            interactiveValues.next = {
                from: [((state.width / 2) - ((state.width * state.iconSize / 100) / 2) + (state.width * 20 / 100)), heightProgress + (state.height * 3.2 / 100)],
                length: state.width * state.iconSize / 100
            }
            interactiveValues.device = {
                from: [(state.width * 90 / 100) - (state.width * state.iconSize / 100), heightProgress + (state.height * 3.2 / 100)],
                length: (state.width * state.iconSize / 100)
            }
            writeUpdateElements(true); // Update the icon position, without adding the second
            canvasDrawing.splice(canvasDrawing.indexOf(ctx), 1);
            drawIcons();
        })()
    }, [state.album, state.author, state.color, state.font, state.height, state.img, state.imgRadius, state.metadataColor, state.width, state.title, state.forceReRender, state.dataProvided]);
    useEffect(() => { drawIcons() }, [state.automobile, state.color, state.computer, state.devicePlaybackType, state.game_console, state.height, state.iconSize, state.isPlaying, state.next, state.pause, state.play, state.playbackDevice, state.prev, state.smartphone, state.speaker, state.tablet, state.tv, state.width, state.forceReRender, state.dataProvided])
    return <>
        <div ref={fullscreenDiv} style={{ position: "relative" }}>
            <canvas data-canvasexport width={state.width} height={state.height} className="fixedCanvas" ref={backgroundCanvas}></canvas>
            <canvas data-canvasexport className="fixedCanvas" style={{ position: "absolute", top: "0", left: "0", zIndex: "1" }} ref={canvas} width={state.width} height={state.height}></canvas>
            <canvas data-canvasexport className="fixedCanvas" style={{ position: "absolute", top: "0", left: "0", zIndex: "2" }} ref={buttonCanvas} width={state.width} height={state.height}></canvas>
            <canvas data-canvasexport className="fixedCanvas" onClick={async (e) => {
                const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
                const coordinates = [(e.clientX - rect.left) * state.width / rect.width, (e.clientY - rect.top) * state.height / rect.height];
                if (interactiveProgress.from[0] < coordinates[0] && (interactiveProgress.from[0] + interactiveProgress.length) > coordinates[0] && interactiveProgress.from[1] < coordinates[1] && (interactiveProgress.from[1] + interactiveProgress.size) > coordinates[1]) { // Clicked on the progress bar
                    const process = (coordinates[0] - interactiveProgress.from[0]) / (interactiveProgress.length);
                    await event(`seek?position_ms=${Math.floor(state.maxPlayback * process)}`);
                    return;
                }
                for (let button in interactiveValues) {
                    if (interactiveValues[button as "pause"].from[0] < coordinates[0] && (interactiveValues[button as "pause"].from[0] + interactiveValues[button as "pause"].length) > coordinates[0] && interactiveValues[button as "pause"].from[1] < coordinates[1] && (interactiveValues[button as "pause"].from[1] + interactiveValues[button as "pause"].length) > coordinates[1]) { // That button has been clicked
                        await event(button === "pause" && !state.isPlaying ? "play" : button, [e.clientX, e.clientY]); // Send the request to Spotify
                        button === "pause" && updateState(prevState => { return { ...prevState, isPlaying: !prevState.isPlaying, currentPlayback: playbackTime } }); // Update the isPlaying property if the pause button has been clicked
                        break;
                    }
                }
            }} style={{ position: "absolute", top: "0", left: "0", zIndex: "3" }} ref={textCanvas} width={state.width} height={state.height}></canvas>
        </div>
        <br></br>
        <button className="fullWidth" onClick={() => {
            if (fullscreenDiv.current) {
                navigator.vibrate && navigator.vibrate(300);
                fullscreenDiv.current.requestFullscreen();
                setTimeout(() => {
                    const rect = GetFullSize();
                    updateState(prevState => { return { ...prevState, width: rect.width * (window.devicePixelRatio ?? 1), height: (rect.height * (window.devicePixelRatio ?? 1)) } }) // Render the canvas with the screen width/height
                    if (!fullscreenDiv.current) return;
                    for (let item of fullscreenDiv.current.querySelectorAll("canvas")) { // Add the maxWidth/maxHeight style property so that the image quality is great also on high-density screen
                        item.style.maxWidth = `${rect.width}px`;
                        item.style.maxHeight = `${rect.height}px`;
                    }
                }, 25)
            }
        }}>Fullscreen</button>
    </>
}