import { ReactNode } from "react";

interface Props {
    children: ReactNode,
    type?: number,
    fullWidth?: boolean
}
/**
 * Creates a Card-like element
 * @param children ReactNode of the children of the card
 * @param type currently, put "1" to use the var(--second) CSS attribute. Otherwise, no other color will be applied
 * @param fullWidth if the card should occupy full width
 * @returns a ReactNode of the Card item
 */
export default function Card({ children, type = 0, fullWidth }: Props) {
    return <div className={`card${fullWidth ? " fullWidth" : ""}`} style={{ backgroundColor: type === 1 ? "var(--second)" : undefined }}>
        {children}
    </div>
}