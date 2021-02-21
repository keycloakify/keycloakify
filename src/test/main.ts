
import { setupSampleReactProject } from "./setupSampleReactProject";

const { sampleReactProjectDirPath } = setupSampleReactProject();

process.chdir(sampleReactProjectDirPath);

console.log(`Running main in ${sampleReactProjectDirPath}`);

import("../bin/main");

