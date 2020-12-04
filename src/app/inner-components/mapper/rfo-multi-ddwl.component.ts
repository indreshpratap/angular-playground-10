import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from "@angular/core";
import { InputDropdownComponent } from "./input-dropdown.component";

@Component({
  selector: "rfo-multi-ddwl",
  templateUrl: "./rfo-multi-ddwl.component.html",
  styleUrls: ["./rfo-multi-ddwl.component.scss"]
})
export class RfoMultiDdwlComponent implements OnInit, AfterViewInit {
   @Input() ddwlRef: InputDropdownComponent;
  ddwlData = {};
  valuesAsString = null;
  @Input() value = null;
  @Input() options = [];
  @Input() allowClear =false;

  @Input() row: any;
  @Input() rule: any;
  @Input() placeholder;
  @Input() key: string;

  @Output() selChange = new EventEmitter();

  constructor(private el: ElementRef) {}
  ngAfterViewInit(): void {}

  ngOnInit() {
    this.updateLabel();
  }

  @HostListener("click")
  clickListener() {
    const re = this.el.nativeElement.getBoundingClientRect();
    setTimeout(() => {
      this.ddwlData = { options: this.options, value: this.value };
      this.ddwlRef.show(re, this.ddwlData, this.onChangeCallback);
    }, 100);
  }

  clearSelection($event:MouseEvent){
    $event.stopPropagation();
    this.value = null;
    this.valuesAsString=null;
    this.selChange.emit(this.value);
  }

  onChangeCallback = event => {
    this.value = event.value;
    this.updateLabel();
    this.selChange.emit(this.value);
  };

  updateLabel() {
    if (this.value && this.options && this.value.length) {
      let label = "";
      for (let i = 0; i < this.value.length; i++) {
        const itemLabel = this.findLabelByValue(this.value[i]);
        if (itemLabel) {
          if (label.length > 0) {
            label = label + ", ";
          }
          label = label + itemLabel;
        }
      }

      this.valuesAsString = label;
    } else {
      this.valuesAsString = this.placeholder || "Choose";
    }
  }

  findLabelByValue(val: any): string {
    let label = null;
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const optionValue = option.value;

      if (val === optionValue) {
        label = option.label;
        break;
      }
    }
    return label;
  }
}
