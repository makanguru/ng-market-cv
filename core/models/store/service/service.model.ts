import { CategoryModel } from 'app/core/models/store/category/category.model';
import { CouponModel } from 'app/core/models/store/coupon/coupon.model';
import { getSearchQuerys } from 'app/core/models/utils/querybuilder';
import { PageQuery } from '../../filters/page-query';


export interface PhoneShop {
    phone: string;
    add: string;
}

export interface DeliveryType {
    name: string;
    type_id: number;
}

export interface Type {
    id: number;
    name: string;
}

export interface Currency {
    id: number;
    name: string;
    code: string;
    abbreviation: number;
    rate: string;
}

export interface PaymentType {
    type: Type[];
    currency: Currency[];
}


export interface Discount {
    cashback: number;
    condition: string;
}

export interface StatusShopModel {
    id: number;
    name: string;
}

export interface ShopModel {
    id: number;
    alias: string;
    name: string;
    description: string;
    image: string;
    is_favorite?: boolean;
    max_pv: string;
    max_cashback: string | number;
    cashback_days: number;
    email: string;
    schedule_days: string;
    schedule_hours: string;
    product_count: number;
    phones: PhoneShop[];
    delivery_types: DeliveryType[];
    payment_types: PaymentType[];
    categories: CategoryModel[];
    coupons: CouponModel[];
    discounts: Discount[];
    similar_shops: any[];
    status: StatusShopModel[];
}
export class ShopQueryModel extends PageQuery {
    id: string;
    search: string;
    /**
     * Флаг для поиск магазинов по первой букве. Буква указывается в параметре search.
     * @type {string}
     * @memberof ShopQueryModel
     * @description 1 == true
     */
    is_only_first_letter: 0 | 1;
    /**
     * ID категорий
     * @type {number[]}
     * @memberof ShopQueryModel
     */
    category_id: number;
    /**
     * ID страны доставки
     * @type {number[]}
     * @memberof ShopQueryModel
     */
    country_ids: number[];
    /**
     * ID городов
     * @type {number[]}
     * @memberof ShopQueryModel
     */
    city_ids: number[];
    /**
     * Данные сортировки: name
     * @type {string}
     * @memberof ShopQueryModel
     */
    sort: string;
    fields: string[];
    expand: string[];
    getQuery() {
        return getSearchQuerys(this).join('&');
    }
}
