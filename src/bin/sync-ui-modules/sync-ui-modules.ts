import type { BuildContext } from "./shared/buildContext";
import { assert, type Equals } from "tsafe/assert";
import { id } from "tsafe/id";
import { is } from "tsafe/is";
import { z } from "zod";
import { join as pathJoin } from "path";
import { existsAsync } from "./tools/fs.existsAsync";

import * as fsPr from "fs/promises";

export async function command(params: { buildContext: BuildContext }) {
    const { buildContext } = params;
}
