import { describe, it, expect } from '@jest/globals';
import { kahnSort } from '../../src/sorting/kahnSort.js';

// Example plugin-like metrics matching the structure
const basePlugin = {
    name: "Plugin A",
    description: "Test plugin A",
    result: {},
    id: 'plugin-A',
    dependencies: []
};
const dependentPlugin = {
    name: "Plugin B",
    description: "Test plugin B depends on A",
    result: {},
    id: 'plugin-B',
    dependencies: ['plugin-A']
};
const pluginC = {
    name: "Plugin C",
    description: "Test plugin C depends on A and B",
    result: {},
    id: 'plugin-C',
    dependencies: ['plugin-A', 'plugin-B']
};

// Wrap plugin state into the expected metric object
const makeMetric = stateObj => ({ state: { id: stateObj.id, dependencies: stateObj.dependencies } });

describe('kahnSort with plugin-like metrics', () => {
    it('orders independent plugins lexicographically by id', () => {
        const metrics = [makeMetric({ id: 'plugin-B', dependencies: [] }), makeMetric({ id: 'plugin-A', dependencies: [] })];
        const sorted = kahnSort(metrics);
        expect(sorted).not.toBeNull();
        expect(sorted.map(m => m.state.id)).toEqual(['plugin-A', 'plugin-B']);
    });

    it('orders dependent plugins respecting their dependencies', () => {
        const metrics = [makeMetric(dependentPlugin), makeMetric(basePlugin)];
        const sorted = kahnSort(metrics);
        expect(sorted).not.toBeNull();
        expect(sorted.map(m => m.state.id)).toEqual(['plugin-A', 'plugin-B']);
    });

    it('handles a chain of dependencies among plugins', () => {
        const metrics = [makeMetric(pluginC), makeMetric(dependentPlugin), makeMetric(basePlugin)];
        const sorted = kahnSort(metrics);
        expect(sorted).not.toBeNull();
        expect(sorted.map(m => m.state.id)).toEqual(['plugin-A', 'plugin-B', 'plugin-C']);
    });

    it('returns null if there is a cycle among plugins', () => {
        const cycleA = { ...basePlugin, id: 'cycle-A', dependencies: ['cycle-C'] };
        const cycleB = { ...dependentPlugin, id: 'cycle-B', dependencies: ['cycle-A'] };
        const cycleC = { ...pluginC, id: 'cycle-C', dependencies: ['cycle-B'] };
        const metrics = [makeMetric(cycleA), makeMetric(cycleB), makeMetric(cycleC)];
        expect(kahnSort(metrics)).toBeNull();
    });

    it('throws on duplicate plugin ids', () => {
        const dup1 = { ...basePlugin, id: 'dup' };
        const dup2 = { ...dependentPlugin, id: 'dup' };
        const metrics = [makeMetric(dup1), makeMetric(dup2)];
        expect(() => kahnSort(metrics)).toThrow(/Duplicate metric ID detected/);
    });
});
