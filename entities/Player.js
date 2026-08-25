//import { Image as RNImage } from "react-native";
import {Circle} from 'react-native-svg';
import React from "react";
//import playerSprite from '../assets/player.png';

export default function Player({ x, y, tile_size }) {
    return (
        <Circle
            cx={x + tile_size / 2}
            cy={y + tile_size / 2}
            r={tile_size * 0.3}
            fill="pink"
        />
        // <RNImage
        //     source={playerSprite}
        //     style={{
        //         position: 'absolute',
        //         left: x + tile_size * 0.1,
        //         top: y + tile_size * 0.1,
        //         width: tile_size * 0.8,
        //         height: tile_size * 0.8,
        //         pointerEvents: 'none',
        //     }}
        // />
    );
}
