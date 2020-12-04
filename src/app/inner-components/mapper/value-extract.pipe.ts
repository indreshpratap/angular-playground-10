import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'valueExtract'})
export class ValueExtractPipe implements PipeTransform {
    transform(value: any[],key:string,delCheck:boolean): any {
        if(value && value.length){
            value = delCheck? value.filter(m=>!m.deleted):value;
            return value.map(m=> m[key]);
        } else {
            return [];
        }
    }
}