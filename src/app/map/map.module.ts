import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MapComponent } from './map.component'
import { OskariRpcComponent } from './oskari-rpc.component'
import { PopupComponent } from './popup.component'
import { MarkComponent } from './mark.component'

@NgModule({
  imports: [
    CommonModule, RouterModule
  ],
  declarations: [MapComponent, OskariRpcComponent, PopupComponent, MarkComponent],
  exports: [MapComponent]
})
export class MapModule { }
