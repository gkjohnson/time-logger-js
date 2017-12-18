# time-logger

[![npm version](https://badge.fury.io/js/time-logger.svg)](https://www.npmjs.com/package/time-logger)

Utility library for tracking and tallying function calls in javascript

## Use
```javascript
// in node
const TimeLogger = require('time-logger')

TimeLogger.start('timing-label')
// ... code that needs to be profiled
TimeLogger.end('timing-label')
TimeLogger.dump('timing-label')
TimeLogger.clear('timing-label')
```

The above will print out the average, min, max, and call count of the code wrapped by `timing-label` in the following format:

```
timing-label         calls: 2        avg: 1532.5ms                  min: 1416ms                    max: 1649ms
```

Calling `dump()` and `clear()` with no arguments will print and clear _all_ accumulated timing metrics

### Custom Logging
```javascript
// override the log function
TimeLogger.log = (key, details) => console.log(key, details)

// log function gets called with data to dump
TimeLogger.dump('time-label')
```

A custom logging function can be added to transform or conditionally log the dumped timing data. The `avg`, `tally`, `min`, and `max` are available in the details object.

## Precision

The most precise timing measurements available are used depending on the platform. In browsers, `performance.now()` is used to get timing data, in Node `process.hrtime()` is used, and in Arangodb's Foxx `require('internal').time` is used.

When a precision timing function is unavailable, `Date.now()` is used, which gives coarse, millisecond precision.
