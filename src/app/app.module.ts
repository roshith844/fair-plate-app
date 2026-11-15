import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular/lazy';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AvatarComponent, PhotoPickerComponent, TabsComponent } from './shared';
import { CATALOG } from './catalog.pages';
import { SPLIT } from './split.pages';
import { Store } from './store.service';

@NgModule({
  declarations: [AppComponent, AvatarComponent, PhotoPickerComponent, TabsComponent, ...CATALOG, ...SPLIT],
  imports: [BrowserModule, FormsModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // load saved shops/items/people from device storage before the first screen
    { provide: APP_INITIALIZER, multi: true, deps: [Store], useFactory: (s: Store) => () => s.load() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
