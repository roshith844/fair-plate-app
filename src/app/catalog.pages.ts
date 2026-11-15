import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { resizePhoto } from './shared';
import { Store, uid } from './store.service';

// ---------------- People list ----------------
@Component({
  selector: 'app-people', standalone: false,
  template: `<ion-content>
    <div class="top"><h1>People</h1><button class="pill" routerLink="/person-edit"><ion-icon name="add"></ion-icon>Add person</button></div>
    <p class="count">{{ s.people.length }} people</p>
    <div class="list">
      @for (p of s.people; track p.id) {
        <a class="row" [routerLink]="['/person-edit', p.id]">
          <app-avatar [name]="p.name" [photo]="p.photo" [size]="48"></app-avatar>
          <span class="nm">{{ p.name }}</span><ion-icon name="chevron-forward"></ion-icon>
        </a>
      }
    </div>
  </ion-content>`,
  styles: [`
    .top{display:flex;align-items:center;justify-content:space-between;padding:52px 20px 0}.top h1{margin:0;font-size:30px;font-weight:700}
    .pill{height:44px;padding:0 18px 0 14px;border-radius:22px;background:#17181B;color:#fff;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px;border:0}.pill ion-icon{font-size:20px}
    .count{margin:12px 24px 8px;font-size:13px;font-weight:500;color:#5C5F66}
    .list{margin:0 20px;background:#fff;border:1px solid #E6E4DD;border-radius:20px;overflow:hidden}
    .row{display:flex;align-items:center;gap:14px;padding:10px 16px;min-height:68px;color:#17181B;text-decoration:none}.row+.row{border-top:1px solid #EFEDE6}
    .nm{flex:1;font-size:17px;font-weight:600}.row ion-icon{color:#5C5F66}
  `],
})
export class PeoplePage { constructor(public s: Store) {} }

// ---------------- Add / edit person ----------------
@Component({
  selector: 'app-person-edit', standalone: false,
  template: `<ion-content>
    <div class="top"><button class="ib" aria-label="Cancel" (click)="close()"><ion-icon name="close"></ion-icon></button>
      <h1>{{ id ? 'Edit person' : 'New person' }}</h1><span class="sp"></span></div>
    <main>
      <div class="pic">
        <div class="av"><app-avatar [name]="name" [photo]="photo" [size]="140"></app-avatar>
          <button class="cam" aria-label="Add photo" (click)="f.click()"><ion-icon name="camera-outline"></ion-icon></button></div>
        <input #f type="file" accept="image/*" hidden (change)="pick($event)" />
        <span class="hint">No photo? Their first letter is used instead.</span>
      </div>
      <div class="fld"><label for="n">Name</label><input id="n" class="in" type="text" [(ngModel)]="name" /></div>
      @if (id) { <button class="del" (click)="del()">Delete person</button> }
    </main>
  </ion-content>
  <ion-footer><div class="foot"><button class="dark" [disabled]="!name.trim()" (click)="save()">Save person</button></div></ion-footer>`,
  styles: [`
    .top{display:flex;align-items:center;justify-content:space-between;padding:52px 20px 0}.top h1{margin:0;font-size:18px;font-weight:600}.sp{width:44px}
    .ib{width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #E6E4DD;font-size:20px;display:grid;place-items:center}
    main{display:flex;flex-direction:column;gap:22px;padding:24px 20px}
    .pic{display:flex;flex-direction:column;align-items:center;gap:14px}.av{position:relative;width:140px;height:140px}
    .cam{position:absolute;right:-2px;bottom:-2px;width:48px;height:48px;border-radius:50%;border:3px solid #F4F3EF;background:#17181B;color:#fff;font-size:20px;display:grid;place-items:center}
    .hint{font-size:13px;color:#5C5F66}
    .fld{display:flex;flex-direction:column;gap:8px}label{font-size:13px;font-weight:600;color:#5C5F66}
    .in{height:52px;padding:0 16px;border:1px solid #D9D6CC;border-radius:14px;background:#fff;font-size:16px;color:#17181B;outline:0;width:100%}.in:focus{border:2px solid #17181B;padding:0 15px}
    .foot{padding:12px 20px 28px;background:#F4F3EF}
    .dark{width:100%;height:56px;border:0;border-radius:28px;background:#17181B;color:#fff;font-size:16px;font-weight:600}.dark:disabled{opacity:.4}
    .del{background:none;border:0;color:#B91C1C;font-size:14px;font-weight:600;padding:8px}
  `],
})
export class PersonEditPage {
  id = this.r.snapshot.paramMap.get('id') || '';
  name = this.s.person(this.id)?.name || '';
  photo = this.s.person(this.id)?.photo;
  constructor(private s: Store, private r: ActivatedRoute, private nav: Router) {}
  close() { this.nav.navigate(['/tabs/people']); }
  async pick(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.photo = await resizePhoto(file);
  }
  async save() { await this.s.savePerson({ id: this.id || uid(), name: this.name.trim(), photo: this.photo }); this.nav.navigate(['/tabs/people'], { replaceUrl: true }); }
  async del() { await this.s.deletePerson(this.id); this.nav.navigate(['/tabs/people'], { replaceUrl: true }); }
}

export const CATALOG = [PeoplePage, PersonEditPage];
