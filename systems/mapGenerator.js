export default function mapGenrator(rows, columns, tileSize, gap) {
    const tiles = [];
    let id = 0;

    for (let row = 0; row < rows; row++) {
        const mapDirection = row % 2 === 0 ? 1 : -1;

        for (let column = 0; column < columns; column++) {
            const actualColumn = mapDirection === 1 ? column : (columns - 1 -column);

            tiles.push({
                id: id++,
                terrain: 'road',
                icon: null,
                eventChance: Math.random() * 0.4,
                x: actualColumn * (tileSize + gap),
                y: row * (tileSize + (gap * 2)),
                item: null,
                task: null
            });
        }
    }

    return tiles;
}