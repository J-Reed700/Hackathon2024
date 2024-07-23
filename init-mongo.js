var db = connect('mongodb://mongo:27017/admin'); // Connecting to admin DB

db.createUser({
  user: 'admin',
  pwd: 'pass',
  roles: [
    {
      role: 'root', // Assigning root role
      db: 'admin',
    },
  ],
});
