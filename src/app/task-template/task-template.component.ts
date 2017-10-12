import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Instruction, TaskTemplate } from '../service/model';

@Component({
  selector: 'app-task-template',
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.css']
})
export class TaskTemplateComponent implements OnInit {
  @Output() close = new EventEmitter<void>()
  @Output() save = new EventEmitter<TaskTemplate>()
  model: any = {}
  phase = 1
  firstPhase = 1
  lastPhase = 3

  constructor() { }

  ngOnInit() {
    console.log('ngOnInit')
    this.model = this.createNewModel()
    this.phase = 1
  }

  closeDialog() {
    console.log('closeDialog')
    this.close.next()
  }

  submit() {
    console.log('submit')
    this.save.next(this.model)
  }

  next() {
    console.log('next')
    this.phase++
  }

  private createNewModel(): any {
    return {
      name: null,
      title: null,
      description: null,
      instructions: [],
      info: null,
      tags: []
    }
  }
}
