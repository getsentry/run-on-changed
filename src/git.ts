import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { RunOnChangedSettings } from "./types.js";

const execFileAsync = promisify(execFile);

const jsTsExtensions = new Set([
	".cjs",
	".cts",
	".js",
	".jsx",
	".mjs",
	".mts",
	".ts",
	".tsx",
]);

export async function getChangedFiles(
	settings: RunOnChangedSettings,
): Promise<string[]> {
	const { cwd, since } = settings;

	const relativePaths = since
		? await git(cwd, ["diff", "--name-only", "--diff-filter=d", since])
		: [
				...(await git(cwd, ["diff", "--name-only", "--diff-filter=d", "HEAD"])),
				...(await git(cwd, ["ls-files", "--others", "--exclude-standard"])),
			];

	return [...new Set(relativePaths)]
		.filter(isJsTsFile)
		.map((relativePath) => path.resolve(cwd, relativePath));
}

export function isJsTsFile(filePath: string): boolean {
	return jsTsExtensions.has(path.extname(filePath));
}

async function git(cwd: string, args: string[]): Promise<string[]> {
	const { stdout } = await execFileAsync("git", args, { cwd });

	return stdout.split("\n").filter(Boolean);
}
