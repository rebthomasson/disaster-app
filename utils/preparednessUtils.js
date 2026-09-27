export function calculatePreparednessPercent(
    completedGoals,
    totalGoals
) {
    if (totalGoals === 0) return 0;

    return Math.round(
        (completedGoals / totalGoals) * 100
    );
}