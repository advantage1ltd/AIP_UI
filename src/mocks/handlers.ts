import { http, HttpResponse } from 'msw'
import { BASE_API_URL } from '@/config/api'
import { siteVisitHandlers } from './siteVisitHandlers'
import { safeDuressWordsHandlers } from './safeDuressWordsHandlers'
import { holidayRequestHandlers } from './holidayRequestHandlers'
import { customerSatisfactionHandlers } from './customerSatisfactionHandlers'
import { bankHolidayHandlers } from './bankHolidayHandlers'
import { customerHandlers } from './customerHandlers'
import { regionsHandlers } from './regionsHandlers'
import { sitesHandlers } from './sitesHandlers'
import { incidentHandlers } from './incidentHandlers'
import { userHandlers } from './userHandlers'
import { settingsHandlers } from './settingsHandlers'
import { headerHandlers } from './headerHandlers'
import { dashboardHandlers } from './dashboardHandlers'
import { mysteryShopperHandlers } from './mysteryShopperHandlers'

export const handlers = [
  ...userHandlers,
  ...headerHandlers,
  ...dashboardHandlers,
  ...siteVisitHandlers,
  ...safeDuressWordsHandlers,
  ...holidayRequestHandlers,
  ...customerSatisfactionHandlers,
  ...bankHolidayHandlers,
  ...customerHandlers,
  ...regionsHandlers,
  ...sitesHandlers,
  ...incidentHandlers,
  ...mysteryShopperHandlers,
  ...settingsHandlers
]