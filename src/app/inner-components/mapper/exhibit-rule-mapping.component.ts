import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from "@angular/core";
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

  resDdwlList: Array<{ label: string; value: any }>;
  ruleList: ExhibitResponseRule[];
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
  private _mappingList: Array<{ id: string; default: boolean }>;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mappedData && changes.mappedData.currentValue) {
      this.setMappingList();
      this.setResListDdwl();
      if (!this.isListNotEmpty(this.mappedData.exhibitResponseRules)) {
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
      if (existing.id !== newRes.id) {
        this.patchExistingRuleAndRes(existing.id, newRes.id);
      }
    }
  }
  // todo: fix delete
  checkResDelete(index: number) {}

  private setMappingList() {
    this._mappingList = this.mappedData.mappingValueList
      ? [...this.mappedData.mappingValueList]
      : [];
  }

  addNewRule(row: ExhibitResponseRule) {
    row.exhibitResponseRuleMappings.push(this.newRule());
  }
  deleteRule(row: ExhibitResponseRule, index: number) {
    const rule = row.exhibitResponseRuleMappings[index];
    if (!rule.isNew) {
      rule.deleted = true;
    } else {
      row.exhibitResponseRuleMappings.splice(index, 1);
    }
    if (!row.exhibitResponseRuleMappings.length) {
      this.addNewRule(row); // adding a blank
    }
  }

  handleResChange(value: string[], row: ExhibitResponseRule, rowIndex: number) {
    if (this.isListNotEmpty(row.exhibitMappingValues)) {
      const existing = [];
      // marking deleted
      row.exhibitMappingValues.forEach(v => {
        if (value.indexOf(v.name) === -1) {
          v.deleted = true;
        } else {
          v.deleted = false;
          existing.push(v.name);
        }
      });
      const newMapping = value
        .filter(v => existing.indexOf(v) === -1)
        .map(m => this.newResValue(m));
      row.exhibitMappingValues = [...row.exhibitMappingValues, ...newMapping];
    } else {
      row.exhibitMappingValues = value.map(v => {
        return {
          name: v,
          id: v,
          deleted: false
        };
      });
    }
    console.log("row mapper", row.exhibitMappingValues);
  }

  handleRuleTypeChange(value: number[], rule: RuleMapping, row) {
    this.validateDuplicateMapping(rule, row);
    rule.exhibitResponseRuleId = value[0];
  }
  handleProduct1Change(value: number[], rule: RuleMapping, row) {
    this.validateDuplicateMapping(rule, row);
    rule.productRuleMappings1 = this.isListNotEmpty(value)
      ? value.map(v => this.toMappedProduct(v))
      : [];
    // todo: check for available product for p2 if not then disable both logic and p2
  }
  handleProduct2Change(value: number[], rule: RuleMapping, row) {
    this.validateDuplicateMapping(rule, row);
    rule.productRuleMappings2 = this.isListNotEmpty(value)
      ? value.map(v => this.toMappedProduct(v))
      : [];
    // todo: filter the p1 dropdown based on p2 selection
  }
  handleLogicChange(value: number[], rule: RuleMapping, row) {
    this.validateDuplicateMapping(rule, row);
    rule.exhibitResponseLogicId = value ? value[0] : null;
  }

  validateDuplicateMapping(rule, row) {
    let mappingObj = this.mappedData.exhibitResponseRules.filter(
      arr => JSON.stringify(arr.exhibitMappingValues) === JSON.stringify(row)
    );
    if (this.isListNotEmpty(mappingObj)) {
      this.validateConflictingOrDuplicateRule(
        rule,
        mappingObj[0].exhibitResponseRuleMappings
      );
    }
  }

  validateConflictingOrDuplicateRule(newRule, oldRules) {
    oldRules.forEach(element => {
      this.validateDuplicateRuleExactMatch(newRule, element);
      this.validateConflictingRuleExactMatch(newRule, element);
      this.validateConflictingRuleSubset(newRule, element);
    });
  }

  validateDuplicateRuleExactMatch(ruleToValidate, oldRule) {
    const isRuleEqual =
      oldRule.exhibitResponseLogicId ===
        ruleToValidate.exhibitResponseLogicId &&
      ruleToValidate.exhibitResponseRuleId === oldRule.exhibitResponseRuleId;

    const isProductsEqual =
      (JSON.stringify(oldRule.productRuleMappings1) ===
        JSON.stringify(ruleToValidate.productRuleMappings1) &&
        JSON.stringify(oldRule.productRuleMappings2) ===
          JSON.stringify(ruleToValidate.productRuleMappings2)) ||
      (JSON.stringify(oldRule.productRuleMappings2) ===
        JSON.stringify(ruleToValidate.productRuleMappings1) &&
        JSON.stringify(oldRule.productRuleMappings1) ===
          JSON.stringify(ruleToValidate.productRuleMappings2));

    console.log(
      "isRuleEqual=>",
      isRuleEqual,
      "isProductsEqual=>",
      isProductsEqual
    );
    const duplicate = isRuleEqual && isProductsEqual;
  }

  validateConflictingRuleExactMatch(ruleToValidate, oldRule) {
    if (
      oldRule.exhibitResponseLogicId === ruleToValidate.exhibitResponseLogicId
    ) {
      return;
    }

    const isRuleEqual =
      ruleToValidate.exhibitResponseRuleId === oldRule.exhibitResponseRuleId;

    const isProductsEqual =
      (JSON.stringify(oldRule.productRuleMappings1) ===
        JSON.stringify(ruleToValidate.productRuleMappings1) &&
        JSON.stringify(oldRule.productRuleMappings2) ===
          JSON.stringify(ruleToValidate.productRuleMappings2)) ||
      (JSON.stringify(oldRule.productRuleMappings2) ===
        JSON.stringify(ruleToValidate.productRuleMappings1) &&
        JSON.stringify(oldRule.productRuleMappings1) ===
          JSON.stringify(ruleToValidate.productRuleMappings2));

    console.log(
      "isRuleEqual=>",
      isRuleEqual,
      "isProductsEqual=>",
      isProductsEqual
    );
    const conflicting = isRuleEqual && isProductsEqual;
  }

  validateConflictingRuleSubset(ruleToValidate, oldRule) {}

  saveCheck() {
    console.log(this.mappedData.exhibitResponseRules);
  }

  private clearResBasedOnSelection(value: string[], excludeIndex: number) {
    // todo: clear Res mapping based on selection
  }

  private setResListDdwl() {
    this.resDdwlList = this._mappingList.map(m => {
      return { label: m.id, value: m.id };
    });
  }

  private addResAndRule(index) {
    const res = this.mappedData.mappingValueList[index];
    this.resDdwlList.push({ label: res.id, value: res.id });
    this.addResponseRule(res.id, index);
  }

  private addResponseRule(res: string, resIndex: number) {
    this.mappedData.exhibitResponseRules.push(
      this.newResRuleForRes(res, resIndex)
    );
  }

  private newResRuleForRes(res: string, resIndex: number): ExhibitResponseRule {
    const segment: ExhibitResponseRule = {
      deleted: false,
      exhibitTemplateColumnId: null,
      defaultRes: res,
      defaultResIndex: resIndex,
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
      this._mappingList.forEach((m, i) => {
        // this.resDdwlList.push({ label: m.id, value: m.id });
        this.addResponseRule(m.id, i);
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
      invalidType: null
    };
  }

  private toMappedProduct(productId: number): MappedProduct {
    return { productId };
  }
  private reset() {
    this.resDdwlList = [];
    // this.ruleList = [];
  }

  private patchExistingRuleAndRes(oldRes: string, newRes: string) {
    // todo
  }

  private isListNotEmpty(list: any[]) {
    return list && list.length;
  }
}
