async function fetchAPI(name) {
    const query = `
    [out:json];
    area[name="${name}"][admin_level=8]->.city;
    area["ISO3166-1"="ES"]->.es;
    (
      nwr
        [highway]
        // [highway!~"path|cycleway|steps|crossing|traffic_signals|bus_stop|street_lamp|raceway|service|give_way|stop"]
        // [entrance!="yes"]
        [area!="yes"]
        [type!="multipolygon"]
        (area.es)(area.city);
    );
    (._;>;);
    out geom;
  `;
    const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
    });
    const data = await response.json();
    console.log('Converting data');
    const geojson = osm2geojson(data, {
        allFeatures: true,
        completeFeature: true,
        excludeWay: false,
        suppressWay: false,
        renderTagged: true
    });
    console.log('Converted data');
    return cleanJSON(geojson);
}
function cleanJSON(data) {
    const cleanedFeatures = data.features.filter(feature => {
        delete feature.properties.bounds;
        return feature.id.startsWith('way/') && feature.geometry.type === 'LineString';
    });
    const cleaned = {
        type: 'FeatureCollection',
        features: cleanedFeatures
    };
    return cleaned;
}
