///Part 1: Node Internals

//1. What is the Node.js Event Loop?
    The Node.js Event Loop is a single-threaded loop that handles asynchronous, non-blocking operations. It continuously checks for pending tasks, executes callbacks, and manages I/O events by offloading time-consuming tasks to the system kernel or background threads

//2. What is Libuv and What Role Does It Play in Node.js?
    Libuv is a multi-platform C library that provides Node.js with asynchronous I/O capabilities. It manages the event loop, file system operations, network requests, child processes, and the worker thread pool

//3. How Does Node.js Handle Asynchronous Operations Under the Hood?
    Node.js delegates asynchronous operations to Libuv or native OS mechanisms (like epoll or kqueue). When an async operation completes, Libuv places its associated callback into the event queue. The Event Loop then picks up this callback and executes it on the main thread once the Call Stack is empty

//4. What is the Difference Between the Call Stack, Event Queue, and Event Loop in Node.js?
    --Call Stack: Executes synchronous functions in a Last-In, First-Out (LIFO) order.

    --Event Queue: Holds callbacks and events waiting to be executed once the main thread becomes free.

    --Event Loop: Monitors the Call Stack and Event Queue, moving callbacks from the queue to the stack when the stack is empty

//5. What is the Node.js Thread Pool and How to Set the Thread Pool Size?
    The Thread Pool is a pool of background threads managed by Libuv to execute heavy tasks like file system operations, cryptography, and DNS lookups without blocking the main event loop. The default size is 4, and it can be configured using the environment variable UV_THREADPOOL_SIZE (e.g., process.env.UV_THREADPOOL_SIZE = 8).

//6. How Does Node.js Handle Blocking and Non-Blocking Code Execution?
    Blocking code halts the execution of additional JavaScript until the current operation finishes (e.g., fs.readFileSync). Non-blocking code uses asynchronous APIs (e.g., fs.readFile or Promises), allowing the main thread to continue processing other requests while waiting for I/O tasks to finish in the background.

///Part 2: Express.js CRUD Operations

            const express = require('express');
            const fs = require('fs');
            const path = require('path');

            const app = express();
            app.use(express.json());

            const filePath = path.join(__dirname, 'users.json');

            const getUsersFromFile = () => {
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, JSON.stringify([]));
            }
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data || '[]');
            };

            const saveUsersToFile = (users) => {
            fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
            };
            app.post('/user', (req, res) => {
            const { name, age, email } = req.body;
            const users = getUsersFromFile();

            const userExists = users.find((u) => u.email === email);
            if (userExists) {
                return res.json({ message: 'Email already exists.' });
            }

            const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;
            const newUser = { id: newId, name, age, email };
            users.push(newUser);
            saveUsersToFile(users);

            return res.json({ message: 'User added successfully.' });
            });
            app.patch('/user/:id', (req, res) => {
            const id = parseInt(req.params.id);
            const { name, age, email } = req.body;
            const users = getUsersFromFile();

            const userIndex = users.findIndex((u) => u.id === id);
            if (userIndex === -1) {
                return res.json({ message: 'User ID not found.' });
            }

            if (name !== undefined) users[userIndex].name = name;
            if (age !== undefined) users[userIndex].age = age;
            if (email !== undefined) users[userIndex].email = email;

            saveUsersToFile(users);
            return res.json({ message: 'User age updated successfully.' });
            });

            app.delete(['/user/:id', '/user'], (req, res) => {
            const id = parseInt(req.params.id || req.body.id);
            const users = getUsersFromFile();

            const userIndex = users.findIndex((u) => u.id === id);
            if (userIndex === -1) {
                return res.json({ message: 'User ID not found.' });
            }

            users.splice(userIndex, 1);
            saveUsersToFile(users);
            return res.json({ message: 'User deleted successfully.' });
            });

            app.get('/user/getByName', (req, res) => {
            const { name } = req.query;
            const users = getUsersFromFile();

            const matchedUsers = users.filter((u) => u.name.toLowerCase() === name?.toLowerCase());
            if (matchedUsers.length === 0) {
                return res.json({ message: 'User name not found.' });
            }

            return res.json(matchedUsers);
            });

            app.get('/user/filter', (req, res) => {
            const minAge = parseInt(req.query.minAge);
            const users = getUsersFromFile();

            const filteredUsers = users.filter((u) => u.age >= minAge);
            if (filteredUsers.length === 0) {
                return res.json({ message: 'no user found' });
            }

            return res.json(filteredUsers);
            });

            app.get('/user/:id', (req, res) => {
            const id = parseInt(req.params.id);
            const users = getUsersFromFile();

            const user = users.find((u) => u.id === id);
            if (!user) {
                return res.json({ message: 'User not found' });
            }

            return res.json(user);
            });

            app.get('/user', (req, res) => {
            const users = getUsersFromFile();
            return res.json(users);
            });

            app.listen(3000, () => {
            console.log('Server running on port 3000');
            });

///Part 2: bonus

    var longestCommonPrefix = function(strs) {
        if (!strs || strs.length === 0) return "";
        let prefix = strs[0];
        for (let i = 1; i < strs.length; i++) {
            while (strs[i].indexOf(prefix) !== 0) {
                prefix = prefix.substring(0, prefix.length - 1);
                if (prefix === "") return "";
            }
        }
        return prefix;
    };
