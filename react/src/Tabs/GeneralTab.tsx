import { useState } from "react";
import Sections from "../Components/Sections";
import Size from "./Size";
import Render from "./Render";
import { AppState } from "../Interface/Interfaces";
import Icons from "./Icons";
import ChangeContent from "./ChangeContent";
import WebsiteSettings from "./WebsiteSettings";
import MetadataBubble from "./MetadataBubble";

interface Props {
    mainState: React.Dispatch<React.SetStateAction<AppState>>
}
/**
 * The container of each Tab
 * @param mainState the function that is called to update the state of the App.tsx file
 * @returns a ReactNode of the container of every canvas editor tab
 */
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
            displayedName: "Metadata bubble",
            id: "metadatabubble"
        },
        {
            displayedName: "Website options",
            id: "website"
        }]} callback={(val) => updateState(val)}></Sections>
        {state === "size" ? <Size></Size> : state === "icon" ? <Icons></Icons> : state === "metadata" ? <ChangeContent></ChangeContent> : state === "render" ? <Render updateState={mainState}></Render> : state === "metadatabubble" ? <MetadataBubble></MetadataBubble> : <WebsiteSettings></WebsiteSettings>}
    </>
}