import { assert } from "evt/tools/typeSafety";
import * as inDepth from "evt/tools/inDepth";
import { myObject } from "..";

assert(inDepth.same(myObject, { "p": "FOO" }));

console.log("PASS");
