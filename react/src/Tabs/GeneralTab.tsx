import { useState } from "react";
import Sections from "../Components/Sections";
import Size from "./Size";
import Render from "./Render";
import { AppState } from "../Interface/Interfaces";
import Icons from "./Icons";
import ChangeContent from "./ChangeContent";
import WebsiteSettings from "./WebsiteSettings";

interface Props {
    mainState: React.Dispatch<React.SetStateAction<AppState>>
}
export default function GeneralTab({ mainState }: Props) {
    let [state, updateState] = useState("");
    return <><h2>Options:</h2>
        <Sections list={[{
            displayedName: "Size",
            id: "size"
        },
        {
            displayedName: "Icons",
            id: "icon"
        },
        {
            displayedName: "Metadata",
            id: "metadata"
        },
        {
            displayedName: "Render options",
            id: "render"
        },
        {
            displayedName: "Website options",
            id: "website"
        }]} callback={(val) => updateState(val)}></Sections>
        {state === "size" ? <Size></Size> : state === "icon" ? <Icons></Icons> : state === "metadata" ? <ChangeContent></ChangeContent> : state === "render" ? <Render updateState={mainState}></Render> : <WebsiteSettings></WebsiteSettings>}
    </>
}