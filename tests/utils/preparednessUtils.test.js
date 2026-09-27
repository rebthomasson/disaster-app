import {calculatePreparednessPercent} from '../../utils/preparednessUtils';

describe('calculatePreparednessPercent', () => {
    test('calculates correctly', () => {
        expect(
            calculatePreparednessPercent(3, 5)
        ).toBe(60);
    });

    test('handles no goals', () => {
        expect(
            calculatePreparednessPercent(0, 0)
        ).toBe(0);
    });

    test('handles fully completed goals', () => {
        expect(
            calculatePreparednessPercent(5, 5)
        ).toBe(100);
    });
});