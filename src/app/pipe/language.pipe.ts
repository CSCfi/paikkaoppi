import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'language' })
export class LanguagePipe implements PipeTransform {
  transform(language: string): string {
    if (language === 'sv') {
      return 'Svenska'
    } else  {
      return 'Suomi'
    }
  }
}
