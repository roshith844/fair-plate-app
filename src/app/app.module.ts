import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AvatarComponent, PhotoPickerComponent, TabsComponent, MonoComponent } from './shared';
import { CATALOG } from './catalog.pages';
import { BillPage } from './bill.page';
import { SplitItemsPage } from './split-items.page';
import { SplitResultPage } from './split-result.page';
import { ShopMenuPage, ShopsPage } from './shops.pages';
import { ItemEditPage, ShopEditPage } from './forms.pages';
import { Store } from './store.service';

@NgModule({
  declarations: [AppComponent, AvatarComponent, PhotoPickerComponent, TabsComponent, MonoComponent, BillPage, SplitItemsPage, SplitResultPage, ShopsPage, ShopMenuPage, ShopEditPage, ItemEditPage, ...CATALOG],
  imports: [BrowserModule, FormsModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // load saved shops/items/people from device storage before the first screen
    { provide: APP_INITIALIZER, multi: true, deps: [Store], useFactory: (s: Store) => () => s.load() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
