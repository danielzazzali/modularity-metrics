import { config } from "../../src/config/config.js";
import { beforeEach, describe, expect, test } from '@jest/globals';

describe("Config Singleton", () => {
    beforeEach(() => {
        // Reset private properties before each test
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

    test("Should default codePath to process.cwd() when set to a falsy value", () => {
        config.codePath = ""; // Empty string considered falsy
        expect(config.codePath).toBe(process.cwd());

        config.codePath = null;
        expect(config.codePath).toBe(process.cwd());

        config.codePath = undefined;
        expect(config.codePath).toBe(process.cwd());
    });

    test("Should default customMetricsPath to null when set to a falsy value", () => {
        config.customMetricsPath = "";
        expect(config.customMetricsPath).toBe(null);

        config.customMetricsPath = undefined;
        expect(config.customMetricsPath).toBe(null);

        config.customMetricsPath = null;
        expect(config.customMetricsPath).toBe(null);
    });

    test("Should default useDefaultMetrics to true when not explicitly set", () => {
        // When not explicitly set, the value should evaluate to true
        config.useDefaultMetrics = undefined;
        expect(config.useDefaultMetrics).toBe(true);
    });

    test("useDefaultMetrics setter should treat any value except false as true", () => {
        config.useDefaultMetrics = "any non-false value";
        expect(config.useDefaultMetrics).toBe(true);

        config.useDefaultMetrics = 0; // 0 is falsy in JS but not strictly false
        // Since 0 !== false, it is expected to be true
        expect(config.useDefaultMetrics).toBe(true);
    });

    test("Setting useDefaultMetrics explicitly to false should work", () => {
        config.useDefaultMetrics = false;
        expect(config.useDefaultMetrics).toBe(false);
    });
});
