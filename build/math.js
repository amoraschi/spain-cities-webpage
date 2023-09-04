function getCenter(data) {
    let totalLat = 0;
    let totalLon = 0;
    let totalPoints = 0;
    for (const feature of data.features) {
        const coords = feature.geometry.coordinates;
        for (const coord of coords) {
            totalLon += coord[0];
            totalLat += coord[1];
            totalPoints++;
        }
    }
    return [totalLat / totalPoints, totalLon / totalPoints];
}
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
function getMinMax(data) {
    const minLat = Math.min(...data.features.map((feature) => feature.geometry.coordinates[0][1]));
    const maxLat = Math.max(...data.features.map((feature) => feature.geometry.coordinates[0][1]));
    const minLon = Math.min(...data.features.map((feature) => feature.geometry.coordinates[0][0]));
    const maxLon = Math.max(...data.features.map((feature) => feature.geometry.coordinates[0][0]));
    return [minLat, maxLat, minLon, maxLon];
}
