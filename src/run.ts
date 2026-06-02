import { spawn } from "node:child_process";

export async function runCommand(
	command: string,
	args: string[],
): Promise<number> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { stdio: "inherit" });

		child.on("error", reject);
		child.on("close", (code) => {
			resolve(code ?? 0);
		});
	});
}
