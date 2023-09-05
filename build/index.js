// https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
// https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
// https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
const tileProvider = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
const map = L.map('map', {
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false
});
let opacityModifier = 100000;
let weightModifier = 1;
let colorModifier = 1000;
getData();
async function getData() {
    const listRes = await fetch('https://raw.githubusercontent.com/amoraschi/spain-cities-geojson/master/list.json');
    const list = await listRes.json();
    console.log('List', list);
    const saveButton = document.getElementById('save');
    const dropdown = document.getElementById('cityDropdown');
    const loadingSpan = document.getElementById('loading');
    const opacityModifierInput = document.getElementById('opacityModifier');
    const weightModifierInput = document.getElementById('weightModifier');
    const colorModifierInput = document.getElementById('colorModifier');
    Object.keys(list).sort((a, b) => a.localeCompare(b)).forEach((city) => {
        const option = document.createElement('option');
        option.value = city;
        option.innerText = city;
        dropdown.appendChild(option);
    });
    dropdown.value = 'Sevilla';
    let roadData;
    await loadCity(list['Sevilla']);
    async function loadCity(name) {
        loadingSpan.innerText = `Loading ${name}`;
        console.log('Reading data');
        console.log(`Fetching from https://raw.githubusercontent.com/amoraschi/spain-cities-geojson/master/simple-cities/${name}`);
        // const cityRes = await fetch(`https://raw.githubusercontent.com/amoraschi/spain-cities-geojson/master/simple-cities/${name}`)
        const data = await fetchAPI(dropdown.value).catch(() => {
            loadingSpan.innerText = `Loading ${name} failed`;
        });
        console.log('Data fetched');
        if (data == null) {
            return;
        }
        console.log('Data parsed');
        const center = getCenter(data);
        if (Number.isNaN(center[0]) || Number.isNaN(center[1])) {
            loadingSpan.innerText = `Loading ${name} failed`;
            return;
        }
        const [minLat, maxLat, minLon, maxLon] = getMinMax(data);
        console.log('Center', center);
        map.fitBounds([
            [minLat, minLon],
            [maxLat, maxLon]
        ]);
        // map.whenReady(() => {
        L.tileLayer(tileProvider, {
            attribution: 'Map data &copy <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            subdomains: 'abcd'
        }).addTo(map);
        if (roadData != null) {
            roadData.clearLayers();
            roadData.addData(data);
        }
        else {
            roadData = L.geoJSON(data, {
                style: (feature) => getStyle(feature, center)
            }).addTo(map);
        }
        let featuresProcessed = 0;
        roadData.eachLayer(async () => {
            featuresProcessed++;
            if (featuresProcessed === data.features.length) {
                loadingSpan.innerText = `Loaded ${name} (${data.features.length} features)`;
            }
        });
        dropdown.onchange = async () => {
            const fileName = list[dropdown.value];
            opacityModifierInput.value = '100000';
            weightModifierInput.value = '1';
            colorModifierInput.value = '1000';
            opacityModifier = 100000;
            weightModifier = 1;
            colorModifier = 1000;
            await loadCity(fileName);
        };
        saveButton.onclick = () => {
            opacityModifier = Number(opacityModifierInput.value) ?? 0;
            weightModifier = Number(weightModifierInput.value) ?? 0;
            colorModifier = Number(colorModifierInput.value) ?? 0;
            roadData.eachLayer((layer) => {
                // @ts-expect-error
                layer.setStyle(getStyle(layer.feature, center));
            });
        };
        // })
    }
}
