import ThemeManager from "../Scripts/ThemeManager";

export default function WebsiteSettings() {
    return <>
        <h3>Website settings:</h3>
        <button onClick={() => ThemeManager.apply(localStorage.getItem("Playerify-DefaultTheme") !== "a")}>Change theme</button>
    </>
}