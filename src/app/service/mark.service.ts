import { Injectable } from '@angular/core';

import { Mark } from './model'

@Injectable()
export class MarkService {
  marks: Mark[] = []

  constructor() { }

  getMarks(): Promise<Mark[]> {
    return Promise.resolve(this.marks)
  }

  getMark(markerId: string): Promise<Mark> {
    return Promise.resolve(this.marks.find(mark => mark.markerId === markerId))
  }

  saveMark(mark: Mark): void {
    console.log('Saving mark', mark)
    const existingMark = this.marks.find(m => m.id === mark.id)
    if (!existingMark) {
      mark.id = this.marks.length + 1
      this.marks.push(mark)
    }
  }

  deleteMark(mark: Mark): void {
    console.log('Deleting mark', mark)
    const index: number = this.marks.indexOf(mark)
    if (index !== -1) { this.marks.splice(index, 1) }
  }
}
