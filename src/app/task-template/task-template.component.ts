import { TaskTemplateService } from '../service/task-template.service';
import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Instruction, TaskTemplate } from '../service/model';

@Component({
  selector: 'app-task-template',
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.css']
})
export class TaskTemplateComponent implements OnInit {
  @Input() model: any
  @Output() close = new EventEmitter<void>()
  @Output() save = new EventEmitter<TaskTemplate>()
  phase = 1
  firstPhase = 1
  lastPhase = 3

  constructor(private taskTemplateService: TaskTemplateService) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.phase = 1
    if (this.model === null) {
      this.model = this.createNewModel()
    }
  }

  closeDialog() {
    console.log('closeDialog', this.model)
    this.close.next()
  }

  submit() {
    console.log('submit', this.model)
    if (this.model.id !== undefined) {
      this.taskTemplateService.updateTaskTemplate(this.model).subscribe(
        value => this.save.next(value)
      )
    } else {
      this.taskTemplateService.createTaskTemplate(this.model).subscribe(
        value => this.save.next(value)
      )
    }
  }

  next() {
    console.log('next', this.model)
    this.phase++
  }

  moveToPhase(index: number) {
    if (index >= this.firstPhase && index <= this.lastPhase)
      this.phase = index
  }

  addInstruction(): void {
    this.model.instructions.push(this.createNewInstruction())
    console.log('addInstruction', this.model)
  }

  removeInstruction(instruction: Instruction): void {
    this.model.instructions = this.model.instructions.filter( i => i !== instruction)
    console.log('removeInstruction', this.model)
  }

  private createNewModel(): any {
    return {
      name: null,
      title: null,
      description: null,
      instructions: [this.createNewInstruction()],
      info: null,
      tags: []
    }
  }

  private createNewInstruction(): Instruction {
    return <Instruction>{
      name: null,
      description: null
    }
  }
}
