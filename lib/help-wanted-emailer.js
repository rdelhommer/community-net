function HelpWantedEmailer(emailConfig, dbFacade) {
  var CronJob = require('cron').CronJob;

  var _schedule = emailConfig.schedule || '0 0 0 * * 0';
  var _timezone = emailConfig.timezone || 'America/Los_Angeles';

  var helpWantedCron = new CronJob(_schedule, () => {
    // For each user, let them know who they can help
    var users = dbFacade.getUsers((users) => {
      async.eachSeries(users, (user, next) => {
        dbFacade.getUsersToHelp(user, {}, (toHelp) => {
          emailConfig.transporter.sendMail({
            to: dbFacade.convertDoc(user).email,
            from: emailConfig.from,
            subject: emailConfig.subject,
            html: 'TODO'
          }, next);
        }, next);
      }, (asyncErr) => {
        if (asyncErr && emailConfig.onErrorCallback) {
          return emailConfig.onErrorCallback(asyncErr);
        }

        if (email.onSuccessCallback) {
          return emailConfig.onSuccessCallback();
        }
      });
    }, emailConfig.onErrorCallback);
  }, null, true, _timezone);
}

module.exports = HelpWantedEmailer;