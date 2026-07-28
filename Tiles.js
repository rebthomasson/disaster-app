import { Circle } from "react-native-svg";
import React from "react";

export default function Player({ row, column, tile_size, color = 'pink'}) {
    const calc_x = column * tile_size + tile_size / 2;
    const calc_y = row *  tile_size + tile_size / 2;

    return (
        <Circle
            cx={calc_x}
            cy={calc_y}
            r={tile_size * 0.3}
            fill={color}
        />
    );
}
