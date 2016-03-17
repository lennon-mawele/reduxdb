# reduxdb ![build status](https://travis-ci.org/wizawu/reduxdb.svg)

Notice that NOT all the features of MongoDB are implemented here, such as multi-index and query operators.

The purpose of _reduxdb_ is to avoid writing almost the same actions and stores again and again in different projects.

### Installation

```shell
npm install --save redux reduxdb
```

### Usage

```javascript
import reduxdb = require("reduxdb")

let db = reduxdb.use("mysite")
db.createCollection("user", {index: "id"})
db.createCollection("team", {index: "id"})
db.createCollection("book")     // using default index `_id`

db.user.insert({id: "123", name: "wizawu"})
db.user.findOne({name: "wizawu"}).id    // "123"
```

### API

#### reduxdb

+ use(name)  
  Return an `reduxdb.DB` object. Create if not exist.

#### reduxdb.DB

+ createCollection(name, options)  
  `options` can be only used to define index, for example
  
  ```
  db.createCollection("user", {index: "uid"})
  ```
+ [getCollection(name)](https://docs.mongodb.org/manual/reference/method/db.getCollection/)
+ [getCollectionNames()](https://docs.mongodb.org/manual/reference/method/db.getCollectionNames/)
+ [getName()](https://docs.mongodb.org/manual/reference/method/db.getName/)
+ [stats()](https://docs.mongodb.org/manual/reference/method/db.stats/)
+ [subscribe(listener)](http://redux.js.org/docs/api/Store.html#subscribe)

#### reduxdb.Collection

`insert`, `remove`, `save` and `update` operations would be passed using Redux's events. 

+ [copyTo(newCollection)](https://docs.mongodb.org/manual/reference/method/db.collection.copyTo/)
+ [count()](https://docs.mongodb.org/manual/reference/method/db.collection.count/)
+ [drop()](https://docs.mongodb.org/manual/reference/method/db.collection.drop/)
+ [find(query)](https://docs.mongodb.org/manual/reference/method/db.collection.find/)  
  See [Query for Equality](https://docs.mongodb.org/manual/reference/method/db.collection.find/), for example
  
  ```
  // Return all users matching {"age": 18, "name": {"first": "Andrew"}}
  db.user.find({"age": 18, "name.first": "Andrew"})
  ```
+ [findOne(query)](https://docs.mongodb.org/manual/reference/method/db.collection.findOne/)  
  Same `query` type as `find()`.
+ getDB()
+ getFullName()
+ getIndexKeys()
+ getName()
+ [insert(&lt;document or array of documents>)](https://docs.mongodb.org/manual/reference/method/db.collection.insert/)  
  No `options` supported here.
+ [remove(query)](https://docs.mongodb.org/manual/reference/method/db.collection.remove/)  
  Same `query` type as `find()`.
+ [renameCollection(newName)](https://docs.mongodb.org/manual/reference/method/db.collection.renameCollection/)
+ [save(document)](https://docs.mongodb.org/manual/reference/method/db.collection.save/)
+ [stats()](https://docs.mongodb.org/manual/reference/method/db.collection.stats/)
+ [update(query, update, options)](https://docs.mongodb.org/manual/reference/method/db.collection.update/)  
  Same `query` type as `find()`. `upsert` and `multi` are supported in `options`.