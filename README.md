# Scrum development Board

Tool to manage project on a scrum-basis

## Project-Setup
1. Download NodeJS (https://nodejs.org/en/download/) and install (in my case v.8.9.3)

2. Download MongoDB, install and create data-directory via cmd ```md \data\db```

3. BASH: Clone Project and install (```npm i```) node-modules in root-, api- and app-folder

4. CMD: Open MongoDB\Server\3.6\bin folder and run ```mongod.exe```

5. BASH: Start app by running ```npm start``` from project-root

Hint: Before restarting app, run ```npm stop``` to kill all running node-processes (blocked ports)

## Technology-Stack
* Client: ReactJS + Redux
* Server: NodeJS + KoaJS
* DB: MongoDB