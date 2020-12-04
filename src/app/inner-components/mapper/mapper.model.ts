export enum InvalidType {
  DUPLICATE = 1,
  CONFLICT = 2
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
  invalidType?: InvalidType;
  isNew: boolean;
}

export interface ExhibitResponseRule {
  exhibitTemplateColumnId: number;
  exhibitResponseGroupingId?: number;
  exhibitMappingValues: ResponseValue[];
  exhibitResponseRuleMappings: RuleMapping[];
  deleted?: boolean;
  defaultRes:string;
  defaultResIndex:number;
}
