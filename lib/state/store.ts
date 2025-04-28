import menuState from "./menu/menuState"
import headerNav from "./header/headerNav"
import listView from "./list/listView"
import agentsState from "./agent/agents"
import alertsState from "./alerts/alertsState"
import dashboardsView from "./dashboards/dashboardsView"
import layoutState from "./layoutState/layoutState"
import sessionState from "./sessionState/sessionState"
import usersState from "./userState/userState"
import formState from "./formState/formState"
import integrationState from "./integrations/integrationState"
import notificationState from "./notificationState/notificationState"
import logsState from "./logs/logsState"
import SQLTabState from "./tabs/tabState"
import adminState from "./admin/adminState"

interface Store {
  menuState: typeof menuState
  headerNav: typeof headerNav
  listView: typeof listView
  agentsState: typeof agentsState
  alertsState: typeof alertsState
  dashboardsView: typeof dashboardsView
  layoutState: typeof layoutState
  sessionState: typeof sessionState
  usersState: typeof usersState
  formState: typeof formState
  integrationState: typeof integrationState
  notificationState: typeof notificationState
  SQLTabState: typeof SQLTabState
  logsState: typeof logsState
  adminState: typeof adminState
}

const store: Store = {
  menuState,
  headerNav,
  listView,
  agentsState,
  alertsState,
  dashboardsView,
  layoutState,
  sessionState,
  usersState,
  formState,
  integrationState,
  notificationState,
  SQLTabState,
  logsState,
  adminState,
}

export default store
