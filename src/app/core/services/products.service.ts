import { HttpClient, HttpClientCommonOptions, httpResource } from "@angular/common/http";
import { Service, inject } from "@angular/core";
import { API_ENDPOINTS } from "@core/constants/api-endpoints.constant";
import { IProduct } from "@core/models/product.model";
import { environment } from "@env/environment";


@Service()
export class ProductsService {
    #http = inject(HttpClient);
    #httpOptions = {
        withCredentials: true
    };

    get baseUrl(): string {
        return `${environment.apiUrl}${API_ENDPOINTS.PRODUCTS.ROOT}`;
    }

    uploadProductImages(images: File[]) {
        const url = `${environment.apiUrl}${API_ENDPOINTS.UPLOADS.UPLOAD_PRODUCT_IMAGE}`;
        const formData = new FormData();
        images.forEach((image) => formData.append('images', image));

        const httpOptions: HttpClientCommonOptions = {
            ...this.#httpOptions,
            observe: 'events'
        };

        return this.#http.post(url, formData, httpOptions);
    }

    getProductsResource() {
        const url = `${environment.apiUrl}${API_ENDPOINTS.PRODUCTS.ROOT}`;
        return httpResource<IProduct[]>(() => url);
    }

    createProduct(product: IProduct) {
        const httpOptions = { ...this.#httpOptions };
        return this.#http.post(this.baseUrl, product, httpOptions);
    }
}