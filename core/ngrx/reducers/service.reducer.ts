import { Action } from '@ngrx/store';
import * as ShopActions from '../actions/service.action';
import { ShopActionTypes } from '../actions/service.action';
import { ShopModel } from '../../models/store/service/service.model';
import { PageResult } from 'app/core/models/filters/page-result';

export type Action = ShopActions.All;

export interface State {
    shops: PageResult<ShopModel> | null;
    pending: boolean;
}

export const initialState: State = {
    shops: null,
    pending: true
};

export function serviceReducer(state = initialState, action: ShopActions.All): State {
    switch (action.type) {
        case ShopActionTypes.SHOPS: {
            return Object.assign({}, state, { pending: true, error: null });
        }
        case ShopActionTypes.SHOPS_SUCCESS: {
            return Object.assign({}, state, { shops: action.payload, pending: false });
        }
        case ShopActionTypes.SHOPS_FAILURE: {
            return Object.assign({}, state, { pending: false, error: 'Error' });
        }
        default: {
            return state;
        }
    }
}
