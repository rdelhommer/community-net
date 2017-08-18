function HelpWantedEmailer(emailConfig) {
  var CronJob = require('cron').CronJob;

  var helpWantedCron = new CronJob(emailConfig.schedule, () => {
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
  }, null, true, emailConfig.timezone);
}

module.exports = HelpWantedEmailer;