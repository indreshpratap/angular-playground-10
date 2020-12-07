import { ExhibitResponseRule, InvalidType, RuleMapping } from "./mapper.model";
export const RULE_ERROR = {
  1: "Duplicate Rule",
  2: "Conflict Rule",
  3: "Required"
};

export function isListNotEmpty(list: any[]) {
  return list && list.length;
}
export function validateAllOnSave(mappedData) {
  const exhibits = mappedData.exhibitResponseRules as Array<
    ExhibitResponseRule
  >;
  let hasError = false;
  if (isListNotEmpty(exhibits)) {
    for (let row of exhibits) {
      const mappings = row.exhibitResponseRuleMappings;
      if (isListNotEmpty(mappings)) {
        for (let i = 0; i < mappings.length; i++) {
          const rule = mappings[i];
          runValidationOnChange(row, rule, i);
          if (!hasError && rule.errorMsg) {
            hasError = true;
          }
        }
      }
    }
  }
  return hasError;
}

// todo:
function hasErrors(exhibits: ExhibitResponseRule[]) {
  for (let ri = 0; ri < exhibits.length; ri++) {}
}

export function runValidationOnChange(
  row: ExhibitResponseRule,
  ruleToValidate: RuleMapping,
  ruleToValidateIndx: number
) {
  let hasError =
    ruleToValidateIndx === 0 ? validateForRequired(ruleToValidate) : false;
  const mappings = row.exhibitResponseRuleMappings;
  // setting sort and string for products
  mappings.forEach(m => normalizeProducts(m));
  const rulesLength = mappings.length;
  if (!hasError && rulesLength > 1) {
    // starts from postion 1
    for (let i = 1; i < rulesLength; i++) {
      runConflictAndDuplicateChecking(i, mappings);
    }
  }
}

function runConflictAndDuplicateChecking(index: number, rules: RuleMapping[]) {
  // exact position to validate against top to before that position
  const ruleToValidate = rules[index];
  ruleToValidate.errorMsg = null;
  if (ruleToValidate.deleted || !hasRequiredValues(ruleToValidate)) {
    return;
  }
  // validate against top to before position
  for (let i = 0; i < index; i++) {
    const againstRule = rules[i];
    if (
      againstRule.deleted ||
      againstRule.errorMsg ||
      !hasRequiredValues(againstRule)
    ) {
      continue; // skip if it has error or not required values
    }
    let hasError = validateForRequired(ruleToValidate);
    if (hasError) {
      break;
    }
    hasError = validateDuplicateRuleExactMatch(ruleToValidate, againstRule);
    if (hasError) {
      break;
    }

    hasError = validateConflictingRuleExactMatch(ruleToValidate, againstRule);
    if (hasError) {
      break;
    }
    hasError = validateConflictingRuleSubset(ruleToValidate, againstRule);
    if (hasError) {
      break;
    }
  }
}

function hasRequiredValues(rule: RuleMapping) {
  return (
    rule.exhibitResponseRuleId &&
    rule.productRuleMappings1 &&
    rule.productRuleMappings1.length
  );
}

function validateForRequired(r: RuleMapping) {
  let hasError = false;
  if (
    !r.exhibitResponseRuleId ||
    (!r.productRuleMappings1.length &&
      (r.exhibitResponseLogicId || r.productRuleMappings2.length))
  ) {
    r.errorMsg = RULE_ERROR[InvalidType.REQUIRED];
    return hasError;
  } else {
    r.errorMsg = null;
  }
  return hasError;
}

function validateDuplicateRuleExactMatch(r1: RuleMapping, r2: RuleMapping) {
  const isRuleEqual =
    r2.exhibitResponseLogicId === r1.exhibitResponseLogicId &&
    r1.exhibitResponseRuleId === r2.exhibitResponseRuleId;

  const isProductsEqual =
    (r2.p1AsString === r1.p1AsString && r2.p2AsString === r1.p2AsString) ||
    (r2.p2AsString === r1.p1AsString && r2.p1AsString === r1.p2AsString);
  const hasError = isRuleEqual && isProductsEqual;
  if (hasError) {
    r1.errorMsg = RULE_ERROR[InvalidType.DUPLICATE];
  }
  return hasError;
}

