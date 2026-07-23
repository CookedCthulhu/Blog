import { Table } from "../../lib-agnostic/table";
import type { Timing } from "./timing";

export namespace BitonicMerge {
    export const sorted_randomIntegers: Table.Updatable<Timing> = {
        rows: [
            { name: 'Sorted', count: 100000, mean: 6938.9, error: 76.12, stdDev: 71.21, ratio: 1.00, timeUnit: 'us' },
            { name: 'Scalar', count: 100000, mean:  992.1, error: 12.22, stdDev: 11.43, ratio: 0.14, timeUnit: 'us' },
        ],
        headline: 'Random Integers',
    };

    export const vector_randomIntegers_net7: Table.Updatable<Timing> = {
        rows: [
            { name: 'Scalar', count: 262144, mean: 2588.8, error: 4.40, stdDev: 3.90, ratio: 1.00, timeUnit: 'us' },
            { name: 'Vector', count: 262144, mean:  992.1, error: 4.40, stdDev: 3.90, ratio: 0.41, timeUnit: 'us' },
        ],
        headline: 'Random Integers, .NET 7',
    };

    export const vector_randomIntegers_net8: Table.Updatable<Timing> = {
        rows: [
            { name: 'Scalar', count: 262144, mean: 2133.8, error: 1.43, stdDev: 1.27, ratio: 1.00, timeUnit: 'us' },
            { name: 'Vector', count: 262144, mean: 1056.0, error: 0.21, stdDev: 0.18, ratio: 0.49, timeUnit: 'us' },
        ],
        headline: 'Random Integers, .NET 8',
    };

    export const vector_lastOfA_isLessThan_firstOfB_net7: Table.Updatable<Timing> = {
        rows: [
            { name: 'Scalar', count: 262144, mean: 714.5, error: 2.11, stdDev: 1.88, ratio: 1.00, timeUnit: 'us' },
            { name: 'Vector', count: 262144, mean: 148.4, error: 0.15, stdDev: 0.13, ratio: 0.21, timeUnit: 'us' },
            { name: 'Vector (Inputs Swapped)', count: 262144, mean: 1046.7, error: 2.52, stdDev: 2.36, ratio: 1.47, timeUnit: 'us' },
        ],
        headline: 'Concatenated (all of A less than all of B), .NET 7',
    };

    export const vector_lastOfA_isLessThan_firstOfB_net8: Table.Updatable<Timing> = {
        rows: [
            { name: 'Scalar', count: 262144, mean: 714.5, error: 2.11, stdDev: 1.88, ratio: 1.00, timeUnit: 'us' },
            { name: 'Vector', count: 262144, mean: 148.4, error: 0.15, stdDev: 0.13, ratio: 0.21, timeUnit: 'us' },
            { name: 'Vector (Inputs Swapped)', count: 262144, mean: 1046.7, error: 2.52, stdDev: 2.36, ratio: 1.47, timeUnit: 'us' },
        ],
        headline: 'Concatenated (all of A less than all of B), .NET 8',
    };

    export const final_randomIntegers: Table.Updatable<Timing> = {
        rows: [
            { name: 'Scalar',       count: 262144, mean: 2133.8, error: 1.43, stdDev: 1.27, ratio: 1.00, timeUnit: 'us' },
            { name: 'Vector',       count: 262144, mean: 1056.0, error: 0.21, stdDev: 0.18, ratio: 0.49, timeUnit: 'us' },
            { name: 'Bitonic 128',  count: 262144, mean:  412.3, error: 0.35, stdDev: 0.29, ratio: 0.19, timeUnit: 'us' },
            { name: 'Bitonic 256',  count: 262144, mean:  240.7, error: 0.05, stdDev: 0.04, ratio: 0.11, timeUnit: 'us' },
        ],
        headline: 'Random Integers',
    };

    export const final_stairSteps: Table.Updatable<Timing> = {
        rows: [
            { name: 'Scalar',       count: 262144, mean: 1217.7, error: 0.19, stdDev: 0.18, ratio: 1.00, timeUnit: 'us' },
            { name: 'Vector',       count: 262144, mean: 1015.7, error: 0.32, stdDev: 0.28, ratio: 0.83, timeUnit: 'us' },
            { name: 'Bitonic 128',  count: 262144, mean:  393.3, error: 0.08, stdDev: 0.07, ratio: 0.32, timeUnit: 'us' },
            { name: 'Bitonic 256',  count: 262144, mean:  234.0, error: 0.04, stdDev: 0.03, ratio: 0.19, timeUnit: 'us' },
        ],
        headline: 'Stair steps',
    };
}