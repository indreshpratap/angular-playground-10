import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "nonDeleted"
})
export class NonDeletedPipe implements PipeTransform {
  transform(value: any[]): any {
    return value && value.length ? value.filter(v => !v.deleted) : value;
  }
}
