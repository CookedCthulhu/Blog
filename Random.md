Random
| Method  | n      | Mean       | Error   | StdDev  | Ratio |
|-------- |------- |-----------:|--------:|--------:|------:|
| Scalar  | 262144 | 2,133.8 us | 1.43 us | 1.27 us |  1.00 |
| Vector  | 262144 | 1,056.0 us | 0.21 us | 0.18 us |  0.49 |
| Bitonic | 262144 |   412.3 us | 0.35 us | 0.29 us |  0.19 |

Same Input
| Method  | n      | Mean       | Error   | StdDev  | Ratio |
|-------- |------- |-----------:|--------:|--------:|------:|
| Scalar  | 262144 | 1,148.3 us | 0.58 us | 0.51 us |  1.00 |
| Vector  | 262144 | 1,046.6 us | 0.30 us | 0.26 us |  0.91 |
| Bitonic | 262144 |   403.4 us | 0.17 us | 0.16 us |  0.35 |

Tiny
| Method  | n      | Mean      | Error    | StdDev   | Ratio |
|-------- |------- |----------:|---------:|---------:|------:|
| Scalar  | 262144 | 396.28 us | 0.561 us | 0.497 us |  1.00 |
| Vector  | 262144 | 144.36 us | 0.048 us | 0.043 us |  0.36 |
| Bitonic | 262144 | 148.09 us | 0.044 us | 0.041 us |  0.37 |
| Binary  | 262144 |  19.03 us | 0.036 us | 0.032 us |  0.05 |

Alternating Stairs
| Method  | n      | Mean       | Error   | StdDev  | Ratio |
|-------- |------- |-----------:|--------:|--------:|------:|
| Scalar  | 262144 | 1,217.7 us | 0.19 us | 0.18 us |  1.00 |
| Vector  | 262144 | 1,015.7 us | 0.32 us | 0.28 us |  0.83 |
| Bitonic | 262144 |   393.3 us | 0.08 us | 0.07 us |  0.32 |

Concatenated
| Method         | n      | Mean       | Error   | StdDev  | Ratio |
|--------------- |------- |-----------:|--------:|--------:|------:|
| Scalar         | 262144 |   353.7 us | 0.07 us | 0.07 us |  1.00 |
| Vector         | 262144 |   202.2 us | 0.04 us | 0.03 us |  0.57 |
| VectorReversed | 262144 | 1,100.8 us | 0.17 us | 0.15 us |  3.11 |
| Bitonic        | 262144 |   267.9 us | 0.13 us | 0.13 us |  0.76 |

