import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router, NavigationExtras } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';

import { PageQuery } from 'app/core/models/filters/page-query';
import { AppState } from 'app/core/ngrx/app.state';
import { PageResult } from '../../core/models/filters/page-result';
import { CatalogComponent } from '../../shared/layouts/catalog/catalog.component';
import { CategoriesFilterComponent } from './categories-filter/categories-filter.component';
import { CountryFilterComponent } from './country-filter/country-filter.component';
import { FilterTagInterface } from '../../ui/components/filters/tags/filter.tag.interface';
import { CountryModel } from 'app/core/models/store/geo/country.model';
import { CityModel } from 'app/core/models/store/geo/city.model';
import { getShops } from 'app/core/ngrx/actions/service.action';
import { ShopModel, ShopQueryModel } from 'app/core/models/store/service/service.model';
import { getCategories } from 'app/core/ngrx/actions/categories.action';
import { CategoryModel, CategoryQueryModel } from 'app/core/models/store/category/category.model';
import { QueryParamsInterface } from './query-params.interface';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(private route: ActivatedRoute,
    private title: Title,
    private router: Router,
    private store: Store<AppState>) {}

  shops: PageResult<ShopModel[]>;
  category: CategoryModel;

  view: 'list' | 'grid' = 'grid';

  /* Current not in use */
  sortBy: 'name' | 'points' | 'cashback' = 'name';

  /* Search by the first letter */
  startsWith: string;

  shopsQuery = new ShopQueryModel();

  prevQueryParams: QueryParamsInterface;

  sub = new Subscription();

  @ViewChild('catalog') catalog: CatalogComponent;
  @ViewChild('countryFilter') countryFilter: CountryFilterComponent;
  @ViewChild('categoryFilter') categoryFilter: CategoriesFilterComponent;
  @ViewChild('searchInput') searchInput: ElementRef;

  get isLoading(): boolean {
    return this.isLoadingShops;
  }

  get tags(): FilterTagInterface[] {
    return [this.filterCountry, this.filterCity].filter(v => v);
  }

  set tags(tags: FilterTagInterface[]) {
    const wasCityDeleted = this.filterCity && tags.indexOf(this.filterCity) === -1;
    if (wasCityDeleted) {
      this.filterCity = undefined;
    }
    const wasCountryDeleted = this.filterCountry && tags.indexOf(this.filterCountry) === -1;
    if (wasCountryDeleted) {
      this.filterCountry = undefined;
    }
    if (wasCountryDeleted || wasCityDeleted) {
      this.navigate();
    }
  }

  filterCountry: CountryModel | undefined;
  filterCity: CityModel | undefined;

  /* The value set in select. Does not affect filters until it's applied. */
  selectedCountry: CountryModel;
  selectedCity: CityModel;

  private isLoadingShops: boolean = true;

  readonly perPageSet = [15, 30, 45];

  // Life cicle hooks

  ngOnInit() {
    this.resetPagination();
    this.subscribeToRouteParamsChange();
    this.subscribeToQueryParamsChange();
    this.subscribeToShopsResponse();
    this.subscribeToCategoriesResponse();
    this.navigate({ skipLocationChange: true });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.subcribeToCountriesLoadedMaybe();
    }, 1);
  }

  // End life cicle hooks

  // Subscriptions

  subscribeToRouteParamsChange() {
    const sub = this.route.params.subscribe((data: Params) => {
      this.onRouteParamsChange(data);
    });
    this.sub.add(sub);
  }

  subscribeToQueryParamsChange() {
    const sub = this.route.queryParams.subscribe((data: Params) => {
      this.onQueryParamsChange(data);
    });
    this.sub.add(sub);
  }

  subscribeToShopsResponse() {
    const sub = this.store.select<any>('shops').subscribe(data => {
      if (data && !data.pending && !data.error) {
        this.onReceiveShops(data.shops);
      } else if (data.error) {
        console.warn(data, 'in shops #0');
      }
    });
    this.sub.add(sub);
  }

  subscribeToCategoriesResponse() {
    const sub = this.store.select<any>('categories').subscribe(data => {
      if (data && !data.pending && !data.error) {
        this.onReceiveCategories(data.categories.data);
      } else if (data.error) {
        console.warn(data, 'in shops #1');
      }
    });
    this.sub.add(sub);
  }

  subcribeToCountriesLoadedMaybe() {
    const hasPlaceholerCountry = this.filterCountry && this.filterCountry.name === '...';
    const hasPlaceholderCity = this.filterCity && this.filterCity.name === '...';
    const shouldSubscribe = hasPlaceholerCountry || hasPlaceholderCity;
    if (!shouldSubscribe) {
      return;
    }
    if (this.countryFilter.countries) {
      this.onReceiveCountries(this.countryFilter.countries);
      return;
    }
    const sub = this.countryFilter.countriesLoaded
      .subscribe(this.onReceiveCountries.bind(this));
  }

  // End subscriptions

  // Event listeners

  onSearch() {
    const query = this.searchInput.nativeElement.value;
    if (query) {
      this.shopsQuery.search = query;
    } else {
      delete this.shopsQuery.search;
    }
    this.navigate();
  }

  onSearchByFirstLetter(letter: string) {
    if (letter.length === 1) {
      this.shopsQuery.is_only_first_letter = 1;
      this.shopsQuery.search = letter;
      this.startsWith = letter;
    } else {
      delete this.shopsQuery.is_only_first_letter;
      delete this.shopsQuery.search;
      delete this.startsWith;
    }
    this.navigate();
  }

  onSetView(view: 'list' | 'grid') {
    const changed = view !== this.view;
    this.view = view;
    if (changed && view === 'grid' && this.startsWith) {
      delete this.shopsQuery.search;
    }
    if (view === 'grid') {
      delete this.startsWith;
    }
    this.navigate();
  }

  onApply() {
    const changed = this.filterCountry !== this.selectedCountry || this.filterCity !== this.selectedCity;
    if (!changed) {
      return;
    }
    this.resetPagination();
    this.filterCountry = this.selectedCountry;
    this.filterCity = this.selectedCity;
    this.navigate();
  }

  onReset() {
    this.filterCountry = undefined;
    this.filterCity = undefined;
    this.resetPagination();
    this.getCategory('all');
    this.navigate();
  }

  /* On pagination change */
  onPageQueryChange(pageQuery: PageQuery) {
    const hasChanges = pageQuery.page !== this.shopsQuery.page || pageQuery['per-page'] !== this.shopsQuery['per-page'];
    if (!hasChanges) {
      return;
    }
    this.shopsQuery = Object.assign(this.shopsQuery, pageQuery);
    this.navigate();
  }

  onRouteParamsChange(data: Params) {
    this.resetPagination();
    this.getCategory(data['categoryAlias']);
  }

  onQueryParamsChange(data: Params) {
    const queryParams: QueryParamsInterface = {
      page: +data.page || undefined,  // instead of NaN
      perPage: +data.perPage || undefined,
      view: data.view,
      country: +data.country || undefined,
      city: +data.city || undefined,
      startsWith: data.startsWith,
      search: data.search
    };
    this.shopsQuery.page = queryParams.page || 1;
    const hasCorrectPerPage = queryParams.perPage && this.perPageSet.indexOf(queryParams.perPage) !== -1;
    this.shopsQuery['per-page'] = hasCorrectPerPage ? queryParams.perPage : this.perPageSet[0];
    const hasLoadedCountries = this.countryFilter && this.countryFilter.countries;
    if (queryParams.country) {
      this.filterCountry = queryParams.country === -1 ?
        this.countryFilter.allCountries : new CountryModel(queryParams.country, '...');
    }
    if (queryParams.city) {
      this.filterCity = queryParams.city === -1 ?
        this.countryFilter.allCities : new CityModel(queryParams.city, '...');
    }
    if (queryParams.view) {
      this.view = queryParams.view;
      if (queryParams.view === 'list' && queryParams.startsWith) {
        this.startsWith = queryParams.startsWith;
      }
    }
    if (queryParams.search) {
      this.shopsQuery.search = queryParams.search;
    }
    if (hasLoadedCountries) {
      this.onReceiveCountries(this.countryFilter.countries);
    }
    if (this.shouldFetchShopsOnQueryParamsChange(queryParams)) {
      console.log(this.shouldFetchShopsOnQueryParamsChange(queryParams));
      this.getShops();
    }
    this.prevQueryParams = queryParams;
  }

  onReceiveCategories(categories: CategoryModel[]) {
    const alias = this.route.snapshot.params['categoryAlias'];
    const category = categories.find((c: CategoryModel) => c.alias === alias);
    this.category = category;
    this.setTitle();
    this.getShops();
  }

  onReceiveShops(shops: PageResult<ShopModel[]>) {
    this.shops = shops;
    this.isLoadingShops = false;
    this.shopsQuery.page = shops.pagination.currentPage;
    this.prevQueryParams.page = shops.pagination.currentPage;
    this.navigate();
  }

  onReceiveCountries(countries: CountryModel[]) {
    let country: CountryModel;
    let city: CityModel;
    if (this.filterCountry) {
      country = countries.find(country => country.id === this.filterCountry.id);
      if (!country) {
        country = this.countryFilter.allCountries;
      }
      if (this.filterCity) {
        city = country.cities.find(city => city.id === this.filterCity.id);
      }
    } else if (this.filterCity) {
      for (const state of countries) {
        for (const town of state.cities) {
          if (town.id === this.filterCity.id) {
            city = town;
            break;
          }
        }
      }
    }
    this.filterCountry = country;
    this.filterCity = city;
    this.selectedCountry = country;
    this.selectedCity = city;
  }

  // End event listeners

  // Helpers

  getCategory(alias: string) {
    if (alias === 'all') {
      this.category = undefined;
    } else {
      const hasLoadedCategories = this.categoryFilter && this.categoryFilter.categories;
      if (!hasLoadedCategories) {
        return;
      }
      this.category = this.categoryFilter.categories.find(c => c.alias === alias);
    }
    if (!this.categoryFilter.isLoading) {
      this.getShops();
    }
    this.setTitle();
  }

  getShops() {
    this.isLoadingShops = true;
    this.getShopsQuery();
    this.fireShopsQuery();
  }

  getShopsQuery() {
    if (this.filterCountry && this.filterCountry.id > 0) {
      this.shopsQuery.country_ids = [this.filterCountry.id];
    } else {
      delete this.shopsQuery.country_ids;
    }
    if (this.filterCity && this.filterCity.id > 0) {
      this.shopsQuery.city_ids = [this.filterCity.id];
    } else {
      delete this.shopsQuery.city_ids;
    }
    if (this.category && this.category.id) {
      this.shopsQuery.category_id = this.category.id;
    } else {
      delete this.shopsQuery.category_id;
    }
    if (this.view === 'list' && this.startsWith) {
      this.shopsQuery.is_only_first_letter = 1;
      this.shopsQuery.search = this.startsWith;
    } else {
      delete this.shopsQuery.is_only_first_letter;
    }
    this.shopsQuery.sort = this.sortBy;
  }

  fireShopsQuery() {
    this.isLoadingShops = true;
    this.store.dispatch(getShops(this.shopsQuery));
  }

  /* Change location based on current filters and pagination parameters */
  navigate(_extras: NavigationExtras = {}) {
    const alias = this.category ? this.category.alias : this.route.snapshot.params['categoryAlias'];
    const queryParams = this.collectQueryParams();
    const extras = Object.assign(_extras, { queryParams });
    this.router.navigate(['/services', alias], extras);
  }

  resetPagination() {
    this.shopsQuery.page = 1;
    this.shopsQuery['per-page'] = 15;
  }

  setTitle() {
    const name = this.category ? this.category.name : 'Все услуги';
    const title = 'World of Retail | ' + name;
    this.title.setTitle(title);
  }

  collectQueryParams(): QueryParamsInterface {
    return {
      country: this.filterCountry ? this.filterCountry.id : undefined,
      city: this.filterCity ? this.filterCity.id : undefined,
      page: this.shopsQuery.page,
      perPage: this.shopsQuery['per-page'],
      view: this.view,
      startsWith: this.startsWith,
      search: this.shopsQuery.search
    };
  }

  shouldFetchShopsOnQueryParamsChange(newParams: QueryParamsInterface): boolean {
    console.log(newParams, this.prevQueryParams);
    if (this.categoryFilter.isLoading) {
      return false;
    }
    if (!this.prevQueryParams) {
      return false;
    }
    if (newParams.page !== this.prevQueryParams.page) {
      return true;
    }
    if (newParams.perPage !== this.prevQueryParams.perPage) {
      return true;
    }
    if (newParams.city !== this.prevQueryParams.city) {
      return true;
    }
    if (newParams.country !== this.prevQueryParams.country) {
      return true;
    }
    if (newParams.search !== this.prevQueryParams.search) {
      return true;
    }
    if (newParams.startsWith !== this.prevQueryParams.startsWith) {
      return true;
    }
    return false;
  }

  // End helpers

}
