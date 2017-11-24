import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'decimal' })
export class DecimalPipe implements PipeTransform {
  transform(value: number, decimals: number): number {
    return +value.toFixed(decimals);
  }
}
