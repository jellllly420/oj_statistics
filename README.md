# oj_statistics
This project is for fetching the submission statistics of PKU Programming Grid.
## Format
### JSON
The result json object has the `Records` type below.
```typescript
type State = "Passed" | "WrongAnswer" | "Testing" | "Timeout" | "RuntimeError" | "EmptyOutput"

type Submission = {
    state: State,
    time: string
}

type Prob = {
    id: string,
    submissions: Submission[],
    times: number,
    accept: number,
    testing: number,
    fail: number,
    first_submission_date: stirng,
    last_submission_date: string,
    date_diff: string
}

type Student = {
    id: string,
    name: string,
    probs: Prob[],
}

type Records = Student[]
```
### XLSX
You can easily find out in `json2xlsx.json`.
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
_Tips: Since the code is written for multiple probsets, so you can get some `probset*.json` first and run this command only once._
