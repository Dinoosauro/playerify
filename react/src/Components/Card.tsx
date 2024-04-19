import { ReactNode } from "react";

interface Props {
    children: ReactNode,
    type?: number,
    fullWidth?: boolean
}
export default function Card({ children, type = 0, fullWidth }: Props) {
    return <div className={`card${fullWidth ? " fullWidth" : ""}`} style={{ backgroundColor: type === 1 ? "var(--second)" : undefined }}>
        {children}
    </div>
}