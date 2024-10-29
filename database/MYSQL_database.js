//dependencies

var mysql = require("mysql2");

/////////////////////////////////


const {

	DB_HOST,
	DB_USER,
	DB_PASSWORD,
	DB_NAME

} = process.env;
///////////////////////////////////////////
//comment in logs below to see env variables for debugging
// console.log('db host: ', DB_HOST);
// console.log('db user: ', DB_USER);
// console.log('db pass: ', DB_PASSWORD);
// console.log('db name: ', DB_NAME);



// using pool to allow for asynch processing and to simplify request, query, & release flow
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : DB_HOST,
  user            : DB_USER,
  password        : DB_PASSWORD,
  database        : DB_NAME,
  charset         : 'utf8mb4',
  queryFormat: (query, values) => {

    // faciltates property replacement in queries with parameter sanitation i.e
    // connection.query("UPDATE posts SET title = :title", { title: "Hello MySQL" });

    if (!values) return query;

    return query.replace(/\:(\w+)/g, function (txt, key) {

      if (values.hasOwnProperty(key)) {

        return pool.escape(values[key]);
      }

      return txt;

    }.bind(this));
  }
   // ssl      : '' // https://github.com/mysqljs/mysql#ssl-options
});


exports.pool = pool;
