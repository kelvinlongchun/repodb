# Overview

This TypeScript module will make your Github private repository become a JSON database.

# Get Started

## Github API Token

Before you start, please make sure you have a Github API access token of your account. ([https://github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta))

And you need to confirm the settings of `Repository Access` and `Account Permissions`.
| Type | Setting |
|:--------------------|:--------------------------------------------------------------------------------------------------------|
| Repository Access | All repositories |
| Account Permissions | Administration (Read and write)<br /> Commit statuses (Read and write) <br /> Contents (Read and write) |

## Setup

You need to install module `repodb` first.

```
npm i repodb
```

Import the module

```ts
import repodb, { Data, GithubOptions } from "repodb";
```

Initiate `repodb` by using function `repodb.initiate(options)`. Please note that it is an async/await function.

It will check your Github repository. If there is no the targeted repository, a private repository will be created automatically.

```ts
const githubOptions: GithubOptions = {
  token: "YOUR_GITHUB_API_TOKEN",
  username: "YOUR_USERNAME",
  repo: "YOUR_REPO_NAME",
};
await repodb.initiate(githubOptions);
```

## Create Data Object

You also need to create a data object by using function `repodb.newData(dataName)` to handle CRUD operations.

This function will check JSON File `[dataName].json` on your repository. If there is no the JSON file, it will be created automatically. Please note that it is an async/await function.

You don't need to create the data object for existing data in the repository, since the module has already updated the data at the initiation stage.

```ts
const STUDENTS = "students";
await repodb.addData(STUDENTS);
```

## Read Data

You just need to get the array `repodb.data[dataName]` to read the data.

You can also use type `Data` for type checking (which is optional).

```ts
// Type checking (optional)
interface Student {
  name: string;
  age: number;
}
const students: Data<Student> = repodb.data[STUDENTS];
students; // Get the whole data array
students[0]; // Get the 1st item of the data array
```

You can also use vanilla JS array functions to read the data.

```ts
students.find((item: Student) => item.age > 15); // Vanilla JS array function
students.filter((item: Student) => item.name !== "Amy"); // Vanilla JS array function
```

## Update Data

Regarding data update, we can change the array `repodb.data[dataName]` directly. Once you finish the amendment, you can use function `repodb.data[dataName].update()` to let the changees upload to the Github Repository. Please note that it is an async/await function.

```ts
students.push({ name: "Bob", age: 17 }); // Vanilla JS array function
students.pop(); // Vanilla JS array function
await students.update();
```

## Delete Data

If you want to delete the data in the repository, use function `repodb.data[dataName].delete()`. It will deleted the JSON file in the repository. Please note that it is an async/await function.

```ts
await students.delete();
```

## Delete Repository

It you want to delete the whole database(the repository), use function `repodb.deleteRepo()`. Please note that it is an async/await function.

```ts
await repodb.deleteRepo();
```

## Example

Please check the code in [/src/examples/exmaple.ts](https://github.com/kelvinlongchun/repodb/blob/main/examples/example.ts)
