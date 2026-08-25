export default function mapGenrator(rows, columns, tileSize, gap) {
    const tiles = [];
    let id = 0;
    const variation = () => Math.random() * 15 - 7;

    for (let row = 0; row < rows; row++) {
        const mapDirection = row % 2 === 0 ? 1 : -1;

        for (let column = 0; column < columns; column++) {
            const actualColumn = mapDirection === 1 ? column : (columns - 1 -column);
            
            const baseX = actualColumn * (tileSize + gap);
            const baseY = row * (tileSize + (gap * 2));

            tiles.push({
                id: id++,
                terrain: 'road',
                icon: null,
                eventChance: Math.random() * 0.4,
                x: baseX + variation(),
                y: baseY + variation(),
                item: null,
                task: null
            });
        }
    }

    // function createTerrain(centerIndex, size, tiles, terrainType) {
    //     for (let i = 0; i < size; i++) {
    //         const index = centerIndex + i;
    //         if (tiles[index]) {
    //             tiles[index].terrain = terrainType;
    //         }
    //     }
    // }

    // terrainList.forEach(terrainType => {
    //     const totalTiles = tiles.length;
    //     const start = Math.floor(totalTiles * (i / terrainList.length));
    //     const size = 3 + Math.floor(Math.random() * 4);

    //     createTerrain(start, size, tiles, terrainType);
    // });

    return tiles;
}