import { describe, expect, test } from "vitest";
import { parseSource } from "./parse";

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
		}

		// Nested scope
		export function MyOtherComponent = () => {
			const t = useTranslations("MyComponent");

			const content () => {
				const foobar = t("foodiebar");
				return (
					<div>
						<h1>{t("title")}</h1>
					</div>
				)
			}
			return content()
		}
		`;

		const result = await parseSource("MyComponent.tsx", source);
		const expected = {
			foobar: "foobar",
			foodiebar: "foodiebar",
			title: "title",
		};
		expect(result).toEqual(expected);
	});

	test("should parse source", async () => {
		const source = `
		"use client";

		import { useTranslations } from "next-intl";


		export const MyComponent = () => {
			const t = await getTranslations({ namespace: "ProductListing", locale });

			const foobar = t("foobar");

			return (
				<div>
					<h1>{t("title")}</h1>
					<div>
						{t("results", {
							total: products.total,
						})}
					</div>
				</div>
			)
		`;

		const result = await parseSource("MyComponent.tsx", source);
		const expected = {
			foobar: "foobar",
			title: "title",
			results: "results",
		};
		expect(result).toEqual(expected);
	});
});
