import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiModule } from '../../ui/ui.module';
import { LayoutsModule } from '../../shared/layouts/layouts.module';

import { ServicesComponent } from './services.component';
import { ServicesRoutingModule } from './services-routing.module';

import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CountryFilterComponent } from './country-filter/country-filter.component';
import { ServicesListComponent } from './services-list/services-list.component';
import { ServicesService } from 'app/core/services/store/services.service';
import { CategoryService } from 'app/core/services/store/category.service';
import { CountryService } from 'app/core/services/store/country.service';

@NgModule({
  imports: [
    CommonModule,
    ServicesRoutingModule,
    UiModule,
    LayoutsModule
  ],
  providers: [ServicesService, CategoryService, CountryService],
  declarations: [ServicesComponent, CategoriesFilterComponent, CountryFilterComponent, ServicesListComponent]
})
export class ServicesModule { }
