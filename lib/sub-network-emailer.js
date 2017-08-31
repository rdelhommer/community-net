function SubNetworkEmailer(nodeCron, emailConfig, dbFacade) {
  var async = require('async');
  var _emailConfig = emailConfig;

  var _emailTemplate =
    '<h1>Your Network</h1>' +
    '<p>The following is a list of nearby people in your network along with their needs and skills.</p>';

  var _userTemplate =
    '<h2>%%USER_NAME%%</h2>' +
    '<h3>Skills</h3>' +
    '<ul>' +
    '%%USER_SKILLS%%' +
    '</ul>' +
    '<h3>Needs</h3>' +
    '<ul>' +
    '%%USER_NEEDS%%' +
    '</ul>';

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
        dbFacade.getSubNetworkForUser(user, {}, (subNetUsers) => {
          _emailConfig.transporter.sendMail({
            to: user.email,
            from: _emailConfig.from,
            subject: _emailConfig.subject,
            html: buildEmailBody(subNetUsers)
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

  function buildEmailBody(subNetUsers) {
    var ret = [ _emailTemplate ];
    subNetUsers.forEach((u) => {
      var needs = u.needs.map(n => '<li>' + n + '</li>').join('');
      var skills = u.skills.map(n => '<li>' + n + '</li>').join('');

      ret.push(_userTemplate.replace('%%USER_NAME%%', u.name)
        .replace('%%USER_SKILLS%%', skills)
        .replace('%%USER_NEEDS%%', needs));
    });

    return ret.join('');
  }
}

module.exports = SubNetworkEmailer;