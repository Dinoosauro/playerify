import { ReactNode } from "react"

interface Props {
    children: ReactNode,
    callback?: (checked: boolean) => void
}
export default function Checkbox({ children, callback }: Props) {
    return <div style={{ position: "relative" }} className="flex hcenter">
        <input type="checkbox" onChange={(e) => callback && callback(e.target.checked)}></input>
        {children}
    </div>
}