import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core';
import { FileUploadModule } from 'ng2-file-upload'
import { Ng2PicaModule } from 'ng2-pica'

import { MessageModule } from '../message/message.module'
import { MapComponent } from './map.component'
import { OskariRpcComponent } from './oskari-rpc.component'
import { HelpComponent } from './help.component'
import { DecimalPipe } from '../pipe/decimal.pipe'
import { GeoService } from './geo.service'
import { AttachmentService } from '../service/attachment.service'
import { ResizeService } from '../service/resize.service'
import { ResultItemComponent } from './result/result-item.component'

@NgModule({
  imports: [
    CommonModule, RouterModule, FormsModule, MessageModule, FileUploadModule, TranslateModule, Ng2PicaModule
  ],
  declarations: [MapComponent, OskariRpcComponent, HelpComponent, ResultItemComponent, DecimalPipe],
  providers: [GeoService, AttachmentService, ResizeService],
  exports: [MapComponent, TranslateModule]
})
export class MapModule { }
