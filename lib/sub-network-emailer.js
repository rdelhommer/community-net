function SubNetworkEmailer(emailConfig, dbFacade) {
  var CronJob = require('cron').CronJob;
  var async = require('async');

  var subNetworkCron = new CronJob(emailConfig.schedule, () => {
    // For each user, send an email detailing the needs of the users within their subnetwork
    var users = dbFacade.getUsers((users) => {
      async.eachSeries(users, (user, next) => {
        dbFacade.getSubNetworkForUser(user, {}, (subNet) => {
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

module.exports = SubNetworkEmailer;