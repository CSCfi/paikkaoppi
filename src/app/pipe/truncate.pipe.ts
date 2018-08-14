import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'limitTo' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, length: string): string {
    const limit = length ? parseInt(length, 10) : 30;
    const trail = '...';

    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
