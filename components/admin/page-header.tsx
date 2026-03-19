import { LucideIcon } from "lucide-react"

interface Action {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: "primary" | "outline"
}

interface PageHeaderProps {
    title: string
    actions?: Action[]
}

export function PageHeader({ title, actions = [] }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h1>

            {actions.length > 0 && (
                <div className="flex items-center gap-2">
                    {actions.map(({ label, icon: Icon, onClick, variant = "primary" }) => (
                        <button
                            key={label}
                            onClick={onClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                variant === "primary"
                                    ? "bg-primary dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-100"
                                    : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }`}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}