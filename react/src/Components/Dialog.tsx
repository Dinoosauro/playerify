import { ReactNode } from "react"

interface Props {
    children: ReactNode,
    close: () => void
}
export default function Dialog({ children, close }: Props) {
    return <div className="dialog" role="dialog">
        <div>
            <div>
                {children}<br></br><br></br>
                <button onClick={close} style={{ width: "100%" }}>Close dialog</button>
            </div>
        </div>
    </div>
}