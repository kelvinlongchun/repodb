// Import the module
import repodb from "repodb";
import { Data, GithubOptions } from "repodb"; // Type checking (optional)

// Setting Github options
const githubOptions: GithubOptions = {
  token: "YOUR_GITHUB_API_TOKEN",
  username: "YOUR_USERNAME",
  repo: "YOUR_REPO_NAME",
};

async function runExample() {
  //   Initiate repodb
  await repodb.initiate(githubOptions);

  // Create and initiate the data object
  const STUDENTS = "students";
  await repodb.addData(STUDENTS);

  // Type checking (optional)
  interface Student {
    name: string;
    age: number;
  }

  // Read the data
  const students: Data<Student> = repodb.data[STUDENTS];
  students; // Get the whole data array
  students[0]; // Get the 1st item of the data array
  students.find((item: Student) => item.age > 15); // Vanilla JS array funtcion
  students.filter((item: Student) => item.name !== "Amy"); // Vanilla JS array funtcion

  // Edit the data by using Vanilla JS array funtcion
  students.push({ name: "Bob", age: 17 }); // Vanilla JS array funtcion
  students.pop(); // Vanilla JS array funtcion

  // // Update the data to the Github repository
  await students.update();

  // // Delete the data from the Github repository
  await students.delete();

  // Delete the repository
  await repodb.deleteRepo();
}

runExample();
