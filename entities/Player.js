import {Image as SvgImage} from 'react-native-svg';
import React from "react";

//Function to track/display the player sprite
//Uses SvgImage to render the player avatar on top of the tile
export default function Player({ x, y, tile_size }) {
    const playerSize = tile_size * 0.8; // Adjust the size of the player image relative to the tile size
    return (
        <SvgImage
        //Controls the position and size of the player avatar
            x={x + (tile_size - playerSize) / 2}
            y={y + (tile_size - playerSize) / 2}
            width={playerSize}
            height={playerSize}
            href={require('../assets/player.png')} // Path to the player image
        />
    );
}
