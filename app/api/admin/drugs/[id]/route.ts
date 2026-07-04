import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body   = await req.json()

        const drug = await prisma.drug.update({
            where: { id },
            data: {
                name:        body.name,
                genericName: body.genericName ?? null,
                category:    body.category    ?? null,
                unit:        body.unit        ?? "tablet",
                price:       parseFloat(body.price),
                inStock:     body.inStock     ?? true,
            },
        })

        return NextResponse.json(drug)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.drug.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Something went wrong"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
