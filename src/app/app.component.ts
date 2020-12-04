import { Component, VERSION } from "@angular/core";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  mappedData = {
    mappingValueList: [
      { id: "res", name: "res"  },
      { id: "abc", name: "abc"  },
      { id: "xyz", name: "xyz"  },
      { id: "usd", name: "usd"  },
      { id: "inr", name: "inr"  },
      { id: "sig", name: "sig"  }
    ],
    // exhibitResponseRules: [
    //   {
    //     deleted: false,
    //     exhibitMappingValues: [{ deleted: false, name: "res" }],
    //     exhibitResponseGroupingId: null,
    //     exhibitResponseRuleMappings: [
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 2,
    //         exhibitResponseLogicId: 2,
    //         productRuleMappings1: [{ productId: 1 }, { productId: 2 }],
    //         productRuleMappings2: [{ productId: 3 }, { productId: 4 }],
    //         invalidType: null
    //       },
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 2,
    //         exhibitResponseLogicId: null,
    //         productRuleMappings1: [{ productId: 3 }],
    //         productRuleMappings2: [],
    //         invalidType: null
    //       }
    //     ]
    //   },
    //   {
    //     deleted: false,
    //     exhibitMappingValues: [{ deleted: false, name: "abc" }],
    //     exhibitResponseGroupingId: null,
    //     exhibitResponseRuleMappings: [
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 1,
    //         exhibitResponseLogicId: 2,
    //         productRuleMappings1: [{ productId: 1 }],
    //         productRuleMappings2: [{ productId: 3 }, { productId: 1 }],
    //         invalidType: null
    //       },
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 2,
    //         exhibitResponseLogicId: 1,
    //         productRuleMappings1: [{ productId: 8 }, { productId: 9 }],
    //         productRuleMappings2: [{ productId: 8 }, { productId: 9 }],
    //         invalidType: null
    //       }
    //     ]
    //   },
    //   {
    //     deleted: false,
    //     exhibitMappingValues: [{ deleted: false, name: "xyz" }],
    //     exhibitResponseGroupingId: null,
    //     exhibitResponseRuleMappings: [
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 2,
    //         exhibitResponseLogicId: 1,
    //         productRuleMappings1: [{ productId: 1 }, { productId: 2 }],
    //         productRuleMappings2: [{ productId: 1 }, { productId: 2 }],
    //         invalidType: null
    //       }
    //     ]
    //   },
    //   {
    //     deleted: false,
    //     exhibitMappingValues: [{ deleted: false, name: "usd" }],
    //     exhibitResponseGroupingId: null,
    //     exhibitResponseRuleMappings: [
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 1,
    //         exhibitResponseLogicId: 1,
    //         productRuleMappings1: [{ productId: 1 }, { productId: 5 }],
    //         productRuleMappings2: [{ productId: 6 }, { productId: 7 }],
    //         invalidType: null
    //       }
    //     ]
    //   },
    //   {
    //     deleted: false,
    //     exhibitMappingValues: [{ deleted: false, name: "inr" }],
    //     exhibitResponseGroupingId: null,
    //     exhibitResponseRuleMappings: [
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 1,
    //         exhibitResponseLogicId: 3,
    //         productRuleMappings1: [{ productId: 1 }],
    //         productRuleMappings2: [{ productId: 2 }, { productId: 1 }],
    //         invalidType: null
    //       }
    //     ]
    //   },
    //   {
    //     deleted: false,
    //     exhibitMappingValues: [{ deleted: false, name: "sig" }],
    //     exhibitResponseGroupingId: null,
    //     exhibitResponseRuleMappings: [
    //       {
    //         deleted: false,
    //         exhibitResponseRuleMappingId: null,
    //         exhibitResponseGroupingId: null,
    //         exhibitResponseRuleId: 2,
    //         exhibitResponseLogicId: 3,
    //         productRuleMappings1: [{ productId: 1 }],
    //         productRuleMappings2: [{ productId: 1 }],
    //         invalidType: null
    //       }
    //     ]
    //   }
    // ]
  };
  productList = [
    { label: "Product 1", value: 1 },
    { label: "Product 2", value: 2 },
    { label: "Product 3", value: 3 },
    { label: "Product 4", value: 4 },
    { label: "Product 5", value: 5 },
    { label: "Product 6", value: 6 },
    { label: "Product 7", value: 7 },
    { label: "Product 8", value: 8 },
    { label: "Product 9", value: 9 },
    { label: "Product 10", value: 10 }
  ];

  add() {
    this.mappedData.mappingValueList.push({ id: null,name:null });
  }
}
