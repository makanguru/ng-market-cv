import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

//import { UiModule } from '../../ui/ui.module';

import { ServicesComponent } from './services.component';

/**
 * This page uses query parameters.
 * @param {15|30|45} [perPage=15] - The number of items to show on a page (for pagination).
 * @param {number} [page=1] - Page number (for pagination).
 * @param {number} [country] - Id of the country to filter by.
 * @param {number} [city] - Id of the city to filter by.
 * @param {'list'|'grid'} [view='grid'] - List view or grid view.
 * @param {string} [startsWith] - Activates search by the first letter in the list view.
 * @param {string} [search] - Filter by name.
 * 
 * @example 
 * // /shops/all?perPage=30&page=2&county=54
 */
const routes: Routes = [
  {
    path: '', redirectTo: 'all', pathMatch: 'full',
  },
  {
    path: ':categoryAlias', component: ServicesComponent, data: {
      meta: {
        title: 'World of Retail | Услуги и сервисы'
      }
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
  /*  UiModule,*/
    ],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }
