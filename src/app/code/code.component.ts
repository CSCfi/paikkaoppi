import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

import { TaskService } from '../service/task.service'

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css']
})
export class CodeComponent {
  codeLength = 5
  model: NewTaskModel = new NewTaskModel(new Array(this.codeLength))
  formError: string
  codePasted = false
  
  constructor(
    private router: Router,
    private taskService: TaskService) { }

  setKeyIfOk(index: number, key: string) {
    this.formError = null
    
    if (this.isSupportedKey(key)) {
      this.model.code[index] = key

      if (index < 4) {
        document.getElementById('code' + (index + 1)).focus()
      }

      this.codeChanged()
    
    } else {
      this.model.code.splice(index, 1, "")
      this.model.code = Array.from(this.model.code)
    }
  }

  handlePaste(e: any) {
    const content = e.clipboardData.getData('text/plain').trim()
    if (this.isSupportedCode(content)) {
      for (let i = 0; i < content.length; i++) {
        this.model.code[i] = content.charAt(i)
      }
      console.log('code pasted:', content)
      this.codeChanged()
    }

    this.codePasted = true
    e.preventDefault()
  }

  codeChanged() {
    this.formError = null
    if (this.model.getFullCode().length === 5) {
      console.log('codeChanged', this.model.getFullCode())
      this.addTask()
    }
  }

  private isSupportedCode(code: string) {
    if (code == null || code === '' || code.length !== 5) {
      return false
    }

    for (let i = 0; i < code.length; i++) {
      if (!this.isSupportedKey(code.charAt(i))) {
        return false
      }
    }

    return true
  }

  private isSupportedKey(key: string) {
    return key.length === 1 && !key.match(/[^0-9a-z]/i)
  }

  handleSpecialKey(index: number, key: string) {
    if (key === 'ArrowLeft' || key === 'Backspace') {
      if (index > 0) {
        document.getElementById('code' + (index - 1)).focus()
      }
      return true
    
    } else if (key === 'ArrowRight') {
      if (index < 4) {
        document.getElementById('code' + (index + 1)).focus()
      }
      return true
    
    } else if (key === 'Shift' || key === 'Control' || key === 'Meta' || key === 'Tab') {
      return true
    
    } else if (key === 'Escape') {
      this.formError = null
      for (let i = 0; i < this.model.code.length; i++) {
        this.model.code[i] = ""
      }
      document.getElementById('code0').focus()
      return true
    
    } else if (this.codePasted) {
      this.codePasted = false
      return true
    }
    
    return false
  }

  private addTask() {
    const code = this.model.getFullCode()
    console.log('addTask():', code)
    this.formError = null
    this.taskService.addTaskWithCode(code)
      .subscribe(
      (data) => {
        this.model = new NewTaskModel(new Array(this.codeLength))
        this.router.navigate(['/dashboard', data.id])
      },
      (err) => {
        this.formError = 'not found'
        console.info('Failed to add task with code:', code, '. Reason was:', err)
      })
  }
}

export class NewTaskModel {
  code: string[]

  constructor(code: string[]) {
    this.code = code
  }

  getFullCode(): string {
    return this.code.join('').replace(/\s/g, '').toUpperCase()
  }
}
