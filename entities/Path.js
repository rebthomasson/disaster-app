import {Rect, G, Line, Text} from 'react-native-svg';
import React from 'react';

export default function Path({
    tile_size,
    pathTiles,
    playerPosition,
    onTilePress
}) {
    return (
    <>
        {pathTiles.map((tile, index) => {
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
                    fill={isPlayerTile ? "#d0f0ff" : "white"}
                    />
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
        {pathTiles.map((tile, index) => {
            if (index === 0) {
                return null;
            };
            const prev = pathTiles[index -1];
            if (prev.y === tile.y) {
                return (
                    <Line
                        key = {`line-${tile.id}`}
                        x1 = {Math.min(prev.x, tile.x) + tile_size}
                        y1 = {tile.y + tile_size /2}
                        x2 = {Math.max(prev.x, tile.x)}
                        y2 = {tile.y + tile_size /2}
                        stroke='black'
                        strokeWidth={2}
                    />
                )
            }

            if (prev.x === tile.x) {
                return (
                    <Line
                        key = {`line-${tile.id}`}
                        x1 = {tile.x + tile_size/2}
                        y1 = {Math.min(prev.y, tile.y) + tile_size}
                        x2 = {tile.x + tile_size /2}
                        y2 = {Math.max(prev.y, tile.y)}
                        stroke='black'
                        strokeWidth={2}
                    />
                )
            }
        })}
    </>
);
}