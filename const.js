import { csvToJson } from "./commands/csv-to-json.js";
import { jsonToCsv } from "./commands/json-to-csv.js";
import { ls, up } from "./navigation.js";
import { cd } from "./navigation.js";

export const COMMANDS = {
  up: up,
  cd: cd,
  ls: ls,
 "csv-to-json": csvToJson,
  "json-to-csv": jsonToCsv,
  /* count: "count",
  hash: "hash",
  [hash - compare]: "hash-compare",
  encrypt: "encrypt",
  decrypt: "decrypt",
  [log - stats]: "log-stats", */
};
