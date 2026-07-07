
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
}

export async function ensureUniqueSlug(
    slug: string,
    checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
    let candidate = slug
    let counter   = 1
    while (await checkExists(candidate)) {
        candidate = `${slug}-${counter}`
        counter++
    }
    return candidate
}
