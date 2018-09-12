import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'lineBreak' })
export class LineBreakPipe implements PipeTransform {
  transform(value: string): string {
    const stripedHtml = value.replace(/<[^>]+>/g, '');
    return stripedHtml.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }
}
