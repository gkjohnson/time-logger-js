# time-logger

[![npm version](https://badge.fury.io/js/time-logger.svg)](https://www.npmjs.com/package/time-logger)

Utility library for tracking min / max / average evaluation time and tallying number of calls to code a code block in javascript. A more robust version of `console.time` and `console.timeEnd`.

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

## API
### getTime()

Returns the current time with highest precision method available (described below).

### begin(key)

Marks the beginning of the code block to track. A warning is printed and no changes are made if the provided key is already being tracked.

#### key : String

The identifier to use for the given code block.

### end(key)

Marks the end of the block of code to track timing and tallies for. A warning is printed if a corresponding `begin` call has not been made.

#### key : String

The identifier of the code block to end.

### clear(key = null)

Clears both pending and cached information for the provided key so timing can be started fresh.

#### key : String

The identifier to clear tracked information for. If null then all tracked and pending data is cleared.

### dump(key = null, clear = false)

Prints out information associated with provided key in the following format:

```
timing-label         calls: 2        avg: 1532.5ms                  min: 1416ms                    max: 1649ms
```

#### key : String

The identifier to print the information for. If null then all information and pending data is cleared.

#### clear : Boolean

Whether or not to call "clear" on the key after printing.

### getMarkData(key, createCopy = true) : Object

Returns the data associated with the provided key in the form of an object:

```js
{

    // the average time spent evaluating the code block
    avg: number,

    // the minimum and maximum amount of time
    min: number,
    max: number,

    // the number of times a code block was executed
    tally: number,

}
```

#### key : String

The identifier to get the associated data for.

#### createCopy : Boolean

Whether or not to create a _new_ object with the timing and tally data. If `false` then it is expected that this object is _not_ modified because it is used internally.

### getAllMarkData(createCopy = true) : Object

Returns all available timing data in object form.

#### createCopy

See `getMarkData`.

### getPendingMarks() : Array

Returns

## Precision

The most precise timing measurements available are used depending on the platform. In browsers, `performance.now()` is used to get timing data, in Node `process.hrtime()` is used, and in Arangodb's Foxx `require('internal').time` is used.

When a precision timing function is unavailable, `Date.now()` is used, which gives coarse, millisecond precision.
