/**
 * Setup file for Bun tests
 * This file is automatically loaded by Bun before running tests
 */

// Global setup for Bun tests
// console.log('Setting up Bun test environment...'); // Removed unused log

// Fix for missing mock functions
import { mock, type Mock } from 'bun:test';

// Define interfaces for the mock functions we are adding
interface ExtendedMock {
    fn: () => any;
    spy: (obj: any, method: string) => any;
}

// Augment the Bun Mock type to include our methods
declare module "bun:test" {
    interface Mock<T extends (...args: any[]) => any> extends ExtendedMock {}
}

// Add missing mock functions
// Ensure mock exists and is an object before attempting to assign properties
if (typeof mock === 'object' && mock !== null) {
    if (!('fn' in mock)) {
        (mock as any).fn = () => {
            const mockFn = function(...args: any[]) {
                mockFn.mock.calls.push(args);
                return mockFn.mock.implementation ? mockFn.mock.implementation(...args) : undefined;
            };
            
            mockFn.mock = {
                calls: [] as any[][],
                implementation: null as any,
                results: [] as any[],
            };
            
            mockFn.mockImplementation = (impl: (...args: any[]) => any) => {
                mockFn.mock.implementation = impl;
                return mockFn;
            };
            
            mockFn.mockReset = () => {
                mockFn.mock.calls = [];
                mockFn.mock.results = [];
                return mockFn;
            };
            
            mockFn.mockClear = mockFn.mockReset;
            
            return mockFn;
        };
    }

    if (!('spy' in mock)) {
        (mock as any).spy = (obj: any, method: string) => {
            const original = obj[method];
            const mockFunction = (mock as any).fn();
            
            obj[method] = (...args: any[]) => {
                mockFunction(...args);
                return original.apply(obj, args);
            };
            
            return mockFunction;
        };
    }
}

// Explicitly export to suppress warning
export {}; 