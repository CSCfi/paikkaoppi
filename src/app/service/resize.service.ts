import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs/Observable'
import { Ng2PicaService } from 'ng2-pica'

import { environment } from '../../environments/environment'

@Injectable()
export class ResizeService {

  constructor(private ng2PicaService: Ng2PicaService) { }

  resizeImage(file: File, onSuccess: Function, onError: Function) {
    this.getImageSize(file, function(size: ImageSize) {
      const resize = this.resize(size)
      
      this.ng2PicaService.resize([file], resize.width, resize.height).subscribe((result) => {
        onSuccess(result)
      }, error => {
        onError()
      })
    }.bind(this))
  }

  private getImageSize(file: File, callback: Function) {
    const img = new Image()
    img.onload = function () {
      const image: any = this
      if (image instanceof HTMLImageElement) {
        callback({
          width: image.width,
          height: image.height
        })
      }
    }
    img.src = window.URL.createObjectURL(file);
  }

  private resize(size: ImageSize): ImageSize {
    if (size.width < 1920 && size.height < 1920) {
      return size
    
    } else if (size.width > size.height) {
      const aspectRatio = size.width / 1920
      return {
        width: 1920,
        height: size.height / aspectRatio
      }
    
    } else {
      const aspectRatio = size.height / 1920
      return {
        width: size.width / aspectRatio,
        height: 1920
      }
    }
  }
}

export interface ImageSize {
  width: number
  height: number
}
