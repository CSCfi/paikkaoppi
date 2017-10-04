import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MapComponent } from './map.component'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component'
import { GeoService } from './geo.service'
import { ResultItemComponent } from './result-item.component'

@NgModule({
  imports: [
    CommonModule, RouterModule, FormsModule
  ],
  declarations: [MapComponent, OskariRpcComponent, HelpComponent, ResultItemComponent],
  providers: [GeoService],
  exports: [MapComponent]
})
export class MapModule { }
