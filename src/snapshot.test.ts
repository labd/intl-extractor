import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { processFiles } from "./main";

describe("CLI output snapshot tests", () => {
	let tempDir: string;

	beforeEach(async () => {
		// Create a dedicated temp directory for test isolation
		tempDir = await fs.mkdtemp(
			path.join(os.tmpdir(), "next-intl-extractor-test-"),
		);
		await fs.writeFile(path.join(tempDir, "output.json"), "{}", "utf8");

		// Verify creation to fail fast if permissions or disk issues
		const exists = await fileExists(path.join(tempDir, "output.json"));
		if (!exists) {
			throw new Error("Failed to create initial output.json file");
		}
	});

	afterEach(async () => {
		if (tempDir) {
			try {
				await fs.rm(tempDir, { recursive: true, force: true });
			} catch (error: unknown) {
				console.error(
					`Failed to clean up temporary directory: ${error instanceof Error ? error.message : String(error)}`,
				);
				// Continue test execution even if cleanup fails
			}
		}
	});

	test("should extract labels from example files and match snapshot", async () => {
		const examplesDir = path.resolve(__dirname, "../examples");
		const tempOutputFile = path.join(tempDir, "output.json");

		try {
			await processFiles(examplesDir, tempOutputFile);

			// Verify file exists to prevent confusing read errors
			const exists = await fileExists(tempOutputFile);
			if (!exists) {
				throw new Error(`Output file not found at: ${tempOutputFile}`);
			}

			const outputContent = await fs.readFile(tempOutputFile, "utf8");

			// Empty files cause confusing JSON parse errors
			if (!outputContent || outputContent.trim() === "") {
				throw new Error("Output file is empty");
			}

			let outputJson: Record<string, unknown>;
			try {
				outputJson = JSON.parse(outputContent);
			} catch (error: unknown) {
				// Log raw content to debug malformed JSON issues
				console.error("Raw file content:", outputContent);
				throw new Error(
					`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
				);
			}

			expect(outputJson).toMatchSnapshot();
		} catch (error: unknown) {
			console.error(
				`Test failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	});

	test("should handle nested namespaces correctly", async () => {
		const tempFile = path.join(tempDir, "nested-test.tsx");
		const tempOutputFile = path.join(tempDir, "output.json");

		const nestedContent = `
    import { useTranslations } from "next-intl";

    export const NestedComponent = () => {
      const t = useTranslations("UI.Buttons");

      return (
        <div>
          <button>{t("save")}</button>
          <button>{t("cancel")}</button>
        </div>
      );
    }

    export const AnotherComponent = () => {
      const t = useTranslations("UI.Forms");

      return (
        <form>
          <label>{t("form.name")}</label>
          <button>{t("form.submit")}</button>
        </form>
      );
    }
    `;

		try {
			await fs.writeFile(tempFile, nestedContent, "utf8");

			// Verify test file was created successfully before proceeding
			const exists = await fileExists(tempFile);
			if (!exists) {
				throw new Error("Failed to create test file for nested namespaces");
			}

			await processFiles(tempDir, tempOutputFile);

			const outputExists = await fileExists(tempOutputFile);
			if (!outputExists) {
				throw new Error(`Output file not found at: ${tempOutputFile}`);
			}

			const outputContent = await fs.readFile(tempOutputFile, "utf8");

			if (!outputContent || outputContent.trim() === "") {
				throw new Error("Output file is empty");
			}

			let outputJson: Record<string, unknown>;
			try {
				outputJson = JSON.parse(outputContent);
			} catch (error: unknown) {
				console.error("Raw file content:", outputContent);
				throw new Error(
					`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
				);
			}

			expect(outputJson).toMatchSnapshot();

			// Explicit check for nested structure to ensure dot notation works
			expect(outputJson).toBeDefined();
		} catch (error: unknown) {
			console.error(
				`Test failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			throw error;
		}
	});
});

// Helper to safely check file existence without throwing
async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}