function validateConflictingRuleExactMatch(r1, r2) {
  if (r2.exhibitResponseLogicId === r1.exhibitResponseLogicId) {
    return;
  }

  const isRuleEqual = r1.exhibitResponseRuleId === r2.exhibitResponseRuleId;

  const isProductsEqual =
    (r2.p1AsString === r1.p1AsString && r2.p2AsString === r1.p2AsString) ||
    (r2.p2AsString === r1.p1AsString && r2.p1AsString === r1.p2AsString);

  const conflicting = isRuleEqual && isProductsEqual;
  if (conflicting) {
    r1.errorMsg = RULE_ERROR[InvalidType.CONFLICT];
  }
  return conflicting;
}

function validateConflictingRuleSubset(r1: RuleMapping, r2: RuleMapping) {
  if (r1.exhibitResponseRuleId === r2.exhibitResponseRuleId) {
    return;
  }

  const productListR1 = r1.combinedProducts;
  const productListR2 = r2.combinedProducts;

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

  if (isListNotEmpty(productListR1)) {
    let entries = productListR2.filter(
      item => productListR1.indexOf(item) !== -1
    );
    if (isListNotEmpty(entries)) {
      r1.errorMsg = RULE_ERROR[InvalidType.CONFLICT];
      return true;
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

  if (r2.exhibitResponseLogicId === r1.exhibitResponseLogicId) {
    return;
  }

  const hasError = validateConflictingRuleWhenORAndAND(
    r1,
    r2,
    productListR1,
    r1
  );
  if (hasError) {
    return hasError;
  }
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

  validateConflictingRuleWhenORAndAND(r2, r1, productListR2, r1);
}

function validateConflictingRuleWhenORAndAND(
  rulesToValidate: RuleMapping,
  oldRules: RuleMapping,
  rulesToValidateProductIds: number[],
  errorMarker: RuleMapping
) {
  if (
    rulesToValidate.exhibitResponseRuleId === 2 &&
    isListNotEmpty(rulesToValidate.productRuleMappings2)
  ) {
    let productIds1 = oldRules.productRuleMappings1.map(
      element => element.productId
    );
    let productIds2 = oldRules.productRuleMappings2.map(
      element => element.productId
    );

    let arr = productIds1.filter(
      item => rulesToValidateProductIds.indexOf(item) !== -1
    );

    let arr2 = productIds2.filter(
      item => rulesToValidateProductIds.indexOf(item) !== -1
    );

    if (isListNotEmpty(arr) && isListNotEmpty(arr2)) {
      errorMarker.errorMsg = RULE_ERROR[InvalidType.CONFLICT];
      return true;
    } else {
      return false;
    }
  }
  return false;
}

function combineP1AndP2ForLogicOR(rule: RuleMapping) {
  let arr: number[] = [];

  // blank or OR logic check
  if (
    rule.exhibitResponseLogicId === null ||
    rule.exhibitResponseLogicId === 2
  ) {
    const arr1 = rule.productRuleMappings2.map(element => element.productId);
    const arr2 = rule.productRuleMappings1.map(element => element.productId);
    if (isListNotEmpty(arr1)) {
      arr.push(...arr1);
    }
    if (isListNotEmpty(arr2)) {
      arr.push(...arr2);
    }
  }
  return arr;
}

function normalizeProducts(rule: RuleMapping) {
  if (rule.deleted) {
    return;
  }
  if (isListNotEmpty(rule.productRuleMappings1)) {
    rule.p1SortedValue = rule.productRuleMappings1.map(m => m.productId).sort();
    rule.p1AsString = JSON.stringify(rule.p1SortedValue);
  }
  if (isListNotEmpty(rule.productRuleMappings2)) {
    rule.p2SortedValue = rule.productRuleMappings2.map(m => m.productId).sort();
    rule.p2AsString = JSON.stringify(rule.p1SortedValue);
  }
  rule.combinedProducts = combineP1AndP2ForLogicOR(rule);
}
