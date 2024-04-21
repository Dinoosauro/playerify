import { ReactNode } from "react"

interface Props {
    children: ReactNode,
    close: () => void
}
/**
 * Creates a full-screen dialog
 * @param children the content inside the Dialog
 * @param close the function that'll permit to close the dialog
 * @returns a Dialog ReactNode
 */
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