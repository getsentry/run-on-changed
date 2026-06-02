import { describe, expect, it } from "vitest";

import { collectImpactedFiles } from "./impacted.js";
import { DependentsGraph } from "./types.js";

describe(collectImpactedFiles, () => {
	it("includes a changed file when it has no dependents", () => {
		const dependents: DependentsGraph = new Map([["/a.ts", new Set()]]);

		const impacted = collectImpactedFiles(["/a.ts"], dependents);

		expect(impacted).toEqual(new Set(["/a.ts"]));
	});

	it("collects transitive dependents when files form a chain", () => {
		const dependents: DependentsGraph = new Map([
			["/a.ts", new Set(["/b.ts"])],
			["/b.ts", new Set(["/c.ts"])],
			["/c.ts", new Set()],
		]);

		const impacted = collectImpactedFiles(["/a.ts"], dependents);

		expect(impacted).toEqual(new Set(["/a.ts", "/b.ts", "/c.ts"]));
	});

	it("collects each dependent once when files form a diamond", () => {
		const dependents: DependentsGraph = new Map([
			["/a.ts", new Set(["/b.ts", "/c.ts"])],
			["/b.ts", new Set(["/d.ts"])],
			["/c.ts", new Set(["/d.ts"])],
			["/d.ts", new Set()],
		]);

		const impacted = collectImpactedFiles(["/a.ts"], dependents);

		expect(impacted).toEqual(new Set(["/a.ts", "/b.ts", "/c.ts", "/d.ts"]));
	});

	it("terminates when dependents form a cycle", () => {
		const dependents: DependentsGraph = new Map([
			["/a.ts", new Set(["/b.ts"])],
			["/b.ts", new Set(["/a.ts"])],
		]);

		const impacted = collectImpactedFiles(["/a.ts"], dependents);

		expect(impacted).toEqual(new Set(["/a.ts", "/b.ts"]));
	});
});
