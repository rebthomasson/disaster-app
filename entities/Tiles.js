import { Rect, G } from 'react-native-svg';
import React from 'react';

export default function Tiles({ 
  tile_size,
  grid_size,
  playerRow,
  playerColumn,
  onTilePress,
  items,
  tasks 
}) {
  return (
    <>
      {[...Array(grid_size)].map((_, row) =>
        [...Array(grid_size)].map((_, column) => {
          const isPlayerTile = row === playerRow && column === playerColumn;

          return (
            <G
              key={`${row}-${column}`}
              onPressIn={() => {
                onTilePress(row, column);
              }}
            >
              <Rect
                x={column * tile_size}
                y={row * tile_size}
                width={tile_size}
                height={tile_size}
                stroke="black"
                strokeWidth="2"
                fill={isPlayerTile ? "#d0f0ff" : "white"}
              />
            </G>
          );
        })
      )}
    </>
  );
}