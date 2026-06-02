import { describe, expect, it, vi } from "vitest";

import { runOnChanged } from "./runOnChanged.js";
import { RunOnChangedDependencies } from "./types.js";

const settings = { command: ["eslint", "--fix"], cwd: "/project" };

function stubDependencies(
	overrides: Partial<RunOnChangedDependencies>,
): Partial<RunOnChangedDependencies> {
	return {
		enumerateProjectFiles: vi.fn().mockResolvedValue([]),
		getChangedFiles: vi.fn().mockResolvedValue([]),
		parseFileSpecifiers: vi
			.fn()
			.mockImplementation((filePath: string) =>
				Promise.resolve({ filePath, specifiers: [] }),
			),
		resolveSpecifier: vi.fn().mockReturnValue(undefined),
		runCommand: vi.fn().mockResolvedValue(0),
		...overrides,
	};
}

describe(runOnChanged, () => {
	it("skips running when there are no changed files", async () => {
		vi.spyOn(console, "log").mockImplementation(() => undefined);
		const runCommand = vi.fn().mockResolvedValue(0);
		const dependencies = stubDependencies({ runCommand });

		const code = await runOnChanged(settings, dependencies);

		expect(runCommand).not.toHaveBeenCalled();
		expect(code).toBe(0);
	});

	it("runs the command with only the changed file when it has no dependents", async () => {
		const runCommand = vi.fn().mockResolvedValue(0);
		const dependencies = stubDependencies({
			enumerateProjectFiles: vi.fn().mockResolvedValue(["/project/a.ts"]),
			getChangedFiles: vi.fn().mockResolvedValue(["/project/a.ts"]),
			runCommand,
		});

		const code = await runOnChanged(settings, dependencies);

		expect(runCommand).toHaveBeenCalledWith("eslint", [
			"--fix",
			"/project/a.ts",
		]);
		expect(code).toBe(0);
	});

	it("runs the command with changed files and their sorted dependents", async () => {
		const runCommand = vi.fn().mockResolvedValue(0);
		const dependencies = stubDependencies({
			enumerateProjectFiles: vi
				.fn()
				.mockResolvedValue(["/project/a.ts", "/project/b.ts"]),
			getChangedFiles: vi.fn().mockResolvedValue(["/project/a.ts"]),
			parseFileSpecifiers: vi.fn().mockImplementation((filePath: string) =>
				Promise.resolve({
					filePath,
					specifiers: filePath.endsWith("b.ts") ? ["./a.js"] : [],
				}),
			),
			resolveSpecifier: vi.fn().mockReturnValue("/project/a.ts"),
			runCommand,
		});

		const code = await runOnChanged(settings, dependencies);

		expect(runCommand).toHaveBeenCalledWith("eslint", [
			"--fix",
			"/project/a.ts",
			"/project/b.ts",
		]);
		expect(code).toBe(0);
	});

	it("returns the command exit code when it runs", async () => {
		const dependencies = stubDependencies({
			enumerateProjectFiles: vi.fn().mockResolvedValue(["/project/a.ts"]),
			getChangedFiles: vi.fn().mockResolvedValue(["/project/a.ts"]),
			runCommand: vi.fn().mockResolvedValue(3),
		});

		const code = await runOnChanged(settings, dependencies);

		expect(code).toBe(3);
	});
});
