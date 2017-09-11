import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MapComponent } from './map.component'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component';
import { MarkComponent } from './mark.component'

@NgModule({
  imports: [
    CommonModule, RouterModule
  ],
  declarations: [MapComponent, OskariRpcComponent, HelpComponent, MarkComponent],
  exports: [MapComponent]
})
export class MapModule { }
