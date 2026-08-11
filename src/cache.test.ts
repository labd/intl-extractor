import { describe, expect, test } from "vitest";
import { updateLabelCache } from "./cache";

describe("cache", () => {
	test("writes output to empty cache", () => {
		const cache = {};

		updateLabelCache({
			cache,
			data: {
				Test: new Set(["hello"]),
				"Test.NestedNamespace": new Set(["foobar"]),
			},
			source: {},
		});

		expect(cache).toEqual({
			Test: {
				hello: "hello",
				NestedNamespace: {
					foobar: "foobar",
				},
			},
		});
	});

	test("writes output to existing cache", () => {
		const cache = {
			Test: {
				hello: "Test.hello",
				NestedNamespace: {
					foobar: "Test.NestedNamespace.foobar",
				},
			},
		};

		updateLabelCache({
			cache,
			data: {
				Test: new Set(["test"]),
				"Test.NestedNamespace": new Set(["test"]),
			},
			source: {},
		});

		expect(cache).toEqual({
			Test: {
				hello: "Test.hello",
				test: "test",
				NestedNamespace: {
					foobar: "Test.NestedNamespace.foobar",
					test: "test",
				},
			},
		});
	});

	test("updates labels with existing source", () => {
		const cache = {};

		updateLabelCache({
			cache,
			data: {
				Test: new Set(["hello"]),
				"Test.NestedNamespace": new Set(["foobar"]),
			},
			source: {
				Test: {
					hello: "Hello",
				},
			},
		});

		expect(cache).toEqual({
			Test: {
				hello: "Hello",
				NestedNamespace: {
					foobar: "foobar",
				},
			},
		});
	});
});

describe("cache fallback", () => {
	test("defaults to the label name", () => {
		const cache = {};

		updateLabelCache({
			cache,
			data: { Test: new Set(["hello", "nested.deep"]) },
			source: {},
		});

		expect(cache).toEqual({
			Test: { hello: "hello", nested: { deep: "deep" } },
		});
	});

	test("uses a custom fallback, receiving the full key path", () => {
		const cache = {};
		const seen: Array<Array<string>> = [];

		updateLabelCache({
			cache,
			data: { Test: new Set(["hello", "nested.deep"]) },
			source: {},
			fallback: (path) => {
				seen.push(path);
				return `[${path[path.length - 1]}]`;
			},
		});

		expect(cache).toEqual({
			Test: { hello: "[hello]", nested: { deep: "[deep]" } },
		});
		expect(seen).toEqual([
			["Test", "hello"],
			["Test", "nested", "deep"],
		]);
	});

	test("does not fall back when the source has a value", () => {
		const cache = {};

		updateLabelCache({
			cache,
			data: { Test: new Set(["hello"]) },
			source: { Test: { hello: "Hallo" } },
			fallback: () => "[unused]",
		});

		expect(cache).toEqual({ Test: { hello: "Hallo" } });
	});
});
