import { describe, expect, test } from "vitest"
import { parseSource } from "./parse"


describe("Test parseSource", () => {

	test("should parse source", async () => {
		const source = `
		"use client";

		import { useTranslations } from "next-intl";


		export const MyComponent = () => {
			const t = useTranslations("MyComponent");

			const foobar = t("foobar");

			return (
				<div>
					<h1>{t("title")}</h1>
				</div>
			)
		`

		const result = await parseSource("MyComponent.tsx", source)
		const expected = {
			foobar: "",
			title: "",
		}
		expect(result).toEqual(expected)
	})
})
