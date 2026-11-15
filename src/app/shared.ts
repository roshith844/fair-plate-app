import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Person } from './store.service';

/** Photo (if any) or the first letter of the name. */
@Component({
  selector: 'app-avatar',
  standalone: false,
  template: `<ion-avatar [style.width.px]="size" [style.height.px]="size">
    @if (photo) { <img [src]="photo" alt="" /> } @else {
      <div class="ph" [style.font-size.px]="size / 2.4" [style.background]="c[0]" [style.color]="c[1]">{{ (name || '?').charAt(0).toUpperCase() }}</div>
    }</ion-avatar>`,
  styles: [':host{display:block;border-radius:50%}ion-avatar{border-radius:50%;overflow:hidden}img{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover}.ph{width:100%;height:100%;display:grid;place-items:center;background:var(--ion-color-light-shade);font-weight:600}'],
})
export class AvatarComponent {
  @Input() name = '';
  @Input() photo?: string;
  @Input() size = 40;
  get c() { return this.name === 'You' ? ['#17181B', '#fff'] : tint(PEOPLE, this.name); }
}

const PEOPLE = [['#E4EBFF', '#1E3A8A'], ['#FDEBDD', '#9A3412'], ['#D9F0EC', '#0F5A50'], ['#F3E3F2', '#6B2468'], ['#EAEFD2', '#4D5A12']];
const SHOPS = [['#F6E7C8', '#6B4A0B'], ['#F0E1D1', '#6B3F1A'], ['#F6DDD0', '#8A3515'], ['#F5EAD6', '#6B4F14'], ['#EAD9CE', '#5A2A12']];
function tint(p: string[][], n: string) { let h = 0; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 997; return p[h % p.length]; }

/** Shop monogram tile. */
@Component({
  selector: 'app-mono', standalone: false,
  template: `<div [style.width.px]="size" [style.height.px]="size" [style.background]="c[0]" [style.color]="c[1]" [style.font-size.px]="size / 2.2"
    style="border-radius:12px;display:grid;place-items:center;font-weight:700">{{ (name || '?').charAt(0).toUpperCase() }}</div>`,
})
export class MonoComponent {
  @Input() name = '';
  @Input() size = 44;
  get c() { return tint(SHOPS, this.name); }
}

/** Pick a photo from camera/gallery (native file chooser) and shrink it before it is stored on the device. */
@Component({
  selector: 'app-photo-picker',
  standalone: false,
  template: `<div class="ion-text-center">
    <app-avatar [name]="name" [photo]="photo" [size]="110" style="display:inline-block"></app-avatar><br />
    <ion-button fill="outline" size="small" (click)="f.click()"><ion-icon slot="start" name="camera-outline"></ion-icon>{{ photo ? 'Change photo' : 'Add photo' }}</ion-button>
    @if (photo) { <ion-button fill="clear" size="small" color="medium" (click)="set(undefined)">Remove</ion-button> }
    <input #f type="file" accept="image/*" hidden (change)="pick($event)" />
  </div>`,
})
export class PhotoPickerComponent {
  @Input() photo?: string;
  @Input() name = '';
  @Output() photoChange = new EventEmitter<string | undefined>();
  set(v?: string) { this.photo = v; this.photoChange.emit(v); }
  pick(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 320 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * k; c.height = img.height * k;
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        this.set(c.toDataURL('image/jpeg', 0.7));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  }
}

@Component({
  selector: 'app-tabs',
  standalone: false,
  template: `<ion-tabs><ion-tab-bar slot="bottom">
    <ion-tab-button tab="split"><ion-icon name="receipt-outline"></ion-icon><ion-label>Split</ion-label></ion-tab-button>
    <ion-tab-button tab="shops"><ion-icon name="storefront-outline"></ion-icon><ion-label>Shops</ion-label></ion-tab-button>
    <ion-tab-button tab="people"><ion-icon name="people-outline"></ion-icon><ion-label>People</ion-label></ion-tab-button>
  </ion-tab-bar></ion-tabs>`,
})
export class TabsComponent {}

export type { Person };

/** Shrink a picked photo to a small JPEG data URL so it is cheap to store on the device. */
export function resizePhoto(file: File): Promise<string> {
  return new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, 320 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * k; c.height = img.height * k;
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.7));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(file);
  });
}
