import { Circle } from "react-native-svg";
import React from "react";

export default function Player({ x, y, tile_size, color = 'pink'}) {
    return (
        <Circle
            cx={x + tile_size/2}
            cy={y + tile_size/2}
            r={tile_size * 0.3}
            fill={color}
        />
    );
}
