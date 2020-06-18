import { Action } from '@ngrx/store';
import { PageResult } from 'app/core/models/filters/page-result';
import { ShopModel, ShopQueryModel } from 'app/core/models/store/service/service.model';

export enum ShopActionTypes {
  SHOPS = '[SHOPS] GET',
  SHOPS_SUCCESS = '[SHOPS] SUCCESS',
  SHOPS_FAILURE = '[SHOPS] FAILURE',
}

export function getShops(model: ShopQueryModel) {
  return {
    type: ShopActionTypes.SHOPS,
    payload: model
  };
}

export class ShopAction implements Action {
  readonly type = ShopActionTypes.SHOPS;
  constructor(public payload: PageResult<ShopModel[]>) { }
}
export class ShopSuccessAction implements Action {
  readonly type = ShopActionTypes.SHOPS_SUCCESS;
  constructor(public payload: PageResult<ShopModel[]>) { }
}
export class ShopFailureAction implements Action {
  readonly type = ShopActionTypes.SHOPS_FAILURE;
  constructor(public payload: PageResult<ShopModel[]>) { }
}
export type All = ShopAction | ShopSuccessAction | ShopFailureAction;
