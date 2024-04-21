import { ReactNode } from "react"

interface Props {
    children: ReactNode,
    callback?: (checked: boolean) => void
}
/**
 * Creates a Slider
 * @param children the content at the right of the checkbox
 * @param callback the function that'll be called when the checkbox value is edited
 * @returns a checkbox (now a slider) ReactNode
 */
export default function Checkbox({ children, callback }: Props) {
    return <div style={{ position: "relative" }} className="flex hcenter">
        <input type="checkbox" onChange={(e) => callback && callback(e.target.checked)}></input>
        {children}
    </div>
}