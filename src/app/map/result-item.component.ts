import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Result, ResultItem, User } from '../service/model'
import { GeoService, Coordinates } from './geo.service'
import { AuthService } from '../service/auth.service'

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent implements OnChanges {
  @Input() visible = false
  @Input() result: Result
  @Input() model: any
  isPoint: boolean = false
  isPolygon: boolean = false
  isEditMode: boolean = false
  EPSG4326: Coordinates
  showUser: boolean = false

  @Output() deleteResultItem = new EventEmitter<ResultItem>()
  @Output() saveResultItem = new EventEmitter<ResultItem>()
  @Output() resultItemPopupHidden = new EventEmitter<ResultItem>()

  constructor(private geoService: GeoService, private authService: AuthService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("ResultItemComponent.ngOnChanges", this.model)
    const resultItem = this.model as ResultItem
    this.EPSG4326 = this.geoService.getPointCoordinates(resultItem)
    this.isPoint = this.geoService.isPoint(resultItem)
    this.isPolygon = this.geoService.isPolygon(resultItem)
    if (this.model != null && this.model["id"] == null) {
      this.isEditMode = true
    }

    if (this.result != null && this.authService.getUsername() != this.result.user.username) {
      this.showUser = true
    } else {
      this.showUser = false
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
  }

  private hide() {
    const tmpModel = this.model
    this.model = null
    this.isEditMode = false
    this.resultItemPopupHidden.emit(tmpModel)
  }
}