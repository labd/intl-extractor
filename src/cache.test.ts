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
				hello: "Test.hello",
				NestedNamespace: {
					foobar: "Test.NestedNamespace.foobar",
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
				test: "Test.test",
				NestedNamespace: {
					foobar: "Test.NestedNamespace.foobar",
					test: "Test.NestedNamespace.test",
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
					foobar: "Test.NestedNamespace.foobar",
				},
			},
		});
	});
});
