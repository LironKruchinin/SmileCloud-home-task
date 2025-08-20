import { useEffect, useRef } from "react";

declare global {
    interface Window {
        MathJax?: {
            typesetPromise?: (elements?: Element[]) => Promise<void>;
        };
    }
}

type MathBlockProps = {
    tex: string;
    inline?: boolean;
};

export default function MathBlock({ tex, inline = false }: MathBlockProps) {
    const elRef = useRef<HTMLSpanElement | HTMLDivElement>(null);

    useEffect(() => {
        if (window.MathJax?.typesetPromise && elRef.current) {
            window.MathJax.typesetPromise([elRef.current]).catch(() => { });
        }
    }, [tex]);

    const content = inline ? `\\(${tex}\\)` : `\\[${tex}\\]`;

    const Comp: any = inline ? "span" : "div";
    return <Comp ref={elRef}>{content}</Comp>;
}
