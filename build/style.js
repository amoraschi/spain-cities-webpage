function getStyle(feature, center) {
    const coords = feature.geometry.coordinates;
    const lat = coords[0][1];
    const lon = coords[0][0];
    const distance = haversineDistance(center[0], center[1], lat, lon);
    const geometryLength = feature.geometry.coordinates.length;
    const color = `hsl(${geometryLength * colorModifier}, 100%, 50%)`;
    return {
        color: color,
        opacity: 1 - distance / opacityModifier,
        weight: weightModifier
    };
}
