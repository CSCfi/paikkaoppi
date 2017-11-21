import { Injectable } from '@angular/core';
import { TaskType } from './model'

@Injectable()
export class ConversionService {
  
  constructor() {}

  taskTypeToOrderNumber(type: TaskType): number {
    switch (type) {
      case 'INVESTIGATE': {
        return 1
      }
      case 'ACT': {
        return 2
      }
      case 'PUZZLE': {
        return 3
      }
      default: {
        return 1
      }
    }
  }

}
