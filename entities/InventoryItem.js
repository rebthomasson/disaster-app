import { Circle } from "react-native-svg";
import React from "react";

export default function InventoryItem({ x, y, tile_size, onPress }) {

    return (
        <Circle
            cx={x + tile_size/2}
            cy={y + tile_size/2}
            r={tile_size * 0.25}
            fill="#A98EBF"
            onPressIn={onPress}
        />
    );
}