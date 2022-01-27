import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

const base_url = environment.base_url;
const url_assets = environment.url_assets;

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  transform(img: string, tipo: 'users' | 'persons' | 'companies' | 'professionals'): string {

    if (!img) {
      return tipo == 'companies' ? `assets/images/not-available.png` : `assets/images/users/no-image.png`;
    } else if (img.includes('https') || img.includes('http')) {
      return img;
    }
    else if (img) {
      return `${url_assets}app/public/${img}`;
      // return `${url_assets}/upload/usuarios/${img}`;
    }
    else {
      return `${url_assets}/upload/usuarios/no-image`;
    }
  }

}
