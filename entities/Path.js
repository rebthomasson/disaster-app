import {Rect, G, Line, Text, Path} from 'react-native-svg';
import React from 'react';
//import Player from '../entities/Player';

// const terrainStyles = {
//     "mud": {
//         fill: "#8B4513",
//         texture: require('../assets/mud.jpg'),
//     },
//     "debris": {
//         fill: "#A9A9A9",
//         texture: require('../assets/debris.jpg'),
//     },
//     "water": {
//         fill: "#6285ac",
//         texture: require('../assets/water.jpg'),
//     },
//     "fire": {
//         fill: "#FF4500",
//         texture: require('../assets/fire.jpg'),
//     },
//     "smoke": {
//         fill: "#808080",
//         texture: require('../assets/smoke.jpg'),
//     },
//     "finish": {
//         fill: "#FFD700",
//     },
//     "default": {
//         fill: "#629f42",
//         texture: require('../assets/grass.jpg'),
//     }
// };

export default function TilePath({
    tile_size,
    pathTiles,
    playerPosition,
    onTilePress
}) {
    return (
    <>
        {pathTiles.map((tile, index) => {
            if (index === 0) return null;

            const prev = pathTiles[index - 1];

            let px, py, cx, cy;

            if (prev.y === tile.y) {
                // Horizontal line
                px = prev.x + tile.x ? prev.x + tile_size : prev.x;
                py = prev.y + tile_size / 2;
                cx = tile.x < prev.x ? tile.x + tile_size : tile.x;
                cy = tile.y + tile_size / 2;
            } else if (prev.x === tile.x) {
                // Vertical line
                px = prev.x + tile_size / 2;
                py = prev.y + tile.y ? prev.y + tile_size : prev.y;
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

            // Control point: perpendicular to the line
            const qx = mx - dy * (curve / Math.sqrt(dx*dx + dy*dy));
            const qy = my + dx * (curve / Math.sqrt(dx*dx + dy*dy));

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
            //const style = terrainStyles[tile.terrain] || terrainStyles["default"];
            const isPlayerTile = index === playerPosition;

            return (
                <G
                    key={tile.id}
                >
                    <Rect
                    x={tile.x}
                    y={tile.y}
                    width={tile_size}
                    height={tile_size}
                    stroke="black"
                    strokeWidth="2"
                    fill="white"
                    />
                    {/* {style.texture && (
                        <RNImage
                            source={style.texture}
                            style={{
                                position: 'absolute',
                                left: tile.x,
                                top: tile.y,
                                width: tile_size,
                                height: tile_size,
                                opacity: 0.5,
                                pointerEvents: 'none', // Ensure the image doesn't block touch events
                            }}
                        />
                    )}
                    {style.texture && (
                        <SvgImage
                            x={tile.x}
                            y={tile.y}
                            width={tile_size}
                            height={tile_size}
                            opacity={0.5}
                            source={style.texture}
                            preserveAspectRatio="none"
                        />
                    )} */}
                    {tile.icon && (
                        <Text
                            x={tile.x + tile_size/2}
                            y={tile.y + tile_size/2}
                            fontSize={tile_size /2}
                            fill="black"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                        >
                            {tile.icon}
                        </Text>
                    )}
                </G>
            );
        })}
    </>
)
}
