import {Rect, G, Text, Path} from 'react-native-svg';
import React from 'react';

const terrainStyles = {
    "mud": {
        fill: "#795548",
        icon: '🟫',
    },
    "debris": {
        fill: "#9E9E9E",
        icon: '🪨',
    },
    "water": {
        fill: "#42A5F5",
        icon: '🌊',
    },
    "fire": {
        fill: "#EF5350",
        icon: '🔥',
    },
    "smoke": {
        fill: "#90A4AE",
        icon: '💨',
    },
    "finish": {
        fill: "#FFD54F",
    },
    "default": {
        fill: "#66BB6A",
    }
};

export default function TilePath({
    tile_size,
    pathTiles,
    playerPosition
}) {
    return (
    <>
        {pathTiles.map((tile, index) => {
            if (index === 0) return null;

            const prev = pathTiles[index - 1];

            let px, py, cx, cy;

            if (prev.y === tile.y) {
                // Horizontal line
                px = tile.x > prev.x ? prev.x + tile_size : prev.x;
                py = prev.y + tile_size / 2;
                cx = tile.x < prev.x ? tile.x + tile_size : tile.x;
                cy = tile.y + tile_size / 2;
            } else if (prev.x === tile.x) {
                // Vertical line
                px = prev.x + tile_size / 2;
                py = tile.y > prev.y ? prev.y + tile_size : prev.y;
                cx = tile.x + tile_size / 2;
                cy = tile.y < prev.y ? tile.y + tile_size : tile.y;
            } else {
                // Diagonal line
                px = prev.x + tile_size / 2;
                py = prev.y + tile_size / 2;
                cx = tile.x + tile_size / 2;
                cy = tile.y + tile_size / 2;
            }

            // Midpoint
            const mx = (px + cx) / 2;
            const my = (py + cy) / 2;

            // Directional curve offset
            const dx = cx - px;
            const dy = cy - py;

            // Curve strength (tweak this!)
            const curve = 20;

            const distance = Math.max(Math.sqrt(dx*dx + dy*dy), 1); // Prevent division by zero

            // Control point: perpendicular to the line
            const qx = mx - dy * (curve / distance);
            const qy = my + dx * (curve / distance);

            return (
                <Path
                    key={`path-${tile.id}`}
                    d={`M${px},${py} Q${qx},${qy} ${cx},${cy}`}
                    stroke="black"
                    strokeWidth={3}
                    fill="none"
                />
            );
        })}
        {pathTiles.map((tile, index) => {
            const style = terrainStyles[tile.terrain] || terrainStyles["default"];
            const isPlayerTile = index === playerPosition;
            const tileIcon = tile.icon || style.icon || null;

            return (
                <G
                    key={tile.id}
                >
                    <Rect
                    x={tile.x}
                    y={tile.y}
                    width={tile_size}
                    height={tile_size}
                    stroke={isPlayerTile ? "#FFD700" : "black"}
                    strokeWidth="2"
                    fill={style.fill}
                    />
                    {tileIcon && (
                        <Text
                            x={tile.x + tile_size/2}
                            y={tile.y + tile_size/2}
                            fontSize={tile_size /2}
                            fill="black"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {tileIcon}
                        </Text>
                    )}
                </G>
            );
        })}
    </>
)
}
