import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core'
import { FileUploader } from 'ng2-file-upload';

import { environment } from '../../../environments/environment'
import { ResultItem, User, PolygonFeatureCollection } from '../../service/model'
import { Result } from '../../service/model-result'
import { GeoService, Coordinates } from '../geo.service'
import { AuthService } from '../../service/auth.service'

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent implements OnChanges {
  @Input() visible = false
  @Input() result: Result
  @Input() model: any
  isPoint = false
  pointWGS84Coordinates: Coordinates
  isPolygon = false
  polygonCoordinates: number[][]
  polygonWGS84Coordinates: Coordinates[]
  isEditMode = false
  showUser = false

  uploader: FileUploader

  @Output() deleteResultItem = new EventEmitter<ResultItem>()
  @Output() saveResultItem = new EventEmitter<ResultItem>()
  @Output() resultItemPopupHidden = new EventEmitter<ResultItem>()

  constructor(private geoService: GeoService, private authService: AuthService) {
    this.uploader = new FileUploader({
      url: `${environment.apiUri}/attachment`,
      disableMultipart: false,
      autoUpload: true
    })

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      if (this.model.newAttachmentIds === undefined) {
        this.model.newAttachmentIds = []
      }

      const attachment = JSON.parse(response)
      this.model.newAttachmentIds.push(attachment.id)
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ResultItemComponent.ngOnChanges', this.model)
    const resultItem = this.model as ResultItem
    this.pointWGS84Coordinates = this.geoService.pointWGS84Coordinates(resultItem)
    this.isPoint = this.geoService.isPoint(resultItem)
    this.isPolygon = this.geoService.isPolygon(resultItem)
    if (this.isPolygon) {
      this.polygonCoordinates = this.geoService.polygonCoordinates(resultItem)
      console.log(this.polygonCoordinates)
      this.polygonWGS84Coordinates = this.geoService.polygonWGS84Coordinates(resultItem)
      console.log(this.polygonWGS84Coordinates)
    }
    if (this.model != null && this.model['id'] == null) {
      this.isEditMode = true
    }
    if (this.result != null && this.authService.getUsername() !== this.result.user.username) {
      this.showUser = true
    } else {
      this.showUser = false
    }
  }

  hasImage(): boolean {
    const resultItem = this.model as ResultItem
    console.log(resultItem.attachments !== undefined && resultItem.attachments.length > 0)
    return resultItem.attachments !== undefined && resultItem.attachments.length > 0
  }

  imageUrl(): string {
    if (!this.hasImage()) return;
    const resultItem = this.model as ResultItem
    const id = resultItem.attachments[0].id
    return `${environment.apiUri}/attachment/${id}/content`
  }

  close() {
    if (this.model.id === undefined) {
      this.deleteResultItem.emit(this.model)
    }
    this.hide()
  }

  save() {
    this.saveResultItem.emit(this.model)
    this.hide()
  }

  delete() {
    this.deleteResultItem.emit(this.model)
    this.hide()
  }

  edit() {
    this.isEditMode = true
  }

  private hide() {
    const tmpModel = this.model
    this.model = null
    this.isEditMode = false
    this.resultItemPopupHidden.emit(tmpModel)
  }
}
