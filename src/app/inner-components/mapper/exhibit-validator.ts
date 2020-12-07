import { ExhibitResponseRule, InvalidType,  RuleMapping } from "./mapper.model";

export function validateAllOnSave(){

}


export function checkOnChange(resRule:ExhibitResponseRule,ruleToValidate:RuleMapping,ruleToValidateIndx:number){
validateForRequired(ruleToValidate)
}


function runRuleForResponse(resRule:ExhibitResponseRule,ruleToValidate:RuleMapping,ruleToValidateIndx:number){
for(let rule of resRule.exhibitResponseRuleMappings){
  
}
}


function validateForRequired(ruleToValidate:RuleMapping){
  let hasError = false;
  if(!ruleToValidate.exhibitResponseRuleId || !ruleToValidate.productRuleMappings1.length && (ruleToValidate.exhibitResponseLogicId || ruleToValidate.productRuleMappings2.length)){
    ruleToValidate.invalidType = InvalidType.REQUIRED;
    return hasError;
  }
  return hasError;
}
