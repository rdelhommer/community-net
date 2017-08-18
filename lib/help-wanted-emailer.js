function HelpWantedEmailer(emailConfig) {
  var CronJob = require('cron').CronJob;

  var _schedule = emailConfig.schedule || '0 0 0 * * *';
  var _timezone = emailConfig.timezone || 'America/Los_Angeles';

  var helpWantedCron = new CronJob(_schedule, () => {
    // For each user, let them know who they can help
    var users = dbFacade.getUsers((users) => {
      async.eachSeries(users, (user, next) => {
        dbFacade.getUsersToHelp(user, {}, (toHelp) => {
          emailConfig.transporter.sendMail({
            to: 'TODO',
            from: emailConfig.from,
            subject: emailConfig.subject,
            html: 'TODO'
          }, next);
        }, next);
      }, (asyncErr) => {
        if (asyncErr) return emailConfig.onErrorCallback(asyncErr);

        return emailConfig.onSuccessCallback();
      });
    }, emailConfig.onErrorCallback);
  }, null, true, _timezone);
}

module.exports = HelpWantedEmailer;