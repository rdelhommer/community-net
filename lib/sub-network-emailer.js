function SubNetworkEmailer(nodeCron, emailConfig, dbFacade) {
  var async = require('async');

  this.startCron = startCron;
  this.sendSubNetEmail = sendSubNetEmail;

  function startCron(schedule, timezone) {
    var _schedule = schedule || '0 0 0 * * 0';
    var _timezone = timezone || 'America/Los_Angeles';

    this.cronJob = new nodeCron.CronJob(_schedule, sendSubNetEmail, null, true, _timezone);
  }

  function sendSubNetEmail() {
    // For each user, send an email detailing the needs of the users within their subnetwork
    dbFacade.getUsers((users) => {
      async.eachSeries(users, (user, next) => {
        dbFacade.getSubNetworkForUser(user, {}, (subNet) => {
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

module.exports = SubNetworkEmailer;