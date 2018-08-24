/* global
    describe it expect beforeEach
*/
const TimeLogger = require('../time-logger.js');

const originalConsole = { log: global.console.log, warn: global.console.warn };

describe('TimeLogger', () => {

    beforeEach(() => {

        TimeLogger.clear();
        global.console.log = originalConsole.log;
        global.console.warn = originalConsole.warn;

    });

    describe('begin / end', () => {

        it('should track time between calls', done => {

            TimeLogger.begin('label');

            setTimeout(() => {
                TimeLogger.end('label');

                const res = TimeLogger.getTimingData('label');
                expect(res.tally).toEqual(1);
                expect(Math.abs(1 - res.avg / 1000)).toBeLessThan(0.025);
                expect(res.avg).toEqual(res.max);
                expect(res.avg).toEqual(res.min);

                done();

            }, 1000);

        });

        it('should track multiple calls', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            TimeLogger.begin('label');
            TimeLogger.end('label');

            TimeLogger.begin('label');
            TimeLogger.end('label');

            const res = TimeLogger.getTimingData('label');
            expect(res.tally).toEqual(3);

        });

        it('should warn if end is called twice', () => {

            let called = 0;
            console.warn = msg => {

                called++;
                expect(/TimeLogger.end : 'end' called more than once/.test(msg)).toEqual(true);

            };

            TimeLogger.begin('label');
            TimeLogger.end('label');
            TimeLogger.end('label');

            expect(called).toEqual(1);
            expect(TimeLogger.getTimingData('label').tally).toEqual(1);

        });

        it('should warn if end is called with no begin', () => {

            let called = 0;
            console.warn = msg => {

                called++;
                expect(/TimeLogger.end : 'begin' not/.test(msg)).toEqual(true);

            };

            TimeLogger.end('label');

            expect(called).toEqual(1);

        });

        it('should warn if begom is called twice', () => {

            let called = 0;
            console.warn = msg => {

                called++;
                expect(/TimeLogger.begin : 'label' is already/.test(msg)).toEqual(true);

            };

            TimeLogger.begin('label');
            TimeLogger.begin('label');

            expect(called).toEqual(1);

        });

    });

    describe('dump', () => {

        it('should print data for the specified key', () => {

            let called = 0;
            global.console.log = (key, tally, avg, min, max) => {

                called++;
                expect(key).toBeTruthy();
                expect(tally).toBeTruthy();
                expect(avg).toBeTruthy();
                expect(min).toBeTruthy();
                expect(max).toBeTruthy();

                expect(key.trim()).toEqual('label');
                expect(/called:[\s\d]+/.test(tally.trim())).toEqual(true);
                expect(/avg:[.\s\d]+ms/.test(avg.trim())).toEqual(true);
                expect(/min:[.\s\d]+ms/.test(min.trim())).toEqual(true);
                expect(/max:[.\s\d]+ms/.test(max.trim())).toEqual(true);

            };

            TimeLogger.begin('label');
            TimeLogger.end('label');
            TimeLogger.begin('label2');
            TimeLogger.end('label2');

            TimeLogger.dump('label');

            expect(called).toEqual(1);

        });

        it('should print all data if no key is passed', () => {

            let called = 0;
            global.console.log = () => called++;

            TimeLogger.begin('label');
            TimeLogger.end('label');
            TimeLogger.begin('label2');
            TimeLogger.end('label2');

            TimeLogger.dump();

            expect(called).toEqual(2);

        });

        it('should clear data if the appropriate parameter is passed', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            TimeLogger.dump('label', true);

            expect(Object.keys(TimeLogger.getAllTimingData()).length).toEqual(0);

        });

        it('should warn that an invalid key was passed', () => {

            let called = 0;
            global.console.warn = (msg, p1, p2, p3) => {

                called++;

                expect(/TimeLogger.dump : no timing details/.test(msg)).toEqual(true);
                expect(p1).toEqual(undefined);
                expect(p2).toEqual(undefined);
                expect(p3).toEqual(undefined);

            };

            TimeLogger.dump('none');

            expect(called).toEqual(1);

        });

    });

    describe('clear', () => {

        it('should clear only the logs of the label passed to it', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            TimeLogger.begin('label2');
            TimeLogger.end('label2');

            expect(TimeLogger.getTimingData('label')).toBeTruthy();
            expect(TimeLogger.getTimingData('label2')).toBeTruthy();

            TimeLogger.clear('label');

            expect(TimeLogger.getTimingData('label')).not.toBeTruthy();
            expect(TimeLogger.getTimingData('label2')).toBeTruthy();

        });

        it('should clear all logs if nothing is passed to it', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            TimeLogger.begin('label2');
            TimeLogger.end('label2');

            expect(TimeLogger.getTimingData('label')).toBeTruthy();
            expect(TimeLogger.getTimingData('label2')).toBeTruthy();

            TimeLogger.clear();

            expect(TimeLogger.getTimingData('label')).not.toBeTruthy();
            expect(TimeLogger.getTimingData('label2')).not.toBeTruthy();

        });

    });

    describe('getTimingData', () => {

        it('should have the expected keys', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            const res = TimeLogger.getTimingData('label');
            expect(res).toHaveProperty('avg');
            expect(res).toHaveProperty('min');
            expect(res).toHaveProperty('max');
            expect(res).toHaveProperty('tally');
            expect(Object.keys(res).length).toEqual(4);

        });

        it('should return a copy if return copy is truthy', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            const res1 = TimeLogger.getTimingData('label', true);
            const res2 = TimeLogger.getTimingData('label', true);

            expect(res1).not.toBe(res2);

        });

        it('should not return a copy if return copy is falsey', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            const res1 = TimeLogger.getTimingData('label', false);
            const res2 = TimeLogger.getTimingData('label', false);

            expect(res1).toBe(res2);

        });

        it('should return null if an invalid key is passed', () => {

            expect(TimeLogger.getTimingData('none')).toEqual(null);

        });

    });

    describe('getAllTimingData', () => {

        it('should return all stored timing data', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');
            TimeLogger.begin('label2');
            TimeLogger.end('label2');

            const res = TimeLogger.getAllTimingData();
            expect(Object.keys(res).length).toEqual(2);
            expect(res).toHaveProperty('label');
            expect(res.label).toHaveProperty('avg');
            expect(res.label).toHaveProperty('min');
            expect(res.label).toHaveProperty('max');
            expect(res.label).toHaveProperty('tally');

            expect(res).toHaveProperty('label2');

        });

        it('should return a copy if the parameter is truthy', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            const res1 = TimeLogger.getAllTimingData(true);
            const res2 = TimeLogger.getAllTimingData(true);

            expect(res1).not.toBe(res2);
            expect(res1.label).not.toBe(res2.label);

        });

        it('should not return a copy if the parameter is falsey', () => {

            TimeLogger.begin('label');
            TimeLogger.end('label');

            const res1 = TimeLogger.getAllTimingData(false);
            const res2 = TimeLogger.getAllTimingData(false);

            expect(res1).toBe(res2);
            expect(res1.label).toBe(res2.label);

        });

    });

    describe('getPending', () => {

        it('should contain labels that have not had `end` called', () => {

            TimeLogger.begin('label');
            TimeLogger.begin('label2');

            TimeLogger.begin('label3');
            TimeLogger.end('label3');
            TimeLogger.begin('label3');

            expect(TimeLogger.getPending().sort()).toEqual(['label', 'label2', 'label3']);

        });

        it('should not contain labels that have had `end` called', () => {

            TimeLogger.begin('label');
            TimeLogger.begin('label2');
            TimeLogger.end('label2');

            expect(TimeLogger.getPending()).toEqual(['label']);

        });

    });

});
