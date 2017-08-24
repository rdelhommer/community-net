function SubNetworkEmailer(nodeCron, emailConfig, dbFacade) {
  var async = require('async');
  var _emailConfig = emailConfig;

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
          _emailConfig.transporter.sendMail({
            to: user.email,
            from: _emailConfig.from,
            subject: _emailConfig.subject,
            html: 'TODO'
          }, next);
        }, next);
      }, (asyncErr) => {
        if (asyncErr && _emailConfig.onErrorCallback) {
          return _emailConfig.onErrorCallback(asyncErr);
        }

        if (_emailConfig.onSuccessCallback) {
          return _emailConfig.onSuccessCallback();
        }
      });
    }, _emailConfig.onErrorCallback);
  }
}

module.exports = SubNetworkEmailer;