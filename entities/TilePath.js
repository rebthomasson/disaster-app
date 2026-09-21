import {Rect, G, Text, Path} from 'react-native-svg';
import React from 'react';

//Array to keep track of styling for the different types of terrain
//Adds a color and icon to each of the special tiles
const terrainStyles = {
    "mud": {
        fill: "#795548",
        icon: '🟫',
    },
    "debris": {
        fill: "#a48703",
        icon: '🪵',
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
    "rock": {
        fill: "#9E9E9E",
        icon: '🪨',
    },
    "rubble": {
        fill: "#d37676",
        icon: '🧱',
    },
    "finish": {
        fill: "#FFD54F",
    },
    "default": {
        fill: "#66BB6A",
    }
};

//Function renders the path of the game board for each of the levels
//Also created the curved connections between the tiles
export default function TilePath({
    tile_size,
    pathTiles,
    playerPosition
}) {
    return (
    <>
    {/**Creates a curved path connections between each tile */}
        {pathTiles.map((tile, index) => {
            if (index === 0) return null; //First tile has no previous tile

            const prev = pathTiles[index - 1];

            let px, py, cx, cy;
            //Determine the start and end points based on how tiles are aligned
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

            // Curve strength 
            const curve = 20;

            const distance = Math.max(Math.sqrt(dx*dx + dy*dy), 1); // Prevent division by zero

            // Control point: perpendicular to the line (this creates the curve)
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
        {/**Maps out the tiles using SVG rect objects */}
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
                    stroke={isPlayerTile ? "#FFD700" : "black"} //Highlihgt the player tile
                    strokeWidth="2"
                    fill={style.fill}
                    />
                    {/**Display the terrain icon if there is one */}
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
