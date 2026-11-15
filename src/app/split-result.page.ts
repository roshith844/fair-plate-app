import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Share as NativeShare } from '@capacitor/share';
import { Share, Store } from './store.service';

/** Step 3 of 3: who pays what. */
@Component({
  selector: 'app-split-result', standalone: false,
  template: `<ion-content>
    <div class="top"><button class="back" aria-label="Back" (click)="back()"><ion-icon name="chevron-back"></ion-icon></button><h1>Who pays what</h1><span class="sp"></span></div>
    <div class="bar"><span class="on"></span><span class="on"></span><span class="on"></span></div>
    <p class="step">Step 3 of 3 · {{ s.shop(s.shopId)?.name }}</p>

    <section class="sum">
      <div class="r big"><span>Total paid</span><b>₹{{ s.amount }}</b></div>
      <hr />
      <div class="r"><span>Items</span><span>₹{{ s.itemsTotal() | number:'1.0-0' }}</span></div>
      <div class="r"><span>Tax and extras</span><span>{{ s.extras() < 0 ? '−' : '+' }} ₹{{ abs(s.extras()) | number:'1.0-0' }}</span></div>
      <p>Extras split in proportion to items</p>
    </section>

    <p class="lb">Each person pays</p>
    <div class="list">
      @for (x of shares; track x.person.id) {
        <div class="row">
          <app-avatar [name]="x.person.name" [photo]="x.person.photo" [size]="44"></app-avatar>
          <div class="tx"><b>{{ x.person.name }}</b><small>{{ x.lines.join(', ') || 'Nothing selected' }}</small></div>
          <div class="am"><b>₹{{ x.total }}</b><small>₹{{ round(x.items) }} + ₹{{ x.total - round(x.items) }}</small></div>
        </div>
      }
    </div>

    <div class="btns">
      <button class="out" (click)="again()">Start a new split</button>
      <button class="dark" (click)="share()"><ion-icon name="share-social-outline"></ion-icon>Share summary</button>
    </div>
  </ion-content>`,
  styles: [`
    .top{display:flex;align-items:center;justify-content:space-between;padding:52px 20px 0}.top h1{margin:0;font-size:18px;font-weight:600}.sp{width:44px}
    .back{width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #E6E4DD;font-size:20px;display:grid;place-items:center}
    .bar{display:flex;gap:6px;margin:14px 20px 0}.bar span{flex:1;height:4px;border-radius:2px;background:#DAD7CD}.bar .on{background:#C2410C}
    .step{margin:8px 20px 14px;font-size:12px;font-weight:600;color:#5C5F66}
    .sum{margin:0 20px;background:#17181B;color:#fff;border-radius:24px;padding:18px 20px}
    .r{display:flex;justify-content:space-between;font-size:14px;color:#E4E5E8;margin-top:6px}.r.big{align-items:baseline;margin:0;font-size:13px;color:#C9CBD1}.r.big b{font-size:34px;color:#fff}
    .sum hr{border:0;height:1px;background:rgba(255,255,255,.16);margin:12px 0}.sum p{margin:12px 0 0;font-size:12px;color:#C9CBD1}
    .lb{margin:16px 24px 8px;font-size:13px;font-weight:600;color:#5C5F66}
    .list{margin:0 20px;background:#fff;border:1px solid #E6E4DD;border-radius:20px;overflow:hidden}
    .row{display:flex;align-items:center;gap:12px;padding:12px 16px;min-height:72px}.row+.row{border-top:1px solid #EFEDE6}
    .tx{flex:1;min-width:0}.tx b{display:block;font-size:16px}.tx small{display:block;margin-top:2px;font-size:13px;color:#5C5F66;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .am{display:flex;flex-direction:column;align-items:flex-end}.am b{font-size:20px}.am small{font-size:12px;color:#5C5F66}
    .btns{display:flex;flex-direction:column;gap:10px;padding:20px 20px 28px}
    .out{height:52px;border-radius:26px;border:1.5px solid #17181B;background:transparent;font-size:15px;font-weight:600;color:#17181B}
    .dark{height:56px;border-radius:28px;border:0;background:#17181B;color:#fff;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:10px}
  `],
})
export class SplitResultPage {
  shares: Share[] = this.s.calc();
  abs = Math.abs;
  round = Math.round;
  constructor(public s: Store, private nav: Router) {}
  text() {
    return `${this.s.shop(this.s.shopId)?.name} · ₹${this.s.amount}\n` + this.shares.map(x => `${x.person.name}: ₹${x.total}`).join('\n');
  }
  async share() {
    try { await NativeShare.share({ title: 'Split', text: this.text() }); }
    catch { await navigator.clipboard?.writeText(this.text()); }
  }
  back() { this.nav.navigate(['/split-items']); }
  again() { this.s.resetDraft(); this.nav.navigate(['/tabs/split'], { replaceUrl: true }); }
}
