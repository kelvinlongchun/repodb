class CommonUtils {
  static removeFileExtension(filePath: string) {
    const extractedStringArray = filePath.split(".");
    const arrayLastIndex = extractedStringArray.length - 1;
    const extensionLength = extractedStringArray[arrayLastIndex].length + 1;
    const lastIndex = filePath.length - extensionLength;
    return filePath.substring(0, lastIndex);
  }

  static getFileExtension(filePath: string) {
    const extractedStringArray = filePath.split(".");
    const lastIndex = extractedStringArray.length - 1;
    return extractedStringArray[lastIndex];
  }

  static handleCatchError(error: Error) {
    console.error(error.message);
    process.exit(1);
  }
}

export default CommonUtils;
