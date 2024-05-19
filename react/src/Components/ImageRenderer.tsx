import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    val: [number, number, number, number, number],
    drawImg?: HTMLImageElement | HTMLCanvasElement,
    filter?: string
}
declare global {
    interface Window {
        updateRenderState: React.Dispatch<React.SetStateAction<RenderState>>,
        updateHeaderState: React.Dispatch<React.SetStateAction<number>>
    }
}
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
        metadataColor: defaultValues.metadataColor ?? "#ffffff",
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
        tokenUpdate: 0,
        backgroundFilter: defaultValues.backgroundFilter ?? "blur(16px) brightness(50%)",
        albumArtAsBackground: defaultValues.albumArtAsBackground === "a",
        metadataColorOption: defaultValues.metadataColorOption ?? 0,
        metadataColorFilter: defaultValues.metadataColorFilter ?? "blur(36px) brightness(35%) contrast(110%)",
        metadataColorForceRefresh: 0,
        useProgressBarColor: defaultValues.useProgressBarColor ?? false,
        remainingColor: defaultValues.remainingColor ?? "#000000"
    });
    /**
     * The reference of the State, so that it can be accessed also from intervals
     */
    let dataRef = useRef<RenderState>(state);
    let heightProgress = useRef<number>(-9999);
    /**
* The array that'll contain all the contexts that are being currently modified, so that multiple operations (and therefore glitches) can be avoided
*/
    let canvasDrawing = useRef<CanvasRenderingContext2D[]>([]);
    /**
        * The object that contains all the information required for handling clicks on the progress bar
     */
    let interactiveProgress = useRef({
        from: [0, 0],
        length: 0,
        size: 0
    })
    /**
        * The object that contains all the necessary information for handling button clicks
    */

    let interactiveValues = useRef({
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
    })
    /**
     * Generates a pseudo-random number
     * @param min the minimum number (included) to get
     * @param max the maximum number (excluded) to get
     * @returns a number, included in that range
     */
    function randomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }
    let interval = useRef<number | undefined>(undefined);
    useLayoutEffect(() => { dataRef.current = state }, [state]); // Apply the value to the new State before firing all the other useEffect events
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
    async function writeUpdateElements(dontUpdate?: boolean) {
        const textCtx = textCanvas.current?.getContext("2d");
        if (dataRef.current.isPlaying && !dontUpdate) {// One second has passed
            updateState(prevState => { return { ...prevState, currentPlayback: prevState.currentPlayback + 1000 } })
        }
        if (heightProgress.current === -9999) return; // No calculated height from the Album Art canvas has been provided. Don't do anything.
        if (dataRef.current.dataProvided && textCtx && canvasDrawing.current.indexOf(textCtx) === -1) { // If data has been provided, and there aren't any current actions being done on this canvas, start drawing on it
            textCtx.clearRect(0, 0, dataRef.current.width, dataRef.current.height);
            canvasDrawing.current.push(textCtx);
            // Minute/Hour
            textCtx.font = `bold ${dataRef.current.width * 30 / 100}px ${dataRef.current.font}`;
            textCtx.fillStyle = dataRef.current.color;
            const currentDate = [new Date().getHours(), new Date().getMinutes()];
            const finalText = `${currentDate[0] < 10 ? "0" : ""}${currentDate[0]}:${currentDate[1] < 10 ? "0" : ""}${currentDate[1]}`;
            writeText({ ctx: textCtx, text: finalText, height: (dataRef.current.height * 13 / 100) });
            // Date string
            const monthString = new Date().toLocaleDateString(navigator.languages[0], {
                weekday: "long",
                day: "numeric",
                month: "long",
            });
            textCtx.font = `${dataRef.current.width * 8 / 100}px ${dataRef.current.font}`;
            writeText({ ctx: textCtx, text: monthString, height: (dataRef.current.height * 5 / 100) });
            // The current time of the song
            let startDate = new Date(dataRef.current.currentPlayback).toLocaleTimeString().substring(3).trim();
            if (startDate.startsWith("0")) startDate = startDate.substring(1);
            textCtx.font = `${dataRef.current.width * 3 / 100}px ${dataRef.current.font}`;
            textCtx.fillStyle = dataRef.current.color;
            writeText({ ctx: textCtx, text: startDate, height: heightProgress.current - 2, width: 25 + (((dataRef.current.width * 20 / 100) - textCtx.measureText(startDate).width) / 2) });
            // The end time of the song
            let endDate = new Date(dataRef.current.maxPlayback - dataRef.current.currentPlayback).toLocaleTimeString().substring(3).trim();
            if (endDate.startsWith("0")) endDate = endDate.substring(1);
            endDate = `-${endDate}`;
            writeText({ ctx: textCtx, text: endDate, height: heightProgress.current - 2, width: (dataRef.current.width * 80 / 100) + ((textCtx.measureText(startDate).width) / 2) });
            interactiveProgress.current = { // Update the position of the progress bar
                from: [dataRef.current.width * 20 / 100, heightProgress.current],
                length: dataRef.current.width * 60 / 100,
                size: 80
            }
            // Draw the progress bar
            textCtx.drawImage(roundedRectangle({ drawImg: dataRef.current.useProgressBarColor ? dataRef.current.progressBarColor : undefined, filter: "brightness(75%)", fill: `${dataRef.current.remainingColor}d9`, val: [dataRef.current.width * 20 / 100, heightProgress.current, dataRef.current.width * 60 / 100, Math.max(dataRef.current.height * 0.8 / 100, 15), 80] }), 0, 0);
            textCtx.drawImage(roundedRectangle({ drawImg: dataRef.current.useProgressBarColor ? dataRef.current.progressBarColor : undefined, filter: "brightness(200%)", fill: `${dataRef.current.color}d9`, val: [dataRef.current.width * 20 / 100, heightProgress.current, Math.min((dataRef.current.currentPlayback * (dataRef.current.width * 60 / 100) / dataRef.current.maxPlayback), dataRef.current.width * 60 / 100), Math.max(dataRef.current.height * 0.8 / 100, 15), 80] }), 0, 0);
            canvasDrawing.current.splice(canvasDrawing.current.indexOf(textCtx), 1);
        }
        dataRef.current.currentPlayback > dataRef.current.maxPlayback && refresh(); // Ask to refresh data from Spotify API if the time played is greater than the track's length, since this means that the track _should_ be ended
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
        interval.current && clearInterval(interval.current)
        interval.current = setInterval(() => { writeUpdateElements() }, 1000); // Update the time-sensitive values every second
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
            canvas.width = square ? 1000 : dataRef.current.width;
            canvas.height = square ? 1000 : dataRef.current.height;
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
            if (localStorage.getItem("Playerify-SVGIconBackground") !== "b" && (await fetch(image, { method: image.startsWith("blob") ? undefined : "HEAD" })).headers.get("content-type")?.toLowerCase() === "image/svg+xml") { // If the provided image is a SVG, and the user hasn't disabled the "Fill replacer" option, replace the fill values with the current color. If the content is served from a Blob URL, the HEAD request should fail, and therefore a normal request is done
                const newImg = await fetch(image);
                const text = await newImg.text();
                let split = text.replace(/'/g, `"`).split(`fill="`);
                for (let i = 1; i < split.length; i++) split[i] = `${state.color}${split[i].substring(split[i].indexOf(`"`))}`;
                image = URL.createObjectURL(new Blob([split.join(`fill="`)], { type: "image/svg+xml" }));
            }
            img.src = image;
        })
    }
    useEffect(() => { // Generate a new color for progress bar when the image changes, or when the user wants to regenerate it
        (async () => {
            const colorImg = await getBackgroundImageBlur(2);
            colorImg instanceof HTMLCanvasElement && updateState(prevState => { return { ...prevState, progressBarColor: colorImg } })
        })()

    }, [state.img, state.metadataColorForceRefresh])
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
        ctx.fillText(text, width ?? ((dataRef.current.width - measure.width) / 2), measure.actualBoundingBoxAscent + height);
        return measure;
    }
    /**
     * Draw a rounded rectangle in a proxy canvas
     * @param fill the style used for filling the rectangle
     * @param val the position of the rectangle
     * @param drawImg an Image (or Canvas element) to draw in the rounded rectangle
     * @param filter the filter to apply to the Image
     * @returns a Canvas with the rounded rectangle drawn
     */
    function roundedRectangle({ fill, val, drawImg, filter }: RoundedRectProps) {
        const canvas = document.createElement("canvas");
        canvas.width = dataRef.current.width;
        canvas.height = dataRef.current.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context returned null");
        if (!drawImg) ctx.fillStyle = fill; // Avoid adding a fill style if an image must be added
        ctx.roundRect(...val);
        ctx.fill();
        if (drawImg) { // An image must be drawn
            ctx.clip();
            if (filter) ctx.filter = filter;
            const backgroundCtx = backgroundCanvas.current?.getContext("2d");
            if (backgroundCtx) {
                const { scale, x, y } = getRatio(backgroundCtx.canvas, drawImg); // The ratio is fetched from the Background canvas so that the new blurred rectangle will be in the same exact position as the background image
                ctx.drawImage(drawImg, x, y, drawImg.width * scale, drawImg.height * scale);
            }
        }
        return canvas;
    }
    /**
     * Manage background image for the rounded rectangle
     * @param metadataColor the ID of the operation to do. `1` and `2` edits the album art, while `3` and `4` edits the background image. `1` and `3` only fetch the image, while `2` and `4` fetch a random color from it.
     * @returns a Promise, with an HTMLImageElement or a HTMLCanvasElement if the operation succeded
     */
    function getBackgroundImageBlur(metadataColor: number) {
        return new Promise<HTMLImageElement | undefined | HTMLCanvasElement>((resolve) => {
            if (metadataColor === 0) resolve(undefined); // A static color must be used, so there's no necessity to create an image
            const img = new Image();
            img.src = (metadataColor === 1 || metadataColor === 2) ? dataRef.current.img : dataRef.current.background; // With "1" or "2", the content must be extracted from the album art
            img.onload = () => {
                (metadataColor === 1 || metadataColor === 3) && resolve(img); // With "1" or "3", the image will be taken without any cut, and it'll be later blurred. 
                // Otherwise, the image must be cut in a 1x1 px to get a single color
                const canvas = document.createElement("canvas");
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, randomNumber(0, img.width), randomNumber(0, img.height), 1, 1, 0, 0, 1, 1); // Get a random pixel from the image, and return it
                    resolve(canvas);
                }
            }
            setTimeout(() => resolve(undefined), 5000); // Fallback to default color after 5 seconds
        })
    }
    /**
 * Get the ratio to apply to the `canvas.drawImage()` function to make an image centered
 * @param canvas the canvas element where the image will be applied
 * @param img the image to apply
 * @returns an object, with the `scale` of width/height, and the `x` and `y` coordinates of the image start
 */
    function getRatio(canvas: HTMLCanvasElement, img: HTMLImageElement | HTMLCanvasElement) {
        const [canvasRatio, imgRatio] = [canvas.width / canvas.height, img.width / img.height]; // Get the two canvas ratio
        // Get the scale for the final width/hegith of the canvas paint
        const scale = imgRatio > canvasRatio ? canvas.height / img.height : canvas.width / img.width;
        // Get also the starting position for the canvas
        let [x, y] = imgRatio > canvasRatio ? [(canvas.width - (img.width * scale)) / 2, 0] : [0, (canvas.height - (img.height * scale)) / 2]
        return {
            scale: scale,
            x: x,
            y: y
        }
    }
    useEffect(() => { // Draw the background image
        if (!state.dataProvided) return;
        const ctx = backgroundCanvas.current?.getContext("2d");
        if (!ctx || canvasDrawing.current.indexOf(ctx) !== -1) return;
        canvasDrawing.current.push(ctx);
        ctx.clearRect(0, 0, dataRef.current.width, dataRef.current.height);
        // Get the background image width/height by creating a new Image element. In this way, the painted image will be centered
        const img = new Image();
        img.src = state.albumArtAsBackground ? state.img : state.background;
        img.onload = async () => {
            const { scale, x, y } = getRatio(ctx.canvas, img);
            ctx.drawImage(await proxyCanvas({ filter: state.backgroundFilter, image: state.albumArtAsBackground ? state.img : state.background, drawProps: [x, y, img.width * scale, img.height * scale] }), 0, 0, dataRef.current.width, dataRef.current.height);
            canvasDrawing.current.splice(canvasDrawing.current.indexOf(ctx), 1);
        }
    }, [state.background, state.width, state.height, state.forceReRender, state.dataProvided, state.backgroundFilter, state.albumArtAsBackground, state.img])
    /**
     * Draw the button icons to their dedicated canvas
     */
    async function drawIcons() {
        if (!dataRef.current.dataProvided) return;
        const ctx = buttonCanvas.current?.getContext("2d");
        if (!ctx || canvasDrawing.current.indexOf(ctx) !== -1) return;
        canvasDrawing.current.push(ctx);
        setTimeout(async () => {
            ctx.clearRect(0, 0, dataRef.current.width, dataRef.current.height);
            ctx.drawImage(await proxyCanvas({ image: dataRef.current.isPlaying ? dataRef.current.pause : dataRef.current.play, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.current.pause.from[0], interactiveValues.current.pause.from[1], interactiveValues.current.pause.length, interactiveValues.current.pause.length);
            ctx.drawImage(await proxyCanvas({ image: dataRef.current.prev, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.current.prev.from[0], interactiveValues.current.prev.from[1], interactiveValues.current.prev.length, interactiveValues.current.prev.length);
            ctx.drawImage(await proxyCanvas({ image: dataRef.current.next, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.current.next.from[0], interactiveValues.current.next.from[1], interactiveValues.current.next.length, interactiveValues.current.next.length);
            ctx.drawImage(await proxyCanvas({ image: availableCustomIcons.indexOf(dataRef.current.devicePlaybackType) !== -1 ? dataRef.current[dataRef.current.devicePlaybackType as "automobile"] : dataRef.current.playbackDevice, drawProps: [0, 0, 1000, 1000], square: true }), interactiveValues.current.device.from[0], interactiveValues.current.device.from[1], interactiveValues.current.device.length, interactiveValues.current.device.length);
            canvasDrawing.current.splice(canvasDrawing.current.indexOf(ctx), 1);
        }, 200)
    }
    useEffect(() => { // Draw the album art and metadata of the song
        (async () => {
            if (!state.dataProvided) return;
            const ctx = canvas.current?.getContext("2d");
            if (!ctx || canvasDrawing.current.indexOf(ctx) !== -1) return;
            canvasDrawing.current.push(ctx);
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

            ctx.drawImage(roundedRectangle({
                filter: dataRef.current.metadataColorFilter, drawImg: await getBackgroundImageBlur(state.metadataColorOption), fill: `${state.metadataColor}59`, val: [state.width * 2.5 / 100, squareStart, state.width * 95 / 100, state.height * 20 / 100, 80]
            }), 0, 0);
            // Write the album name
            ctx.fillStyle = state.color;
            ctx.font = `bold ${state.width * 5 / 100}px ${state.font}`;
            writeText({ ctx: ctx, text: state.title, height: squareStart + 75, autoWidth: state.width * 85 / 100 });
            // And now write the author and album name
            ctx.font = `${state.width * 4 / 100}px ${state.font}`;
            const heightAuthorStart = (state.width * 5 / 100) + squareStart + 105;
            const heightAuthor = writeText({ ctx: ctx, text: `${state.author}  —  ${state.album}`, height: heightAuthorStart, autoWidth: state.width * 85 / 100 });
            heightProgress.current = heightAuthorStart + (state.height * 2 / 100) + heightAuthor.actualBoundingBoxAscent;
            // Update all the values for the icons
            interactiveValues.current.pause = {
                from: [((state.width / 2) - ((state.width * state.iconSize / 100) / 2)), heightProgress.current + (state.height * 3.2 / 100)],
                length: state.width * state.iconSize / 100
            }
            interactiveValues.current.prev = {
                from: [((state.width / 2) - ((state.width * state.iconSize / 100) / 2) - (state.width * 20 / 100)), heightProgress.current + (state.height * 3.2 / 100)],
                length: state.width * state.iconSize / 100
            }
            interactiveValues.current.next = {
                from: [((state.width / 2) - ((state.width * state.iconSize / 100) / 2) + (state.width * 20 / 100)), heightProgress.current + (state.height * 3.2 / 100)],
                length: state.width * state.iconSize / 100
            }
            interactiveValues.current.device = {
                from: [(state.width * 90 / 100) - (state.width * state.iconSize / 100), heightProgress.current + (state.height * 3.2 / 100)],
                length: (state.width * state.iconSize / 100)
            }
            await writeUpdateElements(true); // Update the icon position, without adding the second
            canvasDrawing.current.splice(canvasDrawing.current.indexOf(ctx), 1);
            drawIcons();
            console.log(state.progressBarColor);
        })()
    }, [state.album, state.author, state.color, state.font, state.height, state.img, state.imgRadius, state.metadataColor, state.width, state.title, state.forceReRender, state.dataProvided, state.metadataColorFilter, state.metadataColorOption, state.metadataColorForceRefresh, state.progressBarColor, state.useProgressBarColor]);
    useEffect(() => { drawIcons() }, [state.automobile, state.color, state.computer, state.devicePlaybackType, state.game_console, state.height, state.iconSize, state.isPlaying, state.next, state.pause, state.play, state.playbackDevice, state.prev, state.smartphone, state.speaker, state.tablet, state.tv, state.width, state.forceReRender, state.dataProvided])
    return <>
        <div ref={fullscreenDiv} style={{ position: "relative" }}>
            <canvas data-canvasexport width={state.width} height={state.height} className="fixedCanvas" ref={backgroundCanvas}></canvas>
            <canvas data-canvasexport className="fixedCanvas" style={{ position: "absolute", top: "0", left: "0", zIndex: "1" }} ref={canvas} width={state.width} height={state.height}></canvas>
            <canvas data-canvasexport className="fixedCanvas" style={{ position: "absolute", top: "0", left: "0", zIndex: "2" }} ref={buttonCanvas} width={state.width} height={state.height}></canvas>
            <canvas data-canvasexport className="fixedCanvas" onClick={async (e) => {
                const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
                const coordinates = [(e.clientX - rect.left) * state.width / rect.width, (e.clientY - rect.top) * state.height / rect.height];
                if (interactiveProgress.current.from[0] < coordinates[0] && (interactiveProgress.current.from[0] + interactiveProgress.current.length) > coordinates[0] && interactiveProgress.current.from[1] < coordinates[1] && (interactiveProgress.current.from[1] + interactiveProgress.current.size) > coordinates[1]) { // Clicked on the progress bar
                    const process = (coordinates[0] - interactiveProgress.current.from[0]) / (interactiveProgress.current.length);
                    await event(`seek?position_ms=${Math.floor(state.maxPlayback * process)}`);
                    return;
                }
                for (let button in interactiveValues.current) {
                    if (interactiveValues.current[button as "pause"].from[0] < coordinates[0] && (interactiveValues.current[button as "pause"].from[0] + interactiveValues.current[button as "pause"].length) > coordinates[0] && interactiveValues.current[button as "pause"].from[1] < coordinates[1] && (interactiveValues.current[button as "pause"].from[1] + interactiveValues.current[button as "pause"].length) > coordinates[1]) { // That button has been clicked
                        await event(button === "pause" && !state.isPlaying ? "play" : button, [e.clientX, e.clientY]); // Send the request to Spotify
                        button === "pause" && updateState(prevState => { return { ...prevState, isPlaying: !prevState.isPlaying, currentPlayback: dataRef.current.currentPlayback } }); // Update the isPlaying property if the pause button has been clicked
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