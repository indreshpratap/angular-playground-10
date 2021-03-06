import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "ddwl-select-item",
  template: `
    <li
      class="p-multiselect-item"
      (click)="onOptClick($event)"
      [attr.aria-label]="label"
      [attr.tabindex]="disabled ? null : '0'"
      [ngClass]="{ 'p-highlight': selected, 'p-disabled': disabled }"
      pRipple
    >
      <span class="lbl" [title]="label">{{ label }}</span>
      <div class="p-checkbox p-component" *ngIf="multi">
        <div class="p-checkbox-box" [ngClass]="{ 'p-highlight': selected }">
          <span
            class="p-checkbox-icon"
            [ngClass]="{ 'pi pi-check': selected }"
          ></span>
        </div>
      </div>
    </li>
  `,
  encapsulation: ViewEncapsulation.None
})
export class DdwlSelectItem {
  @Input() option: any;

  @Input() selected: boolean;

  @Input() label: any;
  @Input() multi: any;

  @Input() disabled: boolean;

  @Input() itemSize: number;

  @Output() optClick: EventEmitter<any> = new EventEmitter();

  onOptClick(event: Event) {
    this.optClick.emit({
      originalEvent: event,
      option: this.option
    });
  }
}

@Component({
  selector: "input-dropdown",
  templateUrl: "./input-dropdown.component.html",
  styleUrls: ["./input-dropdown.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class InputDropdownComponent implements OnInit {
  @Input() disabled;
  @Input() options;
  @Input() overrideOptions = false;
  @Input() defaultDisable = false;
  @Input() selectAllOption = null;
  @Input() filter = false;
  @Input() filterPlaceHolder = "Search";
  @Input() scrollHeight = 180;
  @Input() multi = true;
  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  @ViewChild("container") container: ElementRef;
  @ViewChild("itemWrapper") itemWrapper: ElementRef;

  public value: any[];

  scrollHandler: any;
  // filled = false;
  public _filteredOptions: any[];
  filterValue;
  placeholder;
  allSelected = null;
  documentClickListener;
  onChangeReceiver;
  ddwlData;

  constructor(
    public el: ElementRef,
    public renderer: Renderer2,
    public cd: ChangeDetectorRef
  ) {}

  ngOnInit() {}

  show(re, ddwlData, onChangeReceiver) {
    this.filterValue = null;
    if (this.overrideOptions) {
     // console.log(ddwlData.options);
      this.options = ddwlData.options;
    }
    this.filterOptions();
    //  console.log(re);
    if (ddwlData.value) {
      this.value = ddwlData.value;
      this.checkForSelectAll();
    }

    this.ddwlData = ddwlData;
    this.onChangeReceiver = onChangeReceiver;
    setTimeout(() => {
      this.itemWrapper.nativeElement.scrollTop = 0;
    });
    this.calcAndSetPosition(re);
    this.bindDocumentClickListener();
    this.bindScrollListener();
    this.cd.markForCheck();
  }

  calcAndSetPosition(re) {
    // debugger;
    const elm = this.container.nativeElement;
    elm.style.visibility = "hidden";

    const height = re.height;
    const x = re.left;
    let y = re.top + height;

    elm.style.transform = `translate3d(${x}px,${y}px,0px)`;
    elm.style.width = re.width + "px";
    elm.style.display = "block";
    setTimeout(() => {
      const cHeight = elm.clientHeight;
      const bottomDistance = window.innerHeight - re.bottom;
      console.log(cHeight, bottomDistance, y);
      if (bottomDistance < cHeight) {
        y = y - cHeight - height;
        elm.style.transform = `translate3d(${x}px,${y}px,0px)`;
      }
      elm.style.visibility = "visible";
    });
  }

  checkForSelectAll() {
    if (
      this.selectAllOption &&
      this.value &&
      this.value[0] === this.selectAllOption.value
    ) {
      this.allSelected = this.value[0];
    } else {
      this.allSelected = null;
    }
  }

  hide() {
    this.container.nativeElement.style.display = "none";
    this.close.emit();
    this.unbindDocumentClickListener();
    this.unbindScrollListener();
    // this.overlayVisible = false;
    // this.unbindDocumentClickListener();
    // if (this.resetFilterOnHide){
    //     this.filterInputChild.nativeElement.value = '';
    //     this._filterValue = null;
    //     this._filteredOptions = null;
    // }
    // this.onPanelHide.emit();
    // this.cd.markForCheck();
  }

  processReceivedData() {
    if (this.ddwlData) {
      if (this.ddwlData.value) {
        this.value = this.multi ? this.ddwlData.value : [this.ddwlData.value];
      }
      if (this.ddwlData.options) {
        this.options = this.ddwlData.options;
      }
    }
  }

  closeIt(event) {
    this.hide();
    event.preventDefault();
    event.stopPropagation();
  }

  get optionsToRender(): any[] {
    return this._filteredOptions || this.options;
  }

  get optionsValueOnly() {
    return this.optionsToRender.map(m => m.value);
  }

  // _filterValue;
  onFilter(event) {
    this.filterValue = event.target.value;
    this.filterOptions();
  }

  hasFilter() {
    return this.filterValue && this.filterValue.trim().length > 0;
  }

  filterOptions() {
    if (this.hasFilter() && this.options) {
      this._filteredOptions = this.filterList();
    } else {
      this._filteredOptions = null;
    }
  }

  filterList() {
    const filteredItems: any[] = [];
    const filterText = this.filterValue;
    if (this.options) {
      for (const item of this.options) {
        if (this.labelContains(item.label, filterText)) {
          filteredItems.push(item);
        }
      }
    }

    return filteredItems;
  }

  labelContains(value, filter): boolean {
    if (
      filter === undefined ||
      filter === null ||
      (typeof filter === "string" && filter.trim() === "")
    ) {
      return true;
    }

    if (value === undefined || value === null) {
      return false;
    }

    const filterValue = filter.toString().toLowerCase();
    const stringValue = value.toString().toLowerCase();

    return stringValue.indexOf(filterValue) !== -1;
  }
  isSelected(value) {
    return this.allSelected !== null || this.findSelectionIndex(value) !== -1;
  }
  findSelectionIndex(val: any): number {
    let index = -1;

    if (this.value) {
      for (let i = 0; i < this.value.length; i++) {
        if (this.value[i] === val) {
          index = i;
          break;
        }
      }
    }

    return index;
  }

  selectAllClick(event) {
    let optionValue = this.selectAllOption.value;
    //debugger;
    if (optionValue === this.allSelected) {
      this.allSelected = null;
      this.value = null;
      optionValue = null; // setting null for event trigger
    } else {
      this.allSelected = optionValue;
      this.value = [optionValue];
      //this.valuesAsString = "All";
    }

    const ev = {
      originalEvent: event.originalEvent,
      value: this.value,
      itemValue: optionValue,
      selectAll: this.allSelected !== null
    };

    // this.onChange.emit(ev);
    this.onChangeReceiver(ev);
  }
  onOptionClick(event) {
    const option = event.option;
    // if (this.isOptionDisabled(option)) {
    //     return;
    // }

    const optionValue = option.value;
    if (this.selectAllOption && this.allSelected !== null) {
      this.value = this.optionsValueOnly.filter(f => f !== optionValue);
      this.triggerSelChange(event, false);
      this.allSelected = null;
      this.cd.markForCheck();
      return;
    }
    // Default value check
    if (
      this.defaultDisable &&
      this.ddwlData.defaultValue &&
      this.ddwlData.defaultValue === optionValue
    ) {
      return false;
    }
    if (this.multi) {
      const selectionIndex = this.findSelectionIndex(optionValue);
      if (selectionIndex !== -1) {
        this.value = this.value.filter((val, i) => i !== selectionIndex);
      } else {
        this.value = [...(this.value || []), optionValue];
      }
    } else {
      this.value = [optionValue];
    }

    this.doCheckForSelectAll(event);

    if (!this.multi) {
      this.hide();
    }
  }

  triggerSelChange(event, allSelected) {
    const ev = {
      originalEvent: event.originalEvent,
      value: this.value,
      selectAll: allSelected
      //itemValue: optionValue
    };

    // this.onChange.emit(ev);
    this.onChangeReceiver(ev);
  }

  doCheckForSelectAll(event) {
    if (
      this.selectAllOption &&
      this.value.length === this.optionsToRender.length
    ) {
      const all = this.optionsValueOnly.every(
        v => this.value.indexOf(v) !== -1
      );
      if (all) {
        this.selectAllClick(event);
        return;
      }
    }
    this.triggerSelChange(event, false);
    this.cd.markForCheck();
  }

  searchOptions() {}

  /*
  writeValue(value: any): void {
    this.value = value;
    this.updateLabel();
    this.updateFilledState();

    this.cd.markForCheck();
  }
  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public onModelChange: Function = () => {};

  public onModelTouched: Function = () => {};
*/
  bindScrollListener() {
    setTimeout(() => {
      window.addEventListener("scroll", this.onScroll, true);
    }, 300);
  }

  onScroll = ev => {
    if (
      !ev.target.className ||
      ev.target.className !== "p-multiselect-items-wrapper"
    ) {
      this.hide();
    }
  };

  unbindScrollListener() {
    window.removeEventListener("scroll", this.onScroll, true);
  }

  bindDocumentClickListener() {
    setTimeout(() => {
      console.log("bind window click");
      if (!this.documentClickListener) {
        const documentTarget: any = this.el
          ? this.el.nativeElement.ownerDocument
          : "document";

        this.documentClickListener = this.renderer.listen(
          documentTarget,
          "click",
          event => {
            if (this.isOutsideClicked(event)) {
              this.hide();
            }
          }
        );
      }
    }, 400);
  }

  isOutsideClicked(event: MouseEvent): boolean {
    // || this.isOverlayClick(event)
    return !(
      this.el.nativeElement.isSameNode(event.target) ||
      this.el.nativeElement.contains(event.target)
    );
  }

  unbindDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }
}
