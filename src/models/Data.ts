import GithubRepo from "./GithubRepo";
import repodb from "..";

class Data<T> extends Array<T> {
  name: string;
  sha: string;

  constructor(name: string) {
    super();
    this.name = name;
    this.sha = "";
  }

  async update(message?: string) {
    const content = Buffer.from(JSON.stringify(this)).toString("base64");
    const repo = new GithubRepo(repodb.options);
    const newSha = (await repo.updateFile(
      this.name + ".json",
      content,
      this.sha,
      message
    )) as string;
    this.sha = newSha;
  }

  async delete(message?: string) {
    const repo = new GithubRepo(repodb.options);
    await repo.deleteFile(this.name + ".json", this.sha, message);
    this.splice(0, this.length);
  }
}

export default Data;
