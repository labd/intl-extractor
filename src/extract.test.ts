import { describe, expect, test } from "vitest";
import { extractLabels } from "./extract";

describe("Test parseSource", () => {
	test("should parse source", () => {
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

		const result = extractLabels("MyComponent.tsx", source);
		const expected = {
			MyComponent: new Set(["foobar", "foodiebar", "title"]),
		};
		expect(result).toEqual(expected);
	});

	test("should parse translator object functions", () => {
		const source = `
		export const MyComponent = () => {
			const t = useTranslations("MyComponent");

			const foobar = t.html("foobar");

			return (
				<div>
					<h1>{t.rich("title")}</h1>
				</div>
			)
		}
		`;

		const result = extractLabels("MyComponent.tsx", source);
		const expected = {
			MyComponent: new Set(["foobar", "title"]),
		};
		expect(result).toEqual(expected);
	});

	test("should not throw when useTranslations is called without a namespace", () => {
		const source = `
			export const MyComponent = () => {
				const t = useTranslations();

				return <h1>{t('title')}</h1>;
			}
		`;
		expect(() => extractLabels("MyComponent.tsx", source)).not.toThrow();
	});

	test("should not throw when getTranslations is called without a namespace", () => {
		const source = `
			export const MyComponent = async () => {
				const t = await getTranslations();

				return <h1>{t('title')}</h1>;
			}
		`;
		expect(() => extractLabels("MyComponent.tsx", source)).not.toThrow();
	});
});

describe("getTranslator usage", () => {
	test("should parse source from server component using getTranslations", () => {
		const source = `
		export const MyComponent = async () => {
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

		const result = extractLabels("MyComponent.tsx", source);

		const expected = {
			ProductListing: new Set(["foobar", "title", "results"]),
		};
		expect(result).toEqual(expected);
	});

	test("should parse translator object functions (literal)", () => {
		const source = `
		export const MyComponent = () => {
			const t = await getTranslations("MyComponent");

			const foobar = t.html("foobar");

			return (
				<div>
					<h1>{t.rich("title")}</h1>
				</div>
			)
		}
		`;

		const result = extractLabels("MyComponent.tsx", source);
		const expected = {
			MyComponent: new Set(["foobar", "title"]),
		};
		expect(result).toEqual(expected);
	});

	test("should parse translator object functions (object) ", () => {
		const source = `
		export const MyComponent = () => {
			const t = await getTranslations({ namespace: "MyComponent", locale });

			const foobar = t.html("foobar");

			return (
				<div>
					<h1>{t.rich("title")}</h1>
				</div>
			)
		}
		`;

		const result = extractLabels("MyComponent.tsx", source);
		const expected = {
			MyComponent: new Set(["foobar", "title"]),
		};
		expect(result).toEqual(expected);
	});
});
