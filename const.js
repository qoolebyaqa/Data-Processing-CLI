import { ls, up } from "./navigation.js";
import { cd } from "./navigation.js";

export const COMMANDS = {
  up: up,
  cd: cd,
  ls: ls,
  /* [csv - to - json]: "csv-to-json",
  [json - to - csv]: "json-to-csv",
  count: "count",
  hash: "hash",
  [hash - compare]: "hash-compare",
  encrypt: "encrypt",
  decrypt: "decrypt",
  [log - stats]: "log-stats", */
};
