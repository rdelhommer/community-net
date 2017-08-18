function SubNetworkEmailer(emailConfig, dbFacade) {
  var CronJob = require('cron').CronJob;
  var async = require('async');

  var _schedule = emailConfig.schedule || '0 0 0 * * *';
  var _timezone = emailConfig.timezone || 'America/Los_Angeles';

  var subNetworkCron = new CronJob(_schedule, () => {
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
  }, null, true, _timezone);
}

module.exports = SubNetworkEmailer;