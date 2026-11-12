import { useApp } from './context/AppContext';
import { SheetHost, TabBar, ToastHost } from './components/ui';
import { Login, Name, Otp, Splash } from './screens/Auth';
import Home from './screens/Home';
import Search from './screens/Search';
import { Assigned, Chat, Done, Route, Searching, Trip } from './screens/Ride';
import { Account, Activity, RideDetail, Services } from './screens/Tabs';
import { Help, Notifications, Offers, Parcel, Profile, Refer, Rental, Safety, Saved, Wallet } from './screens/More';

const SCREENS = {
  splash: Splash, login: Login, otp: Otp, name: Name,
  home: Home, services: Services, activity: Activity, account: Account,
  search: Search, route: Route, searching: Searching, assigned: Assigned, trip: Trip, done: Done, chat: Chat,
  ridedetail: RideDetail, wallet: Wallet, parcel: Parcel, rental: Rental, offers: Offers, refer: Refer,
  safety: Safety, help: Help, saved: Saved, profile: Profile, notifications: Notifications,
};
const TAB_IDS = ['home', 'services', 'activity', 'account'];
const MAP_IDS = ['home', 'route', 'searching', 'assigned', 'trip'];

export default function App() {
  const { nav } = useApp();
  const Screen = SCREENS[nav.id] || Home;
  const isMap = MAP_IDS.includes(nav.id);
  // Screens that re-render in place (same key) keep state; a new key = new screen with entry animation.
  const cls = ['screen', Screen.cls || '', isMap ? 'mapscr' : 'a-' + nav.anim].join(' ');
  return (
    <div id="phone">
      <div id="screens">
        <section key={nav.key} className={cls}>
          <Screen params={nav.params} />
        </section>
      </div>
      {TAB_IDS.includes(nav.id) && <TabBar />}
      <SheetHost />
      <ToastHost />
    </div>
  );
}
