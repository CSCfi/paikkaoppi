import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TaskTemplateService } from '../service/task-template.service';
import { OpsService } from '../service/ops.service';
import { Component, OnInit } from '@angular/core';
import { Instruction, TaskTemplate } from '../service/model';

@Component({
  selector: 'app-task-template',
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.css']
})
export class TaskTemplateComponent implements OnInit {
  model: any
  ops: any = {}
  selectedOps: any = {}
  phase = 1
  firstPhase = 1
  lastPhase = 3

  constructor(
    private taskTemplateService: TaskTemplateService,
    private opsService: OpsService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.phase = 1

    this.initGrades()

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

  selectGrade(gradeId: number | any): void {
    if (gradeId == null || gradeId === '') {
      this.selectedOps = {}
      this.ops.firstSubjects = []
      this.ops.secondSubjects = []
      this.ops.thirdSubjects = []
      return
    }
    
    this.opsService.getSubjects(gradeId).subscribe(
      value => {
        this.ops.firstSubjects = value.filter(subject => subject.parent == null)
        this.selectedOps.grade = gradeId
      }
    )
  }

  selectFirstSubject(subjectId: number): void {
    if (this.initSubjects("first", subjectId)) {
      return
    }
    
    this.opsService.getSubject(subjectId).subscribe(
      value => {
        this.ops.secondSubjects = value.childs
        this.selectedOps.subject = subjectId
        this.initTargetsAndContentAreas(subjectId)
      }
    )
  }

  selectSecondSubject(subjectId: number): void {
    if (this.initSubjects("second", subjectId)) {
      this.selectFirstSubject(this.selectedOps.firstSubject.id)
      return
    }

    this.opsService.getSubject(subjectId).subscribe(
      value => {
        this.ops.thirdSubjects = value.childs
        this.selectedOps.secondSubject = subjectId
        this.initTargetsAndContentAreas(subjectId)
      }
    )
  }

  selectThirdSubject(subjectId: number): void {
    if (this.initSubjects("third", subjectId)) {
      this.selectSecondSubject(this.selectedOps.secondSubject.id)
      return
    }

    this.selectedOps.thirdSubject = subjectId
    this.initTargetsAndContentAreas(subjectId)
  }

  selectTarget(targetId: number): void {
    this.selectedOps.target = targetId
  }

  selectContentArea(contentAreaId: number): void {
    this.selectedOps.contentArea = contentAreaId
  }

  private initTargetsAndContentAreas(subjectId: number) {
    const gradeId = this.selectedOps.grade
    
    this.opsService.getTargets(gradeId, subjectId).subscribe(
      targets => {
        this.ops.targets = targets
      }
    )

    this.opsService.getContentAreas(gradeId, subjectId).subscribe(
      contentAreas => {
        this.ops.contentAreas = contentAreas
      }
    )
  }

  private initSubjects(level: string, subjectId: number | any): boolean {
    if (subjectId == null || subjectId === '') {
      this.initSubjectsIfNoneSelected(level)
      return true
    
    } else {
      this.initSubjectsIfValueSelected(level)
      return false
    }
  }

  private initSubjectsIfValueSelected(level: string) {
    if (level === 'first' || level === 'second') {
      this.selectedOps.thirdSubject = null
    }

    if (level === 'first') {
      this.selectedOps.secondSubject = null
      this.ops.thirdSubjects = []
    }
  }

  private initSubjectsIfNoneSelected(level: string) {
    if (level === 'first' || level === 'second' || level === 'third') {
      this.selectedOps.thirdSubject = null
    }

    if (level === 'first' || level === 'second') {
      this.selectedOps.secondSubject = null
      this.ops.thirdSubjects = []
    }

    if (level === 'first') {
      this.selectedOps.firstSubject = null
      this.selectedOps.target = null
      this.selectedOps.contentArea = null
      this.ops.secondSubjects = []
    }
  }

  private initGrades() {
    this.opsService.getGrades().subscribe(
      value => this.ops.grades = value
    )
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
