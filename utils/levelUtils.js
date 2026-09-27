export function getNextLevelState(
    levelIndex,
    levels,
    currentXP,
    currentLevel
) {
    const isLastLevel = levelIndex === levels.length - 1;

    if (isLastLevel) {
        return {
            showVictory: true,
            activeModal: 'victory',
        };
    }

    const nextIndex = levelIndex + 1;

    return {
        levelIndex: nextIndex,
        completedTasks: [],
        showLevelComplete: false,
        playerPosition: 0,
        inventory: [],
        pathTiles: levels[nextIndex].pathTiles,
        timeLeft: levels[nextIndex].timeLimit,
        timerActive: true,
        xp: currentXP + currentLevel.xpReward,
        activeModal: 'goal',
    };
}