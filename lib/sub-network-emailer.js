function SubNetworkEmailer(emailConfig, dbFacade) {
  var CronJob = require('cron').CronJob;
  var async = require('async');

  var _schedule = emailConfig.schedule || '0 0 0 * * 0';
  var _timezone = emailConfig.timezone || 'America/Los_Angeles';

  var subNetworkCron = new CronJob(_schedule, () => {
    // For each user, send an email detailing the needs of the users within their subnetwork
    var users = dbFacade.getUsers((users) => {
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
  }, null, true, _timezone);
}

module.exports = SubNetworkEmailer;