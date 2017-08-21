# community-net
Node module that provides networking functionality for communities based on the needs and skills of members within a community

The module assumes you have some kind of database model that stores data about the needs and skills of individual members of your community.

Currently has two emailer components.  See Usage section for details

## Installation
```js
npm install community-net
```

## Usage
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

  function convertDoc(userDoc) {
    // Converts are returns the user database document into the user object used by Community Net
  }
}
```

All database user documents should be converted to the Community Net user obejct before being consumed by the modeul. The user object used by Community Net is defined below
```js
{
  name: String,
  email: String,
  needs: [String, ..., String],
  skills: [String, ..., String]
}
```