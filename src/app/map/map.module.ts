import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MapComponent } from './map.component'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component'
import { MarkComponent } from './mark.component'
import { MarkService } from '../service/mark.service'

@NgModule({
  imports: [
    CommonModule, RouterModule, FormsModule
  ],
  declarations: [MapComponent, OskariRpcComponent, HelpComponent, MarkComponent],
  providers: [MarkService],
  exports: [MapComponent]
})
export class MapModule { }
