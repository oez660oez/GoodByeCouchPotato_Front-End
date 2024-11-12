import { createWebHistory, createRouter } from 'vue-router';
import OutdoorMap from './views/OutdoorMap.vue';
import RoomMap from './views/RoomMap.vue';
import ShopView from './views/ShopView.vue';
import DailyView from './views/DailyView.vue';
import AlltaskView from './views/AlltaskView.vue';
import IndexView from './views/IndexView.vue';
import DecorationView from './views/DecorationView.vue';
import DressView from './views/DressView.vue';
import ReportView from './views/ReportView.vue';
import SystemView from './views/SystemView.vue';
import ForgetPassword from './components/ForgetPasswordComponent.vue';
import Feedback from './components/FeedBack.vue';
import ChangePassword from './components/ChangePassword.vue';
import BodyＭerchandiseComponent from './components/BodyＭerchandiseComponent.vue';
import CreateCharacter from './views/CreateCharacter.vue';
import NowReport from './views/NowReport.vue';
import Reportdata from './views/Reportdata.vue';
import WeighttaskView from './views/WeighttaskView.vue';
import GameView from './views/GameView.vue';
import StartStory from './views/StartStory.vue';

const routes = [
  {
    path: '/',
    component: IndexView,
    name: 'index',
    children: [
      {
        path: 'forgetpassword',
        component: ForgetPassword,
        name: 'forgetpassword'
      }
    ]
  },
  {
    path: '/outdoor',
    component: OutdoorMap,
    name: 'outdoor',
    children: [
      {
        path: 'shop',
        component: ShopView,
        name: 'out-shop'
      },
      {
        path: 'daily',
        component: DailyView,
        name: 'out-daily'
      },
      {
        path: 'task',
        component: AlltaskView,
        name: 'out-task'
      },
      {
        path: 'dress',
        component: DressView,
        name: 'out-dress'
      },
      {
        path: 'decoration',
        component: DecorationView,
        name: 'out-decoration'
      },
      {
        path: 'system',
        component: SystemView,
        name: 'out-system',
        children: [
          {
            path: 'feedback',
            component: Feedback,
            name: 'out-systemfeedback'
          },
          {
            path: 'changepassword',
            component: ChangePassword,
            name: 'out-changepassword'
          }
        ]
      },
      {
        path: 'report',
        component: ReportView,
        name: 'out-report'
      },
      {
        path: 'reportdata',
        component: Reportdata,
        name: 'out-reportdata'
      },

      {
        path: 'nowreport',
        component: NowReport,
        name: 'out-nowreport'
      }
    ]
  },
  {
    path: '/roommap',
    component: RoomMap,
    name: 'roommap',
    children: [
      {
        path: 'shop',
        component: ShopView,
        name: 'in-shop',
        children: [
          {
            path: 'Ｍerchandise',
            component: BodyＭerchandiseComponent,
            name: 'in-bodyMerchandise'
          }
        ]
      },
      {
        path: 'daily',
        component: DailyView,
        name: 'in-daily'
      },
      {
        path: 'task',
        component: AlltaskView,
        name: 'in-task'
      },
      {
        path: 'dress',
        component: DressView,
        name: 'in-dress'
      },
      {
        path: 'decoration',
        component: DecorationView,
        name: 'in-decoration'
      },
      {
        path: 'system',
        component: SystemView,
        name: 'in-system',
        children: [
          {
            path: 'feedback',
            component: Feedback,
            name: 'in-systemfeedback'
          },
          {
            path: 'changepassword',
            component: ChangePassword,
            name: 'in-changepassword'
          }
        ]
      },
      {
        path: 'report',
        component: ReportView,
        name: 'in-report'
      },
      {
        path: 'reportdata',
        component: Reportdata,
        name: 'in-reportdata'
      },

      {
        path: 'nowreport',
        component: NowReport,
        name: 'in-nowreport'
      }
    ]
  },
  {
    path: '/createcharacter',
    component: CreateCharacter,
    name: 'createcharacter'
  },
  {
    path: '/weighttask',
    component: WeighttaskView,
    name: 'weighttask'
  },
  {
    path: '/gameview',
    component: GameView,
    name: 'gameview'
  },
  {
    path: '/StartStory',
    component: StartStory,
    name: 'startstory'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
