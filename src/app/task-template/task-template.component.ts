import { Observable } from 'rxjs/Rx';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TaskTemplateService } from '../service/task-template.service';
import { OpsService } from '../service/ops.service';
import { Component, OnInit } from '@angular/core';
import { Grade, Instruction, Subject, Target, ContentArea, TaskTemplate, WideKnowledge } from '../service/model';

@Component({
  selector: 'app-task-template',
  templateUrl: './task-template.component.html',
  styleUrls: ['./task-template.component.css']
})
export class TaskTemplateComponent implements OnInit {
  model: any
  ops: any = {}
  selectedOps: any
  phase = 1
  firstPhase = 1
  lastPhase = 3
  secondSubjectTitle = 'Oppiaineen tarkenne'
  secondSubjectSelectTitle = 'Valitse oppiaine'

  constructor(
    private taskTemplateService: TaskTemplateService,
    private opsService: OpsService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    console.log('ngOnInit')
    this.phase = 1
    this.initOps()
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
    this.setOpsToModel()
    
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

  next(updateOps: boolean) {
    console.log('next', this.model)
    if (updateOps) this.setOpsToModel()
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

  selectGrade(grade: Grade): void {
    this.initOps()
    this.ops.firstSubjects = []
    this.ops.secondSubjects = []
    this.ops.thirdSubjects = []
    this.ops.targets = []
    this.ops.contentAreas = []
    this.ops.wideKnowledges = []

    if (grade == null) {
      return
    }
    
    this.opsService.getSubjects(grade.id).subscribe(
      value => {
        this.ops.firstSubjects = value.filter(subject => subject.parent == null)
        this.selectedOps.grade = grade
      }
    )

    this.opsService.getWideKnowledges(grade.id).subscribe(
      value => {
        this.ops.wideKnowledges = value
      }
    )

    if (grade.name === 'Lukio') {
      this.secondSubjectTitle = 'Oppiaineen tarkenne / kurssi'
      this.secondSubjectSelectTitle = 'Valitse oppiaine / kurssi'
    }
  }

  selectWideKnowledge(wideKnowledge: WideKnowledge): void {
    this.selectedOps.wideKnowledge = wideKnowledge
  }

  selectFirstSubject(subject: Subject): void {
    if (this.initSubjects("first", subject)) {
      return
    }
    
    this.opsService.getSubject(subject.id).subscribe(
      value => {
        this.ops.secondSubjects = value.childs
        this.selectedOps.firstSubject = subject
        this.initTargetsAndContentAreas(subject.id)
      }
    )
  }

  selectSecondSubject(subject: Subject): void {
    if (this.initSubjects("second", subject)) {
      this.selectFirstSubject(this.selectedOps.firstSubject)
      return
    }

    this.opsService.getSubject(subject.id).subscribe(
      value => {
        this.ops.thirdSubjects = value.childs
        this.selectedOps.secondSubject = subject
        this.initTargetsAndContentAreas(subject.id)
      }
    )
  }

  selectThirdSubject(subject: Subject): void {
    if (this.initSubjects("third", subject)) {
      this.selectSecondSubject(this.selectedOps.secondSubject)
      return
    }

    this.selectedOps.thirdSubject = subject
    this.initTargetsAndContentAreas(subject.id)
  }

  selectTarget(target: Target): void {
    this.selectedOps.target = target
  }

  selectContentArea(contentArea: ContentArea): void {
    this.selectedOps.contentArea = contentArea
  }

  removeGrade(gradeId: number): void {
    this.model.ops.grades = this.model.ops.grades.filter(grade => grade.id !== gradeId)
  }

  removeSubject(subjectId: number): void {
    this.model.ops.subjects = this.model.ops.subjects.filter(subject => subject.id !== subjectId)
  }

  removeTarget(targetId: number): void {
    this.model.ops.targets = this.model.ops.targets.filter(target => target.id !== targetId)
  }

  removeContentArea(contentAreaId: number): void {
    this.model.ops.contentAreas = this.model.ops.contentAreas.filter(contentArea => contentArea.id !== contentAreaId)
  }

  removeWideKnowledge(wideKnowledgeId: number): void {
    this.model.ops.wideKnowledges = this.model.ops.wideKnowledges.filter(wideKnowledge => wideKnowledge.id !== wideKnowledgeId)
  }

  addNewOps(): void {
    this.setOpsToModel()
  }

  private isNull(value: any) {
    return value === undefined || value == null || value === 'null' || value === ''
  }

  private initOps() {
    this.selectedOps = {
      grade: null,
      firstSubject: null,
      secondSubject: null,
      thirdSubject: null,
      target: null,
      contentArea: null,
      wideKnowledge: null
    }
  }

  private setOpsToModel() {
    if (this.model.ops === undefined) {
      this.model.ops = {
        grades: [],
        subjects: [],
        targets: [],
        contentAreas: [],
        wideKnowledges: [],
      }
    }
    
    this.addIfNotExists(this.selectedOps.grade, this.model.ops.grades)
    this.addIfNotExists(this.selectedOps.firstSubject, this.model.ops.subjects)
    this.addIfNotExists(this.selectedOps.secondSubject, this.model.ops.subjects)
    this.addIfNotExists(this.selectedOps.thirdSubject, this.model.ops.subjects)
    this.addIfNotExists(this.selectedOps.target, this.model.ops.targets)
    this.addIfNotExists(this.selectedOps.contentArea, this.model.ops.contentAreas)
    this.addIfNotExists(this.selectedOps.wideKnowledge, this.model.ops.wideKnowledges)
  }

  private addIfNotExists(obj: any, list: any) {
    if (obj != null && !list.some(it => it.id === obj.id)) {
      list.push(obj)
    }
  }

  private initTargetsAndContentAreas(subjectId: number) {
    const grade = this.selectedOps.grade
    
    this.opsService.getTargets(grade.id, subjectId).subscribe(
      targets => {
        this.ops.targets = targets
      }
    )

    this.opsService.getContentAreas(grade.id, subjectId).subscribe(
      contentAreas => {
        this.ops.contentAreas = contentAreas
      }
    )
  }

  private initSubjects(level: string, subject: Subject): boolean {
    if (subject == null) {
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
      type: 'INVESTIGATE',
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
