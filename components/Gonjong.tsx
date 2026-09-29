// Rumah Minang roof (gonjong) divider, drawn in the same line style as the poster.
export default function  Gonjong({ className = "" }: { className?: string }) {
    return (
        <div className={"mx-auto flex max-w-3xl items-center gap-4 px-6 text-kayu " + className}>
            <div className="h-px flex-1 bg-kayu/40" />
            <svg
                width="110"
                height="55"
                viewBox="0 0 220 110"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path
                    fill="currentColor"
                    stroke="none"
                    d="M4 0 C16 38 60 54 110 50 C160 54 204 38 216 0 C214 34 192 62 150 68 L70 68 C28 62 6 34 4 0 Z"
                />
                <path
                    fill="currentColor"
                    stroke="none"
                    d="M80 8 C88 32 100 38 110 37 C120 38 132 32 140 8 C140 30 130 48 110 51 C90 48 80 30 80 8 Z"
                />
                <path d="M44 68 V94 H176 V68" />
                <path d="M44 80 H176" />
                <path d="M66 82 v10 M88 82 v10 M110 82 v10 M132 82 v10 M154 82 v10" />
                <path d="M36 94 H184" />
                <path d="M52 94 V106 M84 94 V106 M110 94 V106 M136 94 V106 M168 94 V106" />
            </svg>
            <div className="h-px flex-1 bg-kayu/40" />
        </div>
    );
}