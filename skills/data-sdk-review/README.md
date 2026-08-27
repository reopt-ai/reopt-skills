# data-sdk-review

Audit an existing reopt Data SDK integration without changing it. Findings cover package versions, runtime and credential boundaries, Next.js bootstrap/proxy behavior, identity, consent, delivery, and devtool exposure.

## Use when

- checking an existing analytics integration before release
- investigating missing, duplicate, or misattributed events
- validating multi-tenant, consent, server, or delayed-conversion flows
