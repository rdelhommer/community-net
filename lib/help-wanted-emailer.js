function HelpWantedEmailer(nodeCron, emailConfig, dbFacade) {
  this.startCron = startCron;
  this.sendHelpWantedEmail = sendHelpWantedEmail;

  function startCron(schedule, timezone) {
    var _schedule = schedule || '0 0 0 * * 0';
    var _timezone = timezone || 'America/Los_Angeles';

    this.cronJob = new nodeCron.CronJob(_schedule, sendHelpWantedEmail, null, true, _timezone);
  }

  function sendHelpWantedEmail() {
    // For each user, let them know who they can help
    dbFacade.getUsers((users) => {
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
  }
}

module.exports = HelpWantedEmailer;