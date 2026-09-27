import { getNextLevelState } from '../../utils/levelUtils';

describe('getNextLevelState', () => {
    test('advances to next level', () => {
        const levels = [
        {
            pathTiles: ['A'],
            timeLimit: 60,
        },
        {
            pathTiles: ['B'],
            timeLimit: 45,
            },
        ];

        const result = getNextLevelState(
            0,
            levels,
            100,
            { xpReward: 50 }
        );

        expect(result.levelIndex).toBe(1);
        expect(result.playerPosition).toBe(0);
        expect(result.inventory).toEqual([]);
        expect(result.xp).toBe(150);
        expect(result.activeModal).toBe('goal');
    });

    test('shows victory on final level', () => {
        const levels = [
            { pathTiles: [], timeLimit: 60 }
    ];

        const result = getNextLevelState(
            0,
            levels,
            100,
            { xpReward: 50 }
        );

        expect(result.showVictory).toBe(true);
        expect(result.activeModal).toBe('victory');
});
});