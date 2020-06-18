import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { PageResult } from 'app/core/models/filters/page-result';
import { ShopModel, ShopQueryModel } from './../../models/store/service/service.model';

@Injectable()
export class ServicesService {

  constructor(private http: HttpClient) { }
  getPage(query: ShopQueryModel): Observable<PageResult<ShopModel[]>> {
    return this.http.get<any>(`${environment.baseUri}/store/services?${query.getQuery()}`, {observe: 'response'})
      .pipe(
        map(resp => new PageResult<ShopModel[]>(resp))
      );
  }

  getById(id: number): Observable<ShopModel> {
    const url =
      `${environment.baseUri}/store/shop/${id}?expand=categories%2Ccoupons%2Cdiscounts%2Csimilar_shops%2Cdelivery_types%2Cpayment_types`;
    return this.http
      .get<{data: ShopModel}>(url)
      .map(({data}) => data);
  }

}
