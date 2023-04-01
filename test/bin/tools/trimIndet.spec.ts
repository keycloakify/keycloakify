import trimIndent from "keycloakify/bin/tools/trimIndent";
import { it, describe, assert } from "vitest";

describe("trimIndent", () => {

    it("does not change a left-aligned string as expected", () => {
        const txt = trimIndent`lorem
ipsum`
        assert.equal(txt, ['lorem', 'ipsum'].join('\n'))
    })

    it("removes leading and trailing empty lines from a left-aligned string", () => {
        const txt = trimIndent`
lorem
ipsum
`
        assert.equal(txt, ['lorem', 'ipsum'].join('\n'))
    })

    it("removes indent from an aligned string", () => {
        const txt = trimIndent`
            lorem
            ipsum
        `
        assert.equal(txt, ['lorem', 'ipsum'].join('\n'))
    })

    it("removes indent from unaligned string", () => {
        const txt = trimIndent`
            lorem
                ipsum
        `
        assert.equal(txt, ['lorem', '    ipsum'].join('\n'))
    })

    it("removes only first and last empty line", () => {
        const txt = trimIndent`

            lorem
            ipsum

            `

        assert.equal(txt, ['', 'lorem', 'ipsum', ''].join('\n'))
    })


    it("interpolates non-strings", () => {
        const d = new Date()
        const txt = trimIndent`
            lorem
            ${d}
            ipsum`

        assert.equal(txt, ['lorem', String(d), 'ipsum'].join('\n'))
    })
})