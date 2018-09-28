import { TaskService } from '../service/task.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../service/model';

@Component({
  selector: 'app-delete-task',
  templateUrl: './delete-task.component.html'
})
export class DeleteTaskComponent {
  @Input() model: any
  @Output() close = new EventEmitter<void>()
  @Output() delete = new EventEmitter<Task>()

  constructor(private taskService: TaskService) { }

  closeDialog() {
    this.close.next()
  }

  submit() {
    console.log('submit', this.model)
    this.taskService.deleteTask(this.model.id).subscribe(
      value => this.delete.next(value)
    )
  }
}
