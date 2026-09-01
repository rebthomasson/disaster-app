import { Text } from "react-native-svg";
import React from "react";

export default function InventoryItem({ x, y, tile_size, icon, onPress }) {

    return (
        <Text
            x={x + tile_size * 0.8}
            y={y + tile_size * 0.8}
            fontSize={tile_size * 0.25}
            fill="white"
            textAnchor="middle"
            alignmentBaseline="middle"
            onPress={onPress}
        >
            {icon}
        </Text>
    );
}