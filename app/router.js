'use strict';

const { Container } = require('@xprofiler/injection');
const { HttpServer,
  EGG_ROUTER,
  EGG_MIDDLEWARES,
} = require('../dist/index');

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = async app => {
  const { router } = app;
  const {
    userRequired,
    appInvitationRequired,
    appMemberRequired,
    appOwnerRequired,
    agentAccessibleRequired,
    fileAccessibleRequired,
    strategyAccessibleRequired,
  } = app.middlewares.auth({}, app);
  const {
    checkParams,
  } = app.middleware.params({}, app);

  const container = new Container();
  container.set({ id: Container, value: container });
  container.set(HttpServer);
  container.set({ id: EGG_ROUTER, value: router });
  container.set({
    id: EGG_MIDDLEWARES,
    value: {
      auth: app.middlewares.auth({}, app),
      params: app.middleware.params({}, app),
    },
  });

  const server = container.get(HttpServer);
  await server.register();

  // team
  router.get('/xapi/team_members', userRequired, appMemberRequired, 'team.getMembers');
  router.post('/xapi/team_member', userRequired, appMemberRequired, checkParams(['userId']), 'team.inviteMember');
  router.post('/xapi/team_ownership', userRequired, appOwnerRequired, checkParams(['userId']), 'team.transferOwnership');
  router.put('/xapi/invitation', userRequired, appInvitationRequired, checkParams(['status']), 'team.updateInvitation');
  router.delete('/xapi/leave_team', userRequired, appMemberRequired, 'team.leaveTeam');
  router.delete('/xapi/team_member', userRequired, appOwnerRequired, checkParams(['userId']), 'team.removeMember');

  // alarm
  router.get('/xapi/alarm_strategies', userRequired, appMemberRequired, 'alarm.getStrategies');
  router.post('/xapi/alarm_strategy', userRequired, appMemberRequired, 'alarm.addStrategy');
  router.put('/xapi/alarm_strategy', userRequired, strategyAccessibleRequired, 'alarm.updateStrategy');
  router.put('/xapi/alarm_strategy_status', userRequired, strategyAccessibleRequired, 'alarm.updateStrategyStatus');
  router.delete('/xapi/alarm_strategy', userRequired, strategyAccessibleRequired, 'alarm.deleteStrategy');

  // alarm/history
  router.get('/xapi/alarm_strategy_history', userRequired, strategyAccessibleRequired, 'alarm.getStrategyHistory');

  // alarm/contacts
  router.get('/xapi/alarm_strategy_contacts', userRequired, strategyAccessibleRequired, 'alarm.getStrategyContacts');
  router.post('/xapi/alarm_strategy_contact', userRequired, strategyAccessibleRequired, 'alarm.addContactToStrategy');
  router.delete('/xapi/alarm_strategy_contact', userRequired, strategyAccessibleRequired, 'alarm.deleteContactFromStrategy');

  // settings
  router.get('/xapi/settings', userRequired, appOwnerRequired, 'settings.getSettingInfo');
  router.put('/xapi/settings_app_name', userRequired, appOwnerRequired, checkParams(['newAppName']), 'settings.renameApp');
  router.delete('/xapi/settings_app', userRequired, appOwnerRequired, 'settings.deleteApp');
};
