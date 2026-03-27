import { MS_PER_MONTH } from '../utils.js';

describe('utils.js', () => {
    describe('MS_PER_MONTH', () => {
        it('should be the correct number of milliseconds', () => {
            expect(MS_PER_MONTH).toBe(1000 * 60 * 60 * 24 * 30);
        });
    });
});
