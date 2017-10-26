import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TaskTemplateService } from '../service/task-template.service';
import { Component, OnInit } from '@angular/core';
import { Instruction, TaskTemplate } from '../service/model';

@Component({
  selector: 'app-task-template',
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.css']
})
export class TaskTemplateComponent implements OnInit {
  model: any
  phase = 1
  firstPhase = 1
  lastPhase = 3

  constructor(private taskTemplateService: TaskTemplateService,
    private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.phase = 1

    this.route.paramMap.switchMap((params: ParamMap) => {
      if (params.has('id')) {
        return this.taskTemplateService.getTaskTemplate(+params.get('id'))
      } else {
        return Observable.of(this.createNewModel())
      }
    }).subscribe(taskTemplate => {
        this.model = taskTemplate
      },
      err => {
        console.error('Failed get taskTemplate')
        console.error(err)
        this.router.navigate(['/library'])
      })
  }

  closeDialog() {
    console.log('closeDialog', this.model)
    this.router.navigate(['/library'])
  }

  submit() {
    console.log('submit', this.model)
    if (this.model.id !== undefined) {
      this.taskTemplateService.updateTaskTemplate(this.model).subscribe(
        value => this.router.navigate(['/library'])
      )
    } else {
      this.taskTemplateService.createTaskTemplate(this.model).subscribe(
        value => this.router.navigate(['/library'])
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
