import CommonUtils from "./CommonUtils";
import GithubRepo, { GithubOptions } from "./GithubRepo";
import Data from "./Data";

class Repodb {
  private _repo: GithubRepo;
  private _options: GithubOptions;
  data: { [key: string]: Data<any> };

  constructor() {
    this.data = {};
    this._repo = new GithubRepo({
      token: "",
      username: "",
      repo: "",
      branch: "",
    });
    this._options = this._repo.options;
  }

  get options() {
    return this._options;
  }

  set options(value: GithubOptions) {
    this._repo.options = { ...this._repo.options, ...value };
    this._options = this._repo.options;
  }

  private async _createJsonFile(
    filePath: string,
    data: Object,
    message?: string
  ) {
    const content = Buffer.from(JSON.stringify(data)).toString("base64");
    return await this._repo.createFile(filePath, content, message);
  }

  private async _updateDataFromGithub<T>(data: Data<T>) {
    const filePath = data.name + ".json";
    data.splice(0, data.length);
    let newData = (await this._repo.getJsonFile(filePath)) as Array<T>;
    newData = newData ? newData : [];
    data.push(...newData);
    const fileSha = (await this._repo.getFileSha(filePath)) as string;
    data.sha = fileSha;
  }

  async initiate(options: GithubOptions) {
    options.branch = options.branch ? options.branch : "main";
    this.options = options;

    const isThisRepoExisting = await this._repo.isRepoExisting();

    if (!isThisRepoExisting) {
      await this._repo.createRepo(true);
    }

    const filenames = await this._repo.getRepoFileNames();

    if (filenames) {
      for (const name of filenames) {
        if (CommonUtils.getFileExtension(name) === "json") {
          const dataName = CommonUtils.removeFileExtension(name);
          await this.addData(dataName);
        }
      }
    }

    console.log("Github Repo Database is started.");
  }

  async addData<T>(dataName: string) {
    this.data[dataName] = new Data<T>(dataName);

    const filePath = `${dataName}.json`;

    const isFileExisting = await this._repo.isFileExisting(filePath);

    if (!isFileExisting) {
      const sha = (await this._createJsonFile(
        filePath,
        this.data[dataName]
      )) as string;
      this.data[dataName].sha = sha;
    } else {
      await this._updateDataFromGithub<T>(this.data[dataName]);
    }
  }

  async deleteRepo() {
    await this._repo.deleteRepo();
  }
}

export default Repodb;
