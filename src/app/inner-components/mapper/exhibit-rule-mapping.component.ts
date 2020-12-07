import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
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

  // @depreceted
  handleResChangeOld(
    value: string[],
    row: ExhibitResponseRule,
    rowIndex: number
  ) {
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

  handleRuleTypeChange(value: number[], rule: RuleMapping, row) {
    this.validateDuplicateMapping(rule, row);
    rule.exhibitResponseRuleId = value[0];
  }
  handleProduct1Change(value: number[], rule: RuleMapping, row) {
    this.validateDuplicateMapping(rule, row);
    if (this.isListNotEmpty(value) && value[0] === -1) {
      rule.p2Disabled = true;
      rule.productRuleMappings2 = [];
      rule.exhibitResponseLogicId = null;
    } else {
      rule.p2Disabled = false;
    }
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

  validateConflictingRuleSubset(ruleToValidate, oldRule) {
    if (
      oldRule.exhibitResponseRuleId === ruleToValidate.exhibitResponseRuleId
    ) {
      return;
    }

    const productListRulesToValidate = this.getProductIdsOrOREmpty(
      ruleToValidate
    );
    const productListOldRule = this.getProductIdsOrOREmpty(oldRule);

    console.log("productListRulesToValidate=>", productListRulesToValidate);
    console.log("productListOldRule=>", productListOldRule);
    /**
     * Handle following rules:
     *
     * <p>
     * Rule 1 : SBA > P1,P2 OR P3
     * <p>
     * Rule 2 : SNBA > P2,P3
     * </p>
     *
     * <p>
     * Rule 1 : SNBA > P1 OR P3
     * <p>
     * Rule 2 : SBA > P1,P3 OR P2
     * </p>
     *
     */

    if (this.isListNotEmpty(productListRulesToValidate)) {
      let arr = [];
      productListRulesToValidate.forEach(element => {
        let testArr = productListOldRule.filter(
          item => item.productId === element.productId
        );
        if (this.isListNotEmpty(testArr)) {
          arr.push(...testArr);
        }
      });
      if (this.isListNotEmpty(arr)) {
        const conflicting = true;
        console.log("conflicting=>", conflicting);
      }
    }

    /**
     * Handle following rules:
     *
     * <p>
     * Rule 1 : SBA > P1,P2 AND P3
     * <p>
     * Rule 2 : SNBA > P1,P2,P3
     * </p>
     *
     * <p>
     * Rule 1 : SBA > P1 AND P3
     * <p>
     * Rule 2 : SNBA > P1,P2,P3
     * </p>
     *
     * <p>
     * Rule 1 : SBA > P1,P2 AND P3
     * <p>
     * Rule 2 : SNBA > P2,P3
     * </p>
     *
     * <p>
     * Rule 1 : SBA > P1,P2,P4 AND P3,P5
     * <p>
     * Rule 2 : SNBA > P2,P3,P6
     * </p>
     */

    if (
      oldRule.exhibitResponseLogicId === ruleToValidate.exhibitResponseLogicId
    )
      return;

    this.validateConflictingRuleWhenORAndAND(
      ruleToValidate,
      oldRule,
      productListRulesToValidate
    );

    /**
     * Handle following rules:
     *
     * <p>
     * Rule 1 : SNBA > P1,P2,P3
     * <p>
     * Rule 2 : SBA > P1,P2 AND P3
     * </p>
     *
     * <p>
     * Rule 1 : SNBA > P1,P2,P3
     * <p>
     * Rule 2 : SBA > P1 AND P3
     * </p>
     *
     * <p>
     * Rule 1 : SNBA > P2,P3
     * <p>
     * Rule 2 : SBA > P1,P2 AND P3
     * </p>
     *
     * <p>
     * Rule 1 : SNBA > P2,P3,P6
     * <p>
     * Rule 2 : SBA > P1,P2,P4 AND P3,P5
     * </p>
     */
    this.validateConflictingRuleWhenORAndAND(
      oldRule,
      ruleToValidate,
      productListOldRule
    );
  }

  validateConflictingRuleWhenORAndAND(
    rulesToValidate,
    oldRules,
    rulesToValidateProductIds
  ) {
    if (
      rulesToValidate.exhibitResponseRuleId === 2 &&
      this.isListNotEmpty(rulesToValidate)
    ) {
      let productIds1 = oldRules.productRuleMappings1.filter(
        element => element.productId
      );
      let productIds2 = oldRules.productRuleMappings2.filter(
        element => element.productId
      );

      var arr = [];
      var arr2 = [];
      rulesToValidateProductIds.forEach(element => {
        let testArr = productIds1.filter(item => item === element);
        if (this.isListNotEmpty(testArr)) {
          arr.push(...testArr);
        }

        let testArr2 = productIds2.filter(item => item === element);
        if (this.isListNotEmpty(testArr2)) {
          arr2.push(...testArr2);
        }
      });
    }
    if (this.isListNotEmpty(arr) && this.isListNotEmpty(arr2)) {
      const conflicting = true;
      console.log("conflicting=>", conflicting);
    }
  }

  getProductIdsOrOREmpty(rule) {
    let arr = [];
    if (
      rule.exhibitResponseRuleId === null ||
      rule.exhibitResponseRuleId === 2
    ) {
      const arr1 = rule.productRuleMappings2.filter(
        element => element.productId
      );
      const arr2 = rule.productRuleMappings1.filter(
        element => element.productId
      );
      if (this.isListNotEmpty(arr1)) {
        arr.push(arr1);
      }
      if (this.isListNotEmpty(arr2)) {
        arr.push(arr2);
      }
    }
    return arr;
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
      //defaultResIndex: resIndex,
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
        // this.resDdwlList.push({ label: m.id, value: m.id });
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

  private isListNotEmpty(list: any[]) {
    return list && list.length;
  }
}
