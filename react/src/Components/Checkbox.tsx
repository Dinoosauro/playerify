import { ReactNode } from "react"

interface Props {
    children: ReactNode,
    callback?: (checked: boolean) => void,
    checked?: boolean
}
/**
 * Creates a Slider
 * @param children the content at the right of the checkbox
 * @param callback the function that'll be called when the checkbox value is edited
 * @param checked if the slider is enabled or not
 * @returns a checkbox (now a slider) ReactNode
 */
export default function Checkbox({ children, callback, checked }: Props) {
    return <div style={{ position: "relative" }} className="flex hcenter">
        <div style={{ position: "relative" }}>
            <input defaultChecked={checked} type="checkbox" onChange={(e) => callback && callback(e.target.checked)}></input>
        </div>
        {children}
    </div>
}