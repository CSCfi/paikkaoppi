import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MapComponent } from './map.component'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component'
import { MarkComponent } from './mark.component'
import { MarkService } from '../service/mark.service'
import { GeoService } from './geo.service'

@NgModule({
  imports: [
    CommonModule, RouterModule, FormsModule
  ],
  declarations: [MapComponent, OskariRpcComponent, HelpComponent, MarkComponent],
  providers: [MarkService, GeoService],
  exports: [MapComponent]
})
export class MapModule { }
