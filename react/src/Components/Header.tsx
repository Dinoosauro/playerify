import { useEffect, useRef, useState } from "react"

/**
 * The icon and title of the website
 * @returns the Header ReactNode
 */
export default function Header() {
    let ref = useRef<HTMLImageElement>(null);
    let [state, updateState] = useState(0); // Used only for re-rendering
    useEffect(() => {
        window.updateHeaderState = updateState; // Make it a global function, so that header re-rendering can be triggered from anywhere (currently only when the theme is changed, so that the icon can be updated)
    }, [])
    useEffect(() => { // Fetch the icon, change the color and make it the source of the image
        fetch(`./icon.svg`).then((res) => res.text().then((text) => {
            if (ref.current) ref.current.src = URL.createObjectURL(new Blob([text.replace(/#44964c/g, getComputedStyle(document.body).getPropertyValue("--accent"))], { type: "image/svg+xml" }));
            return; // TypeScript issue
        }))
    })
    return <div className="flex hcenter wcenter">
        <img style={{ marginRight: "10px" }} width={48} height={48} ref={ref}></img>
        <h1>Playerify</h1>
    </div>
}