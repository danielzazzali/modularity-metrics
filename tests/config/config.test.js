import { config } from "../../src/config/config.js";
import { beforeEach, describe, expect, test } from '@jest/globals';

describe("Config Singleton", () => {
    beforeEach(() => {
        delete config._path;
        delete config._customMetricsPath;
        delete config._useDefaultMetrics;
    });

    test("Should be a single instance", async () => {
        const module2 = await import("../../src/config/config.js");
        expect(config).toBe(module2.config);
    });

    test("Should set and get codePath correctly", () => {
        config.codePath = "/test/path";
        expect(config.codePath).toBe("/test/path");
    });

    test("Should set and get customMetricsPath correctly", () => {
        config.customMetricsPath = "/metrics/path";
        expect(config.customMetricsPath).toBe("/metrics/path");
    });

    test("Should handle useDefaultMetrics correctly", () => {
        config.useDefaultMetrics = false;
        expect(config.useDefaultMetrics).toBe(false);
        config.useDefaultMetrics = true;
        expect(config.useDefaultMetrics).toBe(true);
    });
});
