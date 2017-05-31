# perf-profiler
Utility library for tracking and tallying function calls in javascript

### Use
```javascript
// in node
const PerfProfiler = require('perf-profiler')

PerfProfiler.start('timing-label')
// ... thing that need to be profiled
PerfProfiler.end('timing-label')
PerfProfiler.dump('timing-label')
PerfProfiler.clear('timing-label')
```

The above will print out the average, min, max, and call count of the code wrapped by `timing-label`

Calling `dump()` and `clear()` with no arguments will print and clear _all_ accumulated timing
