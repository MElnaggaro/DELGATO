# Use cases

Pure orchestration over repositories. A use case is a single exported async
function that:

1. Accepts the minimum input it needs.
2. Calls one or more repositories through the DI container.
3. Returns a domain value or throws a `DomainError` subtype.

Use cases **never** import from `react`, `expo*`, or `@/infrastructure/*`
directly — they receive the container as a parameter or read from a
container reference. They are unit-testable in pure Node.

Layout (added per feature phase):

```
use-cases/
  order/
    placeOrder.ts            # Phase 2
    acceptOrder.ts           # Phase 7
    rejectOrder.ts
    ...
  role/
    switchRole.ts            # Phase 1
    resolveStartupRoute.ts   # Phase 1
  product/
    upsertProduct.ts         # Phase 6
    setProductStock.ts
    ...
  ...
```

Phase 0 ships this folder empty; per-feature use cases land with their phase.
