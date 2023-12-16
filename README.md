# oj_statistics
This project is for fetching the submission statistics of PKU Programming Grid.
## Usage
### Install the dependencies
```bash
npm install
```
### Data to Json
First, create a `config.json` according to the `config-template.json`.
Then, run
```bash
node data2json.js
```
_Attention: Since the code is written for single probset, so you need to modify `config.json` if you want to switch between probsets._
### Json to xlsx
First, create a `config.json` according to the `config-template.json`.
Then, run
```bash
node json2xlsx.js
```
_Tips: Since the code is written for multiple probsets, so you can get some `probset_*.json` first and run this command only once._
