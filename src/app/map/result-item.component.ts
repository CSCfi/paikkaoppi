import { Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { ResultItem } from '../service/model'
import { GeoService, Coordinates } from './geo.service'

@Component({
  selector: 'app-result-item',
  templateUrl: './result-item.component.html',
  styleUrls: ['./result-item.component.css']
})
export class ResultItemComponent implements OnChanges {
  @Input() visible = false
  @Input() model: any
  isPoint: boolean = false
  isPolygon: boolean = false
  EPSG4326: Coordinates

  @Output() deleteResultItem = new EventEmitter<ResultItem>()
  @Output() saveResultItem = new EventEmitter<ResultItem>()
  @Output() resultItemPopupHidden = new EventEmitter<ResultItem>()

  constructor(private geoService: GeoService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("ResultItemComponent.ngOnChanges", this.model)
    const resultItem = this.model as ResultItem
    this.EPSG4326 = this.geoService.getPointCoordinates(resultItem)
    this.isPoint = this.geoService.isPoint(resultItem)
    this.isPolygon = this.geoService.isPolygon(resultItem)
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

  private hide() {
    const tmpModel = this.model
    this.model = null
    this.resultItemPopupHidden.emit(tmpModel)
  }
}