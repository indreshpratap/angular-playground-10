export enum InvalidType {
  DUPLICATE = 1,
  CONFLICT = 2,
  REQUIRED = 3
}
export interface ResponseValue {
  deleted?: boolean;
  name: string;
  id: string;
}

export interface MappedProduct {
  productId: number;
  exhibitResponseProductRuleMappingId?: number;
  exhibitResponseRuleMappingId?: number;
}

export interface RuleMapping {
  exhibitResponseRuleId: number;
  exhibitResponseLogicId: number;
  exhibitResponseGroupingId?: number;
  exhibitResponseRuleMappingId?: number;
  productRuleMappings1: MappedProduct[];
  productRuleMappings2: MappedProduct[];
  deleted?: boolean;
  errorMsg?:string;
  isNew: boolean;
// for ui only
  p2Disabled?: boolean;
  p1SortedValue?: number[];
  p1AsString?: string;
  p2SortedValue?: number[];
  p2AsString?: string;
  combinedProducts?:number[]
}

export interface ExhibitResponseRule {
  exhibitTemplateColumnId: number;
  exhibitResponseGroupingId?: number;
  exhibitMappingValues: ResponseValue[];
  exhibitResponseRuleMappings: RuleMapping[];
  deleted?: boolean;
  defaultRes: string;
  // defaultResIndex:number;
}
