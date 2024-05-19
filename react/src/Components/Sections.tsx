import { useEffect, useRef } from "react"
import Card from "./Card"

interface Props {
    list: {
        displayedName: string,
        id: string
    }[],
    callback: (callbackId: string) => void
}
/**
 * A Section component is a component that permits horizontal scrolling between tabs
 * @param list an object array that contains a `displayedName` property, for the name that'll be displayed in the DOM, and an ID, used for the callback
 * @param callback the function that'll be called when the selection changes
 * @returns A Section component ReactNode
 */
export default function Sections({ list, callback }: Props) {
    let mainContainer = useRef<HTMLDivElement>(null)
    /**
     * Move the line to where it was clicked
     * @param clicked the item that was clicked
     */
    function updateLine(clicked: HTMLElement) {
        let totalRect = mainContainer.current?.getBoundingClientRect();
        let line = mainContainer.current?.querySelector(".moveLine") as HTMLElement | null;
        let rect = (clicked?.querySelector("span") ? clicked.querySelector("span") : clicked)?.getBoundingClientRect();
        if (line && totalRect && rect) {
            line.style.left = `${rect.left - totalRect.left + (mainContainer.current?.scrollLeft ?? 0)}px`;
            line.style.width = `${rect.width}px`;
        }
    }
    useEffect(() => { // Click on the first span to update the width of the line
        if (mainContainer.current) {
            mainContainer.current.querySelector("span")?.click();
        }
    }, [])
    return <Card type={1}>
        <div ref={mainContainer} className="flex sectionAdapt" style={{ position: "relative", overflow: "auto" }}>
            {list.map(item => <span className="pointer" key={`Playerify-SectionSelect-${item.id}`} onClick={(e) => { updateLine(e.target as HTMLElement); callback(item.id) }} style={{ marginRight: "10px" }}><Card><span style={{ whiteSpace: "nowrap" }}>{item.displayedName}</span></Card></span>)}
            <div className="moveLine"></div>
        </div>
    </Card>
}