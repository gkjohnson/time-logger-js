(exports => {
    /* Get Time Function */
    let getTime = null

    // Browser
    if (getTime === null && typeof performance !== 'undefined' && performance.now) {
        getTime = () => performance.now()

        console.log('Using "performance.now" for timing')
    }
    
    // Node.js
    // https://stackoverflow.com/questions/23003252/window-performance-now-equivalent-in-nodejs
    if (getTime === null && typeof process !== 'undefined' && process.hrtime) {
        const startTime = process.hrtime()
        getTime = () => {
            const delta = process.hrtime(startTime)
            return delta[0] * 1e3 + delta[1] * 1e-6
        }

        console.log('Using "process.hrtime" for timing')
    } 

    // ArangoDB Foxx
    if (getTime === null && typeof require !== 'undefined') {
        try {
            // Using try catch in case the internal package
            // is made unavailable
            // internal.time() returns seconds since
            // epoch with microsecond timing
            const internal = require('internal')
            const getTimeNow = () => internal.time * 1000 // ms
            const startTime = getTimeNow()
            getTime = () => getTimeNow() - startTime
            
            console.log(`Using "require('internal').time" for timing`)
        } catch (e) {}
    }

    // Fallback to Date.now()
    if (getTime === null) {
        const startTime = Date.now()
        getTime = () => Date.now() - startTime

        console.warn('Precise timing not available, falling back to millisecond precision with "Date.now()"')
    }

    /* Utilities */
    const pad = (str, width) => str.length < width ? pad(str + ' ', width) : str

    /* Public API */
    const marks = {}
    const pendingMarks = {}

    // Begins a timing mark
    exports.start = function(str) {
        pendingMarks[str] = getTime()
    }

    // Ends a timing mark
    exports.end = function(str) {
        if (!(str in pendingMarks)) return

        const delta = getTime() - pendingMarks[str]
        const details = 
            marks[str] || {
                avg: 0,
                min: delta,
                max: delta,
                tally: 0
            }

        details.tally++
        details.avg += (delta - details.avg) / details.tally
        details.min = Math.min(details.min, delta)
        details.max = Math.max(details.max, delta)
        marks[str] = details

        delete pendingMarks[str]
    }

    // Clears out all accumulated timing
    exports.clear = function(str = null) {
        if (str != null) {
            if (str in marks)           delete marks[str]
            if (str in pendingMarks)    delete pendingMarks[str]
        } else {
            for (let key in marks) this.clear(key)
            for (let key in pendingMarks) this.clear(key)
        }
    }

    // Prints out all the logs for the given timing
    exports.dump = function(str = null) {
        if (str != null) {
            if (str in marks) {
                const details = marks[str]
                this.log(details)
            }
        } else {
            for (let key in marks) this.dump(key)
        }
    }

    // Overridable Log function
    exports.log = details => {
        console.log(
            pad(str, 20),
            pad(`calls: ${det.tally}`, 15),
            pad(`avg: ${det.avg}ms`, 30),
            pad(`min: ${det.min}ms`, 30),
            pad(`max: ${det.max}ms`, 30))
    }

})(typeof window !== 'undefined' ? window.PerfProfiler = {} : module.exports = {})