import { createRoot } from "react-dom/client";
import ThemeManager from "../Scripts/ThemeManager";
import Dialog from "../Components/Dialog";
import OpenSource from "../Components/OpenSource";

/**
 * The tab that permits to change general settings about the website (ex: theme)
 * @returns the WebsiteSettings ReactNode
 */
export default function WebsiteSettings() {
    return <>
        <h3>Website settings:</h3>
        <button style={{ marginRight: "10px" }} onClick={() => ThemeManager.apply(localStorage.getItem("Playerify-DefaultTheme") !== "a")}>Change theme</button>
        <button onClick={() => {
            let div = document.createElement("div");
            createRoot(div).render(<Dialog close={() => {
                (div.querySelector(".dialog") as HTMLDivElement).style.opacity = "0";
                setTimeout(() => div.remove(), 210);
            }}>
                <OpenSource></OpenSource>
            </Dialog>);
            document.body.append(div);
        }}>Open source license</button>
    </>
}