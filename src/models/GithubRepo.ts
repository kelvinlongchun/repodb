import CommonUtils from "./CommonUtils";

interface GithubOptions {
  token: string;
  username: string;
  repo: string;
  branch?: string;
}

class GithubRepo {
  options: GithubOptions;

  constructor(options: GithubOptions) {
    this.options = options;
  }

  private async _throwError(message: string, response?: Response) {
    if (response) {
      const responseData = await response.json();
      message = `${message}: ${responseData.message}`;
    }
    throw new Error(message);
  }

  private async _getFileContentResponse(filePath: string) {
    const response = await fetch(
      `https://api.github.com/repos/${this.options.username}/${this.options.repo}/contents/${filePath}?ref=${this.options.branch}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  }

  private async _updateFIleAndGetResponse(
    filePath: string,
    content: string,
    sha: string,
    message?: string
  ) {
    message = message ? message : `updated file [${filePath}]`;

    const response = await fetch(
      `https://api.github.com/repos/${this.options.username}/${this.options.repo}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          content: content,
          sha: sha,
          branch: this.options.branch,
        }),
      }
    );

    return response;
  }

  private async _deleteFileAndGetResponse(
    filePath: string,
    sha: string,
    message?: string
  ) {
    message = message ? message : `deleted file [${filePath}]`;

    const response = await fetch(
      `https://api.github.com/repos/${this.options.username}/${this.options.repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.options.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          branch: this.options.branch,
          sha: sha,
        }),
      }
    );

    return response;
  }

  async isRepoExisting() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.options.username}/${this.options.repo}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.options.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      switch (response.status) {
        case 200:
          return true;
        case 404:
          return false;
        default:
          await this._throwError(
            `Cannot check repository [${this.options.repo}] existence`,
            response
          );
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async createRepo(isPrivate: boolean) {
    try {
      const response = await fetch(`https://api.github.com/user/repos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.options.token}`,
        },
        body: JSON.stringify({ name: this.options.repo, private: isPrivate }),
      });

      switch (response.status) {
        case 201:
          console.log(`Created the repository [${this.options.repo}].`);
          break;
        default:
          await this._throwError(
            `Cannot create the repository [${this.options.repo}]`,
            response
          );
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async getRepoFileNames() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.options.username}/${this.options.repo}/contents/?ref=${this.options.branch}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.options.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const filenames: string[] = [];

      switch (response.status) {
        case 200:
          const responseData = await response.json();
          responseData.forEach((item: { path: string }) => {
            filenames.push(item.path);
          });
          return filenames;
        case 404:
          return filenames;
        default:
          await this._throwError(
            `Cannot get the repository [${this.options.repo}] filenames`,
            response
          );
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async isFileExisting(filePath: string) {
    try {
      const response = await this._getFileContentResponse(filePath);

      switch (response.status) {
        case 200:
          return true;
        case 404:
          return false;
        default:
          await this._throwError(
            `Cannot check file [${filePath}] existence`,
            response
          );
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async getFileSha(filePath: string) {
    try {
      const response = await this._getFileContentResponse(filePath);

      const responseData = await response.json();

      const sha = responseData.sha;

      if (sha) {
        return sha as string;
      } else {
        await this._throwError(`Cannot get the file [${filePath}] sha`);
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async getJsonFile(filePath: string) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.options.username}/${this.options.repo}/contents/${filePath}?ref=${this.options.branch}`,
        {
          headers: {
            Authorization: `Bearer ${this.options.token}`,
            Accept: "application/vnd.github.v3.raw",
            "Content-Type": "application/json",
          },
        }
      );

      switch (response.status) {
        case 200:
          const responseData = (await response.json()) as Object;
          return responseData;
        case 404:
          return undefined;
        default:
          await this._throwError(
            `Cannot get the JSON file [${filePath}]`,
            response
          );
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async createFile(filePath: string, content: string, message?: string) {
    try {
      message = message ? message : `created file [${filePath}]`;

      const response = await fetch(
        `https://api.github.com/repos/${this.options.username}/${this.options.repo}/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.options.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            content: content,
            branch: this.options.branch,
          }),
        }
      );

      switch (response.status) {
        case 200:
        case 201:
          console.log(`Created file [${filePath}].`);
          const responseData = await response.json();
          return responseData.content.sha as string;
        default:
          await this._throwError(`Cannot create file [${filePath}]`, response);
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async updateFile(
    filePath: string,
    content: string,
    sha: string,
    message?: string
  ) {
    try {
      const response = await this._updateFIleAndGetResponse(
        filePath,
        content,
        sha,
        message
      );

      if (response.ok) {
        // Current sha value is correct
        console.log(`Updated file [${filePath}].`);
        const responseData = await response.json();
        return responseData.content.sha as string;
      } else {
        // Current sha value is not correct, get latest sha and try it again
        const newSha = (await this.getFileSha(filePath)) as string;
        const newResponse = await this._updateFIleAndGetResponse(
          filePath,
          content,
          newSha,
          message
        );
        if (newResponse.ok) {
          console.log(`Updated file [${filePath}].`);
          const newResponseData = await newResponse.json();
          return newResponseData.content.sha as string;
        } else {
          await this._throwError(`Cannot update file [${filePath}]`, response);
        }
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async deleteFile(filePath: string, sha: string, message?: string) {
    try {
      const response = await this._deleteFileAndGetResponse(
        filePath,
        sha,
        message
      );

      if (response.ok) {
        // Current sha value is correct
        console.log(`Deleted file [${filePath}].`);
      } else {
        // Current sha value is not correct, get latest sha and try it again
        const newSha = (await this.getFileSha(filePath)) as string;
        const newResponse = await this._deleteFileAndGetResponse(
          filePath,
          newSha,
          message
        );
        if (newResponse.ok) {
          console.log(`Deleted file [${filePath}].`);
        } else {
          await this._throwError(`Cannot delete file [${filePath}]`, response);
        }
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }

  async deleteRepo() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.options.username}/${this.options.repo}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.options.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      switch (response.status) {
        case 204:
          console.log(`Deleted the repository [${this.options.repo}].`);
          break;
        default:
          await this._throwError(
            `Cannot delete the repository [${this.options.repo}]`,
            response
          );
          break;
      }
    } catch (error) {
      CommonUtils.handleCatchError(error as Error);
    }
  }
}

export default GithubRepo;
export { GithubOptions };
