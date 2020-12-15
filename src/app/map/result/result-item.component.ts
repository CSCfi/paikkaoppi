import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core'
import { FileUploader, FileItem } from 'ng2-file-upload'


import { environment } from '../../../environments/environment'
import { ResultItem, User, PolygonFeatureCollection } from '../../service/model'
import { Result } from '../../service/model-result'
import { GeoService, Coordinates } from '../geo.service'
import { AuthService } from '../../service/auth.service'
import { AttachmentService } from '../../service/attachment.service'
import { ResizeService } from '../../service/resize.service'

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent implements OnChanges {
  @Input() visible = false
  @Input() result: Result
  @Input() model: any
  errorMessage: string
  isPoint = false
  pointWGS84Coordinates: Coordinates
  isPolygon = false
  polygonCoordinates: number[][]
  polygonWGS84Coordinates: Coordinates[]
  isLine = false
  lineCoordinates: number[][]
  lineWGS84Coordinates: Coordinates[]
  isEditMode = false
  isResized = false
  isUploading = false
  showUser = false

  uploader: FileUploader

  @Output() deleteResultItem = new EventEmitter<ResultItem>()
  @Output() saveResultItem = new EventEmitter<ResultItem>()
  @Output() resultItemPopupHidden = new EventEmitter<ResultItem>()

  constructor(
    private geoService: GeoService,
    private authService: AuthService,
    private attachmentService: AttachmentService,
    private resizeService: ResizeService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ResultItemComponent.ngOnChanges', this.model)
    const resultItem = this.model as ResultItem
    this.pointWGS84Coordinates = this.geoService.pointWGS84Coordinates(resultItem)
    this.isPoint = this.geoService.isPoint(resultItem)
    this.isPolygon = this.geoService.isPolygon(resultItem)
    this.isLine = this.geoService.isLineString(resultItem)
    if (this.isPolygon) {
      this.polygonCoordinates = this.geoService.polygonCoordinates(resultItem)
      console.log(this.polygonCoordinates)
      this.polygonWGS84Coordinates = this.geoService.polygonWGS84Coordinates(resultItem)
      console.log(this.polygonWGS84Coordinates)
    }
    if (this.isLine) {
      this.lineCoordinates = this.geoService.lineStringCoordinates(resultItem)
      console.log(this.lineCoordinates)
      this.lineWGS84Coordinates = this.geoService.lineStringWGS84Coordinates(resultItem)
      console.log(this.lineWGS84Coordinates)
    }
    if (this.model != null && this.model['id'] == null) {
      this.initUpload(null)
      this.isEditMode = true
    }
    this.showUser = this.result != null && this.authService.getUsername() !== this.result.user.username
  }

  canEdit(): boolean {
    return this.authService.getUsername() === this.result.user.username ||
      (this.authService.isTeacher() && this.result.resultItems.some(item => item.visibility === 'OPEN'))
  }

  hasImage(): boolean {
    return this.hasExistingImage() || this.hasNewImage()
  }

  private hasExistingImage() {
    return this.model.attachments !== undefined && this.model.attachments.length > 0
  }

  private hasNewImage() {
    return this.model.newAttachmentIds !== undefined && this.model.newAttachmentIds.length > 0
  }

  private getFileExtension(filename) {
    const lastIndex = filename.lastIndexOf(".")
    if (lastIndex < 1) return ""
    return filename.substr(lastIndex + 1)
  }

  imageUrl(): string {
    if (!this.hasImage()) return '';

    const id = this.hasExistingImage() ? this.model.attachments[0].id : this.model.newAttachmentIds[0]
    return `${environment.apiUri}/attachment/${id}/content`
  }

  removeImage() {
    this.errorMessage = null
    this.removePreviousImage()
    this.model.newAttachmentIds = []
    this.model.attachments = []
  }

  private removePreviousImage() {
    if (!this.hasImage()) return;

    const id = this.hasExistingImage() ? this.model.attachments[0].id : this.model.newAttachmentIds[0]
    this.attachmentService.removeAttachment(id).subscribe((ok) => { console.log(`Existing image ${id} removed`) });
  }

  private initUpload(resultItemId: number) {
    let url = `${environment.apiUri}/attachment`
    if (resultItemId != null) {
      url = `${environment.apiUri}/resultitem/${resultItemId}/attachment`
    }
    
    this.uploader = new FileUploader({
      url: url,
      disableMultipart: false,
      autoUpload: false,
      allowedMimeType: ['image/png', 'image/jpeg', 'image/gif']
    })

    this.uploader.onAfterAddingFile = (item: FileItem) => {
      if (!this.isResized) {
        this.isUploading = true
        this.uploader.removeFromQueue(item)

        this.resizeService.resizeImage(item._file, function(result) {
          this.isResized = true
          this.uploader.addToQueue([result], this.uploader.options, null)
          this.uploader.uploadAll()
        }.bind(this), function() {
          this.isResized = false
          this.isUploading = false
          this.errorMessage = 'Kuvan pienennys ennen lähetystä ei onnistunut'
        }.bind(this))
      }
    }

    this.uploader.onWhenAddingFileFailed = (item: any, filter: any, options: any) => {
      this.errorMessage = 'Kuva ei ollut tuettua formaattia. Tuetut tiedostotyypit ovat .gif, .jpg ja .png'
    }

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.isResized = false
      this.isUploading = false
      
      if (status === 200) {
        this.removeImage()
        const attachment = JSON.parse(response)
        this.model.newAttachmentIds.push(attachment.id)

      } else if (status === 415) {
        this.errorMessage = 'Kuva ei ollut tuettua formaattia. Tuetut tiedostotyypit ovat .gif, .jpg ja .png'
      } else {
        this.errorMessage = 'Kuvan lisäys epäonnistui'
      }
    }
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
    this.initUpload(this.model.id ? this.model.id : null)
  }

  private hide() {
    const tmpModel = this.model
    this.model = null
    this.isEditMode = false
    this.resultItemPopupHidden.emit(tmpModel)
  }
}

