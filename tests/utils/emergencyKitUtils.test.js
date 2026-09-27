import { toggleCheckedItem } from "../../utils/emergencyKitUtils";
import { calculateKitProgress } from "../../utils/emergencyKitUtils";
import { isKitComplete } from "../../utils/emergencyKitUtils";

describe('toggleCheckedItem', () => {
    test('adds unchecked item', () => {
        expect(toggleCheckedItem([], 'water'))
            .toEqual(['water']);
    });

    test('removes checked item', () => {
        expect(toggleCheckedItem(['water'], 'water'))
            .toEqual([]);
    });

    test('keeps other items', () => {
        expect(
            toggleCheckedItem(['water', 'food'], 'water')
            ).toEqual(['food']);
        });
});

describe('calculateKitProgress', () => {
    test('returns 50 percent progress', () => {
        expect(calculateKitProgress(5, 10))
            .toBe(0.5);
    });

    test('returns complete progress', () => {
        expect(calculateKitProgress(10, 10))
            .toBe(1);
    });

    test('returns empty progress', () => {
        expect(calculateKitProgress(0, 10))
            .toBe(0);
    });
});

describe('isKitComplete', () => {
    test('returns true when complete', () => {
        expect(isKitComplete(25, 25))
            .toBe(true);
    });

    test('returns false when incomplete', () => {
        expect(isKitComplete(24, 25))
            .toBe(false);
    });
});