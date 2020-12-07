import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { isListNotEmpty, runValidationOnChange } from "./exhibit-validator";
import {
  ExhibitResponseRule,
  MappedProduct,
  ResponseValue,
  RuleMapping
} from "./mapper.model";

@Component({
  selector: "exhibit-rule-mapping",
  templateUrl: "./exhibit-rule-mapping.component.html",
  styleUrls: ["./exhibit-rule-mapping.component.scss"]
})
export class ExhibitRuleMappingComponent implements OnInit, OnChanges {
  @Input() productList = [];
  @Input() mappedData: any;
  @Output() saveDisable = false;

  resDdwlList: Array<{ label: string; value: any }>;
  // ruleList: ExhibitResponseRule[];
  logicList = [
    { value: 1, label: "AND" },
    { value: 2, label: "OR" },
    { value: 3, label: "AND/OR" }
  ];

  ruleTypeList = [
    {
      value: 1,
      label: "Should be applied if"
    },
    { value: 2, label: "Should not be applied if" }
  ];
  private _mappingList: Array<{ id: string; default: boolean; name: string }>;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mappedData && changes.mappedData.currentValue) {
      this.setMappingList();
      this.setResListDdwl();
      if (!isListNotEmpty(this.mappedData.exhibitResponseRules)) {
        this.createRuleForEachRes();
      } else {
      }
    }
  }

  ngOnInit() {
    // this.setMappingList();
    // this.createRuleForEachRes();
  }

  closeDdwl(el: HTMLElement) {
    el.style.display = "none";
  }

  checkAndSync() {}

  checkResUpdate(index: number) {
    if (!this._mappingList.length || index > this._mappingList.length - 1) {
      this.addResAndRule(index);
    } else {
      const existing = this._mappingList[index];
      const newRes = this.mappedData.mappingValueList[index];
      const duplicateEntry = this.mappedData.mappingValueList.filter(
        f => f.id === newRes.id
      ).length;

      if (duplicateEntry > 1) {
        return; // duplicate entries found no operation
      }
      if (existing.id !== newRes.id) {
        this.patchExistingResponseToNew(existing.id, newRes.id, index);
        this._mappingList[index] = { ...newRes };
        this.resDdwlList[index] = { label: newRes.id, value: newRes.id };
      }
    }
  }

  checkResDelete(index: number) {
    const existing = this._mappingList[index];
    this._mappingList.splice(index, 1);
    this.resDdwlList.splice(index, 1);
    let removeRowIndex = -1;
    let rowIndex = -1;
    for (let row of this.exhibitResponseRules) {
      ++rowIndex;
      // defaultRes check
      if (row.defaultRes === existing.id) {
        if (row.exhibitMappingValues.length === 1) {
          // and single selection
          if (!row.exhibitTemplateColumnId) {
            // if new rule then mark for row removal
            removeRowIndex = rowIndex;
            // is new then remove it
            break;
          } else {
            row.deleted = true; //if old then mark deleted
            break;
          }
        } else if (row.exhibitMappingValues.length > 1) {
          // if multiple res then
          // mark for remove res and mark anyone of them as default res
          row.exhibitMappingValues = row.exhibitMappingValues.filter(
            f => f.id !== existing.id
          );
          row.defaultRes = row.exhibitMappingValues[0].id;
        }
      } else {
        // non default res check
        const eLen = row.exhibitMappingValues.length;
        const newRes = row.exhibitMappingValues.filter(
          f => f.id !== existing.id
        );

        // checking length if not same then response removed
        if (eLen !== newRes.length) {
          row.exhibitMappingValues = newRes;
          break;
        }
      }
    }
    if (removeRowIndex !== -1) {
      this.mappedData.exhibitResponseRules.splice(removeRowIndex, 1);
    }
    // to trigger nonDelete pipe
    this.mappedData.exhibitResponseRules = [
      ...this.mappedData.exhibitResponseRules
    ];
  }

  private setMappingList() {
    this._mappingList = this.mappedData.mappingValueList
      ? this.deepCopy(this.mappedData.mappingValueList)
      : [];
  }

  deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  // @Depreceted passed as parameter to get dynamic dropdowns
  getAvailableResOptionsFn: Function = rowIndex => {
    const data = this.exhibitResponseRules;
    let allSelected = [];
    data.forEach((v, pIndex) => {
      if (pIndex !== rowIndex) {
        allSelected = [
          ...allSelected,
          ...v.exhibitMappingValues.map(m => m.id)
        ];
      }
      return this.resDdwlList.filter(r => allSelected.indexOf(r.value) === -1);
    });
  };

  get exhibitResponseRules() {
    return this.mappedData.exhibitResponseRules as Array<ExhibitResponseRule>;
  }

  addNewRule(row: ExhibitResponseRule) {
    row.exhibitResponseRuleMappings = [
      ...row.exhibitResponseRuleMappings,
      this.newRule()
    ];
  }

  deleteRule(row: ExhibitResponseRule, index: number) {
    const rule = row.exhibitResponseRuleMappings[index];
    if (!rule.isNew) {
      rule.deleted = true;
    } else {
      row.exhibitResponseRuleMappings.splice(index, 1);
    }
    const hasItem = row.exhibitResponseRuleMappings.filter(f => !f.deleted);
    if (!hasItem || !row.exhibitResponseRuleMappings.length) {
      this.addNewRule(row); // adding a blank
    } else {
      row.exhibitResponseRuleMappings = [...row.exhibitResponseRuleMappings]; // triggers nonDeleted pipe
    }
  }

  handleResChange(value: string[], row: ExhibitResponseRule, rowIndex: number) {
    row.exhibitMappingValues = value.map(v => {
      return {
        name: v,
        id: v,
        deleted: false
      };
    });

    this.findAndDeleteOrAddResponseRow(value, rowIndex);
  }

  findAndDeleteOrAddResponseRow(value: string[], currentRowIndex: number) {
    let allSelected = [];
    const data = this.exhibitResponseRules;
    data.forEach((v, pIndex) => {
      allSelected = [...allSelected, ...v.exhibitMappingValues.map(m => m.id)];
      if (pIndex !== currentRowIndex) {
        v.exhibitMappingValues.forEach(res => {
          if (value.indexOf(res.id) !== -1) {
            res.deleted = true;
          }
        });
        // filtering non-deleted response
        v.exhibitMappingValues = v.exhibitMappingValues.filter(m => !m.deleted);
        if (!v.exhibitMappingValues.length) {
          v.deleted = true;
        }
      }
    });

    this.mappedData.exhibitResponseRules = data.filter(
      d => !(d.deleted && !d.exhibitTemplateColumnId)
    );

    this._mappingList.forEach(mp => {
      if (allSelected.indexOf(mp.id) === -1) {
        this.addResponseRule(mp.id);
      }
    });
  }

  handleRuleTypeChange(
    value: number[],
    rule: RuleMapping,
    ruleIndex: number,
    row: ExhibitResponseRule
  ) {
    rule.exhibitResponseRuleId = value[0];
    runValidationOnChange(row, rule, ruleIndex);
  }
  handleProduct1Change(
    value: number[],
    rule: RuleMapping,
    ruleIndex: number,
    row: ExhibitResponseRule
  ) {
    if (isListNotEmpty(value) && value[0] === -1) {
      rule.p2Disabled = true;
      this.clearP2AndLogic(rule);
    } else {
      rule.p2Disabled = false;
    }
    rule.productRuleMappings1 = isListNotEmpty(value)
      ? value.map(v => this.toMappedProduct(v))
      : [];
    runValidationOnChange(row, rule, ruleIndex);
  }
  handleProduct2Change(
    value: number[],
    rule: RuleMapping,
    ruleIndex: number,
    row: ExhibitResponseRule
  ) {
    rule.productRuleMappings2 = isListNotEmpty(value)
      ? value.map(v => this.toMappedProduct(v))
      : [];
    runValidationOnChange(row, rule, ruleIndex);
  }
  handleLogicChange(
    value: number[],
    rule: RuleMapping,
    ruleIndex: number,
    row: ExhibitResponseRule
  ) {
    rule.exhibitResponseLogicId = value ? value[0] : null;
    runValidationOnChange(row, rule, ruleIndex);
  }

  clearP2AndLogic(rule: RuleMapping) {
    rule.productRuleMappings2 = [];
    rule.exhibitResponseLogicId = null;
    rule.p2AsString = null;
    rule.p2SortedValue = null;
  }

  

 

  saveCheck() {
    console.log(this.mappedData.exhibitResponseRules);
  }

  private setResListDdwl() {
    this.resDdwlList = this._mappingList.map(m => {
      return { label: m.id, value: m.id };
    });
  }

  private addResAndRule(index) {
    const res = this.mappedData.mappingValueList[index];
    this.resDdwlList.push({ label: res.id, value: res.id });
    this.addResponseRule(res.id);
  }

  private addResponseRule(res: string) {
    this.mappedData.exhibitResponseRules = [
      ...this.mappedData.exhibitResponseRules,
      this.newResRuleForRes(res)
    ];
  }

  private newResRuleForRes(res: string): ExhibitResponseRule {
    const segment: ExhibitResponseRule = {
      deleted: false,
      exhibitTemplateColumnId: null,
      defaultRes: res,
      exhibitMappingValues: [this.newResValue(res)],
      exhibitResponseRuleMappings: [this.newRule()]
    };
    return segment;
  }

  private newResValue(res: string): ResponseValue {
    return { deleted: false, name: res, id: res };
  }

  private createRuleForEachRes() {
    // this.reset();
    this.mappedData.exhibitResponseRules = [];
    if (this._mappingList && this._mappingList.length) {
      this._mappingList.forEach(m => {
        this.addResponseRule(m.id);
      });
    }
  }

  private newRule(): RuleMapping {
    return {
      deleted: false,
      isNew: true,
      exhibitResponseRuleId: null,
      exhibitResponseLogicId: null,
      productRuleMappings1: [],
      productRuleMappings2: [],
    };
  }

  private toMappedProduct(productId: number): MappedProduct {
    return { productId };
  }
  private reset() {
    this.resDdwlList = [];
  }

  private patchExistingResponseToNew(
    oldRes: string,
    newRes: string,
    index: number
  ) {
    for (let e of this.exhibitResponseRules) {
      debugger;
      if (e.defaultRes === oldRes) {
        e.defaultRes = newRes;
      }
      let doBreak = false;
      for (let r of e.exhibitMappingValues) {
        if (r.id === oldRes) {
          r.id = newRes;
          r.name = newRes;
          doBreak = true;
          break;
        }
      }
      if (doBreak) {
        e.exhibitMappingValues = [...e.exhibitMappingValues]; // trigger changes
        break; // breaking upper lopp
      }
    }
  }

  
}
