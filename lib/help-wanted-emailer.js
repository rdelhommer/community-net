function HelpWantedEmailer(nodeCron, emailConfig, dbFacade) {
  var async = require('async');
  var _emailConfig = emailConfig;

  var _emailTemplate =
    '<h1>Help Wanted</h1>' +
    '<p>The following people in your network have needs that match your skills.</p>';

  var _userTemplate =
    '<h2>%%USER_NAME%%</h2>' +
    '<ul>' +
    '%%USER_NEEDS%%' +
    '</ul>';

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
        dbFacade.getUsersToHelp(user, {}, (usersToHelp) => {
          if (usersToHelp.length === 0) return next();

          _emailConfig.transporter.sendMail({
            to: user.email,
            from: _emailConfig.from,
            subject: _emailConfig.subject,
            html: buildEmailBody(usersToHelp)
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

  function buildEmailBody(usersToHelp) {
    var ret = [ _emailTemplate ];
    usersToHelp.forEach((u) => {
      var needs = u.needs.map(n => '<li>' + n + '</li>').join('\n');

      ret.push(_userTemplate.replace('%%USER_NAME%%', u.name)
        .replace('%%USER_NEEDS%%', needs));
    });

    return ret.join('\n');
  }
}

module.exports = HelpWantedEmailer;