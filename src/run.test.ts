import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";

import { runCommand } from "./run.js";

vi.mock("node:child_process", () => ({ spawn: vi.fn() }));

function mockChild() {
	const child = new EventEmitter();
	vi.mocked(spawn).mockReturnValue(child as never);
	return child;
}

describe(runCommand, () => {
	it("spawns the command with inherited stdio", async () => {
		const child = mockChild();
		const promise = runCommand("eslint", ["a.ts"]);
		child.emit("close", 0);

		await promise;

		expect(spawn).toHaveBeenCalledWith("eslint", ["a.ts"], {
			stdio: "inherit",
		});
	});

	it("resolves with the exit code when the child closes", async () => {
		const child = mockChild();
		const promise = runCommand("eslint", []);
		child.emit("close", 2);

		expect(await promise).toBe(2);
	});

	it("rejects when the child emits an error", async () => {
		const child = mockChild();
		const promise = runCommand("eslint", []);
		const error = new Error("spawn failed");
		child.emit("error", error);

		await expect(promise).rejects.toBe(error);
	});
});
