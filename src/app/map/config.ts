export class Config {
    public static readonly EPSG3067 = '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
    public static readonly EPSG4326 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

    public static readonly markerOptions : any = {
        color: 'ff0000',
        msg: '',
        shape: 2,
        size: 10
    }
}