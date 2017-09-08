import { Injectable } from '@angular/core';

import { Task, TaskTemplate } from './model'

@Injectable()
export class TaskTemplateService {
  templates: TaskTemplate[] = []

  constructor() { 
    this.templates.push({name: "Lempipaikkani", title: "Merkitse lempipaikkasi", description: "Opettele kartan käyttöä. Etsi kartalta oma lempipaikkasi. Merkitse kartalle valitsemasi paikka ja kerro miksi se on sinulle tärkeä.", info: "Tämä tehtävä sopii kaikille"})
    this.templates.push({name: "Suomi-visa", title: "Merkitse 5 suurinta kaupunkia", description: "Opettele kartan käyttöä. Etsi kartalta viisi suurinta kaupunkia ja merkitse niiden sijainnit.", info: "Tämä tehtävä sopii lukiolaisille"})
  }

  getTaskTemplates() : TaskTemplate[] {
    return this.templates
  }
}