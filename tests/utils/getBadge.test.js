import { getBadge } from '../../utils/getBadgeUtils';

describe('getBadge', () => {
    test('returns beginner badge', () => {
        expect(getBadge(0))
            .toBe('🌱 Beginner');
    });

    test('returns citizen badge', () => {
        expect(getBadge(25))
            .toBe('🥉 Prepared Citizen');
    });

    test('returns planner badge', () => {
        expect(getBadge(50))
            .toBe('🥈 Emergency Planner');
    });

    test('returns responder badge', () => {
        expect(getBadge(75))
            .toBe('🥇 Community Responder');
    });

    test('returns disaster ready badge', () => {
        expect(getBadge(100))
            .toBe('🏆 Disaster Ready');
    });
});