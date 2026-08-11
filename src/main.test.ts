import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { buildLabels } from "./main";

const withSource = async (contents: string): Promise<string> => {
	const dir = await mkdtemp(join(tmpdir(), "intl-extractor-"));
	await writeFile(join(dir, "component.tsx"), contents, "utf8");
	return dir;
};

const COMPONENT = `
import { useTranslations } from "next-intl";

export function Cart() {
  const t = useTranslations("Cart");
  return <button>{t("submit")}</button>;
}
`;

describe("buildLabels", () => {
	test("returns the tree without writing anything", async () => {
		const input = await withSource(COMPONENT);

		expect(await buildLabels({ input })).toEqual({
			Cart: { submit: "submit" },
		});
	});

	test("takes values from source and falls back for the rest", async () => {
		const input = await withSource(COMPONENT);

		expect(
			await buildLabels({
				input,
				source: { Cart: { submit: "Add to cart" } },
			}),
		).toEqual({ Cart: { submit: "Add to cart" } });

		expect(
			await buildLabels({ input, fallback: (p) => `[${p.at(-1)}]` }),
		).toEqual({ Cart: { submit: "[submit]" } });
	});

	test("reports each contributing file", async () => {
		const input = await withSource(COMPONENT);
		const seen: Array<string> = [];

		await buildLabels({ input, onFile: (file) => seen.push(file) });

		expect(seen).toHaveLength(1);
		expect(seen[0]).toContain("component.tsx");
	});
});
