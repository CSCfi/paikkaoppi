import { Injectable } from '@angular/core';

import { Task, TaskTemplate } from './model'

@Injectable()
export class TaskTemplateService {
  templates: TaskTemplate[] = []

  constructor() {
    this.templates.push(
      {
        id: 1,
        name: "Lempipaikkani",
        title: "Merkitse lempipaikkasi",
        description: "Opettele kartan käyttöä. Etsi kartalta oma lempipaikkasi. Merkitse kartalle valitsemasi paikka ja kerro miksi se on sinulle tärkeä.",
        instructions: [
          { name: "Harjoittele kartan liikuttamista", description: "Liikuta karttaa eri ilmansuuntiin." },
          { name: "Harjoittele kartan suurentamista ja pienentämistä", description: "Tutki karttaan eri mittaasteikoilla ja huomaa mitä pienempi mitta-asteikko on, sitä tarkemmin tietoja näkee." },
          { name: "Etsi ja merkitse suosikkipaikkasi", description: "Etsi suosikki paikkasi ja valitse sopiva mitta-asteikko, jotta paikannat sen tarkasti. Valitse paikan merkitsemis työkalu ja merkitse paikka." }
        ],
        info: "Tämä tehtävä sopii kaikille",
        tags: ["Maantieto"]
      })
    this.templates.push(
      {
        id: 2,
        name: "Suomi-visa",
        title: "Merkitse 5 suurinta kaupunkia",
        description: "Opettele kartan käyttöä. Etsi kartalta viisi suurinta kaupunkia ja merkitse niiden sijainnit.",
        instructions: [
          { name: "Etsi 1. suurin kaupunki", description: "Merkitse se kartalle." },
          { name: "Etsi 2. suurin kaupunki", description: "Merkitse se kartalle." },
          { name: "Etsi 3. suurin kaupunki", description: "Merkitse se kartalle." },
          { name: "Etsi 4. suurin kaupunki", description: "Merkitse se kartalle." },
          { name: "Etsi 5. suurin kaupunki", description: "Merkitse se kartalle." },
        ],
        info: "Tehtävä sopii ala- ja yläkouluun sekä lukioon maantieteen ja ympäristöopin tunneille.",
        tags: ["Maantieto"]
      })
  }

  getTaskTemplates(): Promise<TaskTemplate[]> {
    return Promise.resolve(this.templates)
  }

  getTaskTemplate(id: number): Promise<TaskTemplate> {
    return Promise.resolve(this.templates.find(t => t.id == id))
  }
}
