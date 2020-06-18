import { ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthInterceptor } from 'app/core/interceptors/auth.interceptor';
import { SessionInterceptor } from 'app/core/interceptors/session.interceptor';

import { LayoutsModule } from './layouts/layouts.module';
import { SharedMetaModule } from './shared-meta';
import { TransferHttpModule } from './transfer-http';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ROOT_REDUCER } from 'app/core/ngrx/reducers/reducer';
import { AuthService } from 'app/core/services/auth.service';
import { ROOT_EFFECTS } from 'app/core/ngrx/effects';
import { BrandService } from 'app/core/services/store/brand.service';
import { CouponsService } from 'app/core/services/store/coupons.service';
import { CountryService } from 'app/core/services/store/country.service';
import { ShopsService } from 'app/core/services/store/shops.service';
import { CategoryService } from 'app/core/services/store/category.service';
import { FavoriteService } from '../core/services/store/favorite.service';
import { UserService } from '../core/services/user.service';
import { ServicesService } from 'app/core/services/store/services.service';

@NgModule({
  imports: [
    StoreModule.forRoot(ROOT_REDUCER),
    EffectsModule.forRoot(ROOT_EFFECTS),
  ],
  exports: [
    LayoutsModule,
    SharedMetaModule,
    TransferHttpModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SessionInterceptor, multi: true },
    AuthService,
    BrandService,
    CouponsService,
    CountryService,
    ShopsService,
    CategoryService,
    FavoriteService,
    UserService,
    ServicesService
  ],
  declarations: [],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return { ngModule: SharedModule };
  }
}
