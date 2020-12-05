import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { HelloComponent } from "./hello.component";
import { ValueExtractPipe } from "./inner-components/mapper/value-extract.pipe";
import { ExhibitRuleMappingComponent } from "./inner-components/mapper/exhibit-rule-mapping.component";
import { RfoMultiDdwlComponent } from "./inner-components/mapper/rfo-multi-ddwl.component";
import {
  DdwlSelectItem,
  InputDropdownComponent
} from "./inner-components/mapper/input-dropdown.component";
import { NonDeletedPipe } from './inner-components/mapper/non-deleted.pipe';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [
    AppComponent,
    HelloComponent,
    ExhibitRuleMappingComponent,
    RfoMultiDdwlComponent,
    InputDropdownComponent,
    DdwlSelectItem,
    ValueExtractPipe,
    NonDeletedPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
