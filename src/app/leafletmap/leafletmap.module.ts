import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';

import { LeafletMapComponent } from './leafletmap.component';

@NgModule({
  imports: [
    CommonModule,
    LeafletModule,
    LeafletDrawModule
  ],
  declarations: [LeafletMapComponent],
  exports: [LeafletMapComponent]
})
export class LeafletMapModule { }