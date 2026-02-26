# src - Clean Architecture Base

## Layers
- `modules/*/domain`: entities + repository interfaces
- `modules/*/application`: use-cases + DTO
- `modules/*/infrastructure`: API adapters + transport schemas
- `modules/*/presentation`: hooks + UI components + view models
- `shared/*`: cross-module primitives and clients

## Rule
Dependency direction is always:
`presentation -> application -> domain`
`infrastructure` implements `domain/application` contracts.
