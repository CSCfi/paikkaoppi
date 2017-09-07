import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { OskariRpcComponent } from './oskari-rpc.component';
import { PopupComponent } from './popup.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [MapComponent, OskariRpcComponent, PopupComponent],
  exports: [MapComponent]
})
export class MapModule { }
