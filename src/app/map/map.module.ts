import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { OskariRpcComponent } from './oskari-rpc.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MapComponent, OskariRpcComponent],
  exports: [MapComponent]
})
export class MapModule { }
