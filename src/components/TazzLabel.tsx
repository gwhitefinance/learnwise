"use client";

import { Text } from "@react-three/drei";

interface TazzLabelProps {
  name: string;
  position: [number, number, number];
}

export default function TazzLabel({ name, position }: TazzLabelProps) {
  return (
    <Text
      position={[position[0], position[1] - 1.5, position[2]]}
      fontSize={0.6}
      color="white"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}
      outlineColor="black"
    >
      {name}
    </Text>
  );
}
