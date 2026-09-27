export function getBadge(progress) {
    if (progress >= 100) return '🏆 Disaster Ready';
    if (progress >= 75) return '🥇 Community Responder';
    if (progress >= 50) return '🥈 Emergency Planner';
    if (progress >= 25) return '🥉 Prepared Citizen';
    return '🌱 Beginner';
}