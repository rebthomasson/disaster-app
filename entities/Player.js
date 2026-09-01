import {Image as SvgImage} from 'react-native-svg';
import React from "react";

export default function Player({ x, y, tile_size }) {
    const playerSize = tile_size * 0.8; // Adjust the size of the player image relative to the tile size
    return (
        <SvgImage
            x={x + (tile_size - playerSize) / 2}
            y={y + (tile_size - playerSize) / 2}
            width={playerSize}
            height={playerSize}
            href={require('../assets/player.png')} // Path to the player image
        />
    );
}
