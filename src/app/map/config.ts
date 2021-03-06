// ETRS-TM35FIN
const EPSG3067 = '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
// WGS84
const EPSG4326 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs'

const geometryTypePoint = 'Point'
const geometryTypePolygon = 'Polygon'
const geometryTypeLineString = 'LineString'
const geometryTypeFeatureCollection = 'FeatureCollection'

const MARKER_OPTIONS: any = {
    color: 'ff0000',
    msg: '',
    shape: 2,
    size: 10
}

const LOCATION_OPTIONS: any = {
    color: '4292f4',
    msg: '',
    shape: 4,
    size: 5
}

export { MARKER_OPTIONS, LOCATION_OPTIONS, EPSG3067, EPSG4326, geometryTypePoint, geometryTypePolygon, geometryTypeFeatureCollection, geometryTypeLineString }
