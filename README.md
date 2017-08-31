# community-net
Node module that provides networking functionality for communities based on the needs and skills of members within a community

The module assumes you have some kind of database model that stores data about the needs and skills of individual members of your community.

Currently has two emailer components.  See Usage section for details

## Installation
```js
npm install community-net
```

## Usage
### Emailer Config
Each emailer takes a config object with the following interface
```js
{
  transporter: Object, // nodemailer transporter object
  from: String, // Email sender
  subject: String, // Email subject
  onErrorCallback: (err) => { ... }, // Optional
  onSuccessCallback: () => { ... }, // Optional
}
```

Please see [nodemailer documentation](https://nodemailer.com/smtp/) for information about email transporters and how to choose an appropriate one for your application.

### Cron
The emailer function can be invoked once or on a cron schedule.

#### Single Invocation
```js
helpWantedEmailer.sendHelpWantedEmail();
```
or
```js
subNetworkEmailer.sendSubNetEmail();
```

#### Scheduled Invocation
The function startCron has two parameters - schedule and timezone.  The default values of each is shown below.
```js
var cronJob = emailer.startCron('0 0 0 * * 0', 'America/Los_Angeles')
```

Please see [node-cron documentation](https://github.com/kelektiv/node-cron) for more information.

### Help Wanted Emailer
Matches each user with other users whose needs match the user's skill.  For example, if you have the following users:
```js
[
  {
    name: 'Bob',
    needs: ['carpentry', 'caulking',]
    skills: ['plumbing', 'electricity']
  },
  {
    name: 'Jack',
    needs: 'plumbing',
    skills: ['farming', 'carpentry']
  },
  {
    name: 'Jill',
    needs: 'carpentry',
    skills: 'robotics'
  }
]
```

* Bob will receive an email saying he can help Jack.
* Jack will receive an email saying he can help Jill.
* Jill will not receive an email because nobody currently needs robotics help.

#### Construction
```js
var HelpWanted = require('community-net').HelpWantedEmailer;
var cron = require('cron');

var emailerConfig = {
  ...
};

// See Extension section for more information about connecting to your database
var dbPlugin = {
  ...
};

var emailer = new HelpWanted(cron, emailerConfig, dbPlugin);
var schedule = '0 0 0 * * 0';
var timezone = 'America/Los_Angeles';

emailer.startCron(schedule, timezone);
```

### Sub Network Emailer
Sends an email to each user detailing the status of their sub-network. Sub-networks can be defined in any way based upon how consumers implement the database plugin interface.  Sub-networks could be defined by zip code, city, state, neighborhood, interest, sport, etc.

For example, if you have the following users:
```js
[
  {
    name: 'Bob',
    zip: 11111
    needs: ['carpentry', 'caulking',]
    skills: ['plumbing', 'electricity']
  },
  {
    name: 'Jack',
    zip: 11112
    needs: 'plumbing',
    skills: ['farming', 'carpentry']
  },
  {
    name: 'Jill',
    zip: 11111
    needs: 'carpentry',
    skills: 'robotics'
  }
]
```

* Bob will receive an email detailing the needs and skills of Jill
* Jack will receive an email saying nobody is in his sub-network :(
* Jill will receive an email detailing the needs and skills of Bob

#### Construction
```js
var SubNetwork = require('community-net').SubNetworkEmailer;
var cron = require('cron');

var emailerConfig = {
  ...
};

// See Extension section for more information about connecting to your database
var dbPlugin = {
  ...
};

var emailer = new SubNetwork(cron, emailerConfig, dbPlugin);
var schedule = '0 0 0 * * 0';
var timezone = 'America/Los_Angeles';

emailer.startCron(schedule, timezone);
```

## Extension
Community Net can be extended to accomodate whatever database solution your app uses.

The following database plugins have already been implemented:
* [Mongoose](https://github.com/rdelhommer/community-net-mongoose)

To create a new plugin, create an object that implements the following interface and inject it into an emailer at construction.
```js
{
  function getUsers(onSuccessCallback, onErrorCallback) {
    // returns all users in the database
  }

  // user param is a member of the array returned from the getUsers function on this interface
  function getSubNetworkForUser(user, onSuccessCallback, onErrorCallback) {
    // returns all users in a particular user's sub network
  }

  // user param is a member of the array returned from the getUsers function on this interface
  function getUsersToHelp(user, onSuccessCallback, onErrorCallback) {
    // returns all users that a particular user can help
  }
}
```

All database user documents should be converted to the Community Net user obejct before being consumed by the module. The user object used by Community Net is defined below
```js
{
  name: String,
  email: String,
  needs: [String, ..., String],
  skills: [String, ..., String]
}
```
