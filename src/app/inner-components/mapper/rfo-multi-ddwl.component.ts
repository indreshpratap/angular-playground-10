import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { InputDropdownComponent } from "./input-dropdown.component";

@Component({
  selector: "rfo-multi-ddwl",
  templateUrl: "./rfo-multi-ddwl.component.html",
  styleUrls: ["./rfo-multi-ddwl.component.scss"]
})
export class RfoMultiDdwlComponent implements OnInit, OnChanges {
  @Input() ddwlRef: InputDropdownComponent;
  ddwlData = {};
  valuesAsString = null;
  @Input() value = null;
  @Input() disabled = false;
  @Input() defaultValue = null;
  @Input() options = [];
  @Input() filterByValues = null;
  @Input() allowClear = false;
  @Input() allSelectedValue = null;
  @Input() dynamicOptionsFunc: Function = null;
  @Input() rowIndex: number;

  @Input() rule: any;
  @Input() placeholder;
  @Input() key: string;

  @Output() selChange = new EventEmitter();

  constructor(private el: ElementRef) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled) {
      this.updateLabel();
    }
    if (changes.value) {
      this.updateLabel();
    }
  }

  ngOnInit() {
    // this.updateLabel();
  }

  @HostListener("click")
  clickListener() {
    if (!this.disabled) {
      const re = this.el.nativeElement.getBoundingClientRect();
      setTimeout(() => {
        this.ddwlData = {
          options: this.getAvailableOptions,
          value: this.value,
          defaultValue: this.defaultValue
        };
        this.ddwlRef.show(re, this.ddwlData, this.onChangeCallback);
      }, 100);
    }
  }

  get getAvailableOptions() {
    if (this.dynamicOptionsFunc) {
      return this.dynamicOptionsFunc(this.rowIndex);
    }
    if (this.filterByValues && this.filterByValues.length) {
      if (
        this.allSelectedValue !== null &&
        this.filterByValues[0] === this.allSelectedValue
      ) {
        return this.options.filter(o => this.value.indexOf(o.value) !== -1);
      }
      return this.options.filter(
        o => this.filterByValues.indexOf(o.value) === -1
      );
    } else {
      return this.options;
    }
  }

  clearSelection($event: MouseEvent) {
    $event.stopPropagation();
    this.value = null;
    this.valuesAsString = null;
    this.selChange.emit(this.value);
  }

  onChangeCallback = event => {
    this.value = event.value;
    if (event.selectAll) {
      this.valuesAsString = "All";
    } else {
      this.updateLabel();
    }
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
      this.valuesAsString = this.placeholder || null;
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
