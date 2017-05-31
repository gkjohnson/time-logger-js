(function(exp) {

    const isBrowser = typeof window !== 'undefined'

    /* Utilities */    
    // https://stackoverflow.com/questions/23003252/window-performance-now-equivalent-in-nodejs
    let getTime = null
    if (isBrowser) {
        getTime = () => performance.now()
    } else {
        const startTime = process.hrtime()
        getTime = () => {
            const delta = process.hrtime(startTime)
            return delta[0] * 1000 + delta[1] / 1000000
        }
    }

    const pad = (str, width) => str.length < width ? pad(str + ' ', width) : str

    /* Public API */
    const marks = {}
    const pendingMarks = {}

    // Begins a timing mark
    exp.start = function(str) {
        pendingMarks[str] = getTime()
    }

    // Ends a timing mark
    exp.end = function(str) {
        if (!(str in pendingMarks)) return

        const delta = getTime() - pendingMarks[str]
        const det = 
            marks[str] || {
                avg: 0,
                min: delta,
                max: delta,
                tally: 0
            }

        det.tally++
        det.avg += (delta - det.avg) / det.tally
        det.min = Math.min(det.min, delta)
        det.max = Math.max(det.max, delta)
        marks[str] = det

        delete pendingMarks[str]
    }

    // Clears out all accumulated timing
    exp.clear = function(str) {
        if (str != null) {
            if (str in marks)           delete marks[str]
            if (str in pendingMarks)    delete pendingMarks[str]
        } else {
            for (let key in marks) this.clear(key)
            for (let key in pendingMarks) this.clear(key)
        }
    }

    // Prints out all the logs for the given timing
    exp.dump = function(str) {
        if (str != null) {
            if (str in marks) {
                const det = marks[str]
                console.log(
                    pad(str, 20),
                    pad(`calls: ${det.tally}`, 15),
                    pad(`avg: ${det.avg}ms`, 30),
                    pad(`min: ${det.min}ms`, 30),
                    pad(`max: ${det.max}ms`, 30))
            }
        } else {
            for (let key in marks) this.dump(key)
        }
    }

})(typeof window !== 'undefined' ? window.PerfProfiler = {} : module.exports = {})