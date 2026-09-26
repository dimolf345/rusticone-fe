import { HttpClient, HttpClientCommonOptions } from "@angular/common/http";
import { Service, inject } from "@angular/core";
import { API_ENDPOINTS } from "@core/constants/api-endpoints.constant";
import { environment } from "@env/environment";
import { tap } from "rxjs";


@Service()
export class ProductsService {
    #http = inject(HttpClient);
    #httpOptions = {
        withCredentials: true
    };

    uploadProductImages(images: File[]) {
        const url = `${environment.apiUrl}${API_ENDPOINTS.UPLOADS.UPLOAD_PRODUCT_IMAGE}`;
        const formData = new FormData();
        images.forEach((image) => formData.append('images', image));

        const httpOptions: HttpClientCommonOptions = {
            ...this.#httpOptions,
            observe: 'events'
        }

        return this.#http.post(url, formData, httpOptions).pipe(
            tap((res) => { console.log(res) })
        );
    }
}