import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';

import { Observable } from 'rxjs/Observable';
import { switchMap, map } from 'rxjs/operators';

import * as serviceAction from '../actions/service.action';
import { ServicesService } from 'app/core/services/store/services.service';

@Injectable()
export class ServiceEffects {
    constructor(private actions$: Actions,
        private service: ServicesService) { }
    @Effect()
    brands$ = this.actions$
        .ofType(serviceAction.ShopActionTypes.SHOPS)
        .pipe(
            map(action => action['payload']),
            switchMap(model => this.service.getPage(model)),
            map(model => new serviceAction.ShopSuccessAction(model))
        );
}
