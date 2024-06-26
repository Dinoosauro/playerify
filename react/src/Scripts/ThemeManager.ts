const themes = {
    dark: {
        background: "#151515",
        text: "#fafafa",
        card: "#313131",
        second: "#494949",
        accent: "#44964c"
    },
    light: {
        background: "#fafafa",
        text: "#151515",
        card: "#D7D7D7",
        second: "#BEBEBE",
        accent: "#1FC22F"
    }
}
export default {
    /**
     * Change the theme of the application
     * @param light if light mode should be applied
     */
    apply: (light: boolean) => {
        for (let type in themes.dark) document.body.style.setProperty(`--${type}`, themes[light ? "light" : "dark"][type as "background"]);
        localStorage.setItem("Playerify-DefaultTheme", light ? "a" : "b");
        window.updateHeaderState(prevState => prevState + 1);
    },
    themes: themes
}