import readline from "readline";
import { COMMANDS } from "./const.js";

const App = async () => {
  console.log("Welcome to Data Processing CLI!");
  console.log("You are currently in", process.cwd());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (input) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    if(command === ".exit") {
      hanldExit(rl);
    } else if (COMMANDS[command]) {
      COMMANDS[command](rl, args);
      console.log("You are currently in", process.cwd());
      rl.prompt();
    } else {
      console.log(`\nInvalid input`);
      rl.prompt();
    }
  });

  rl.on("SIGINT", () => hanldExit(rl));
};

await App();

function hanldExit(rl) {
  console.log("\nThank you for using Data Processing CLI!");
  rl.close();
}
