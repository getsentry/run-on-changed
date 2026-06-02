#!/usr/bin/env node
import { parseArguments } from "./arguments.js";
import { runOnChanged } from "./runOnChanged.js";

async function main(): Promise<void> {
	const settings = parseArguments(process.argv.slice(2));
	process.exitCode = await runOnChanged(settings);
}

main().catch((error: unknown) => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
