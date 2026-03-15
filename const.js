import { count } from "./commands/count.js";
import { csvToJson } from "./commands/csv-to-json.js";
import { decrypt } from "./commands/decrypt.js";
import { encrypt } from "./commands/encrypt.js";
import { jsonToCsv } from "./commands/json-to-csv.js";
import { ls, up } from "./navigation.js";
import { cd } from "./navigation.js";

export const COMMANDS = {
  up: up,
  cd: cd,
  ls: ls,
 "csv-to-json": csvToJson,
  "json-to-csv": jsonToCsv,
  encrypt: encrypt,
  decrypt: decrypt,
  count: count,
   /* hash: "hash",
  [hash - compare]: "hash-compare",
  [log - stats]: "log-stats", */
};
