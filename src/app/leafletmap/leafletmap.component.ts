import { Component, OnInit, NgZone } from '@angular/core';

@Component({
  selector: 'leafletmap',
  templateUrl: './leafletmap.component.html',
  styleUrls: ['./leafletmap.component.css']
})
export class LeafletMapComponent implements OnInit {
  map: L.Map;

  constructor(private zone: NgZone) {
  }

  ngOnInit() {
  }

    /*
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      //L.tileLayer.wms('https://demo.boundlessgeo.com/geoserver/ows?', {}),
      //L.tileLayer.wms('http://maps1.paikkaoppi.fi/tilecache/tilecache.py?', {})
      //L.tileLayer('http://maps1.paikkaoppi.fi/tilecache/tilecache.py', { maxZoom: 18, attribution: '...' })
      L.tileLayer.wms('http://tiles.kartat.kapsi.fi/taustakartta?', {
        layers: 'taustakartta'
      }),
      L.tileLayer.wms('http://kartta.liikennevirasto.fi/meriliikenne/dgds/wms_ip/merikartta', {
        layers: 'cells'
      })
    ],
    zoom: 10
  };
  */

  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    //center: L.latLng([ 65.879966, 30.726909 ])
    center: L.latLng([35.879966, 10.726909])
  };

  layersControl = {
    baseLayers: {
      'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Maastotietokanta': L.tileLayer.wms('http://tiles.kartat.kapsi.fi/taustakartta', { maxZoom: 18, attribution: '...', layers: 'taustakartta' }),
    },
    overlays: {
      //'Big Circle': L.circle([46.95, -122], { radius: 5000 }),
      //'Big Square': L.polygon([[46.8, -121.55], [46.9, -121.55], [46.9, -121.7], [46.8, -121.7]])
    }
  };

  defaultIcon = L.icon({ iconUrl: 'assets/marker-icon.png', shadowUrl: 'assets/marker-shadow.png' });

  drawOptions = {
    position: 'topright',
    draw: {
      marker: {
        icon: this.defaultIcon
      },
      polyline: false,
      circle: {
        shapeOptions: {
          color: '#aaaaaa'
        }
      }
    }
  };

  onMapReady(createdMap: L.Map) {
    this.map = createdMap;
    this.map.locate({ setView: true, maxZoom: 8 });
    this.map.on("locationfound", (e) => {
      this.zone.runGuarded(() => this.onLocationFound(e));
    });
    this.map.on("locationerror", (e) => {
      this.zone.runGuarded(() => this.onLocationError(e));
    });
  }
  
  
  private onLocationFound(e: any) {
    console.info("onLocationFound(): ", e);
    const radius = e.accuracy / 2;
    const circle = L.circle(e.latlng, radius);
    circle.addTo(this.map);
    const marker = L.marker(e.latlng, { icon: this.defaultIcon });
    marker.addTo(this.map);
  }

  private onLocationError(e: any) {
    console.error("onLocationError:", e);
  }
}
