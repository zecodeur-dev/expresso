const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ROUTES = require("@routes/routes");

/**
 * Service for uploading files and accessing them
 */
class UploadService {
  static #uploadPath = "uploads/";

  /**
   * Sets the base path for file uploads.
   *
   * @param {string} path - The path to set for file uploads.
   */
  static setUploadPath(path) {
    UploadService.#uploadPath = path;
  }

  static #routePath = ROUTES.STORAGE_GET_FILE;
  static #routePutPath = ROUTES.STORAGE_PUT_FILE;

  /**
   * Returns the route path for accessing a file based on its filename.
   *
   * @param {string} filename - The filename for which to get the route path.
   *
   * @returns {string} - The route path.
   */
  static getRoutePath(filename) {
    return UploadService.#routePath.split(":")[0] + filename;
  }

  static #mediasType = {
    video: ["mp4", "mkv", "avi", "mov", "wmv", "flv"],
    image: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
    audio: ["mp3", "wav", "aac", "ogg", "flac", "m4a"],
    document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"],
    runnable: ["exe", "sh", "bat", "jar", "apk", "py"],
    archive: ["zip", "rar", "tar", "iso", "7z"],
    none: [""],
  };

  static #mediasPath = {
    video: "videos/",
    image: "images/",
    audio: "audios/",
    document: "documents/",
    runnable: "runnables/",
    archive: "archives/",
    none: "nones/",
  };

  /**
   * Extracts the file extension from a file object.
   *
   * @param {Object} file - The file object.
   * @param {string} file.originalname - The original name of the file.
   *
   * @returns {string} - The file extension.
   */
  static #fileExt(file) {
    const split = file.originalname.split(".");
    return split.length < 2 ? "" : split[split.length - 1];
  }

  /**
   * Determines the folder where the file should be stored based on its extension.
   *
   * @param {Object} file - The file object.
   * @param {string} file.originalname - The original name of the file.
   *
   * @returns {string} - The folder path for the file.
   */
  static #fileFolder(file) {
    let folder = "none";
    for (let key of Object.keys(UploadService.#mediasType)) {
      if (UploadService.#mediasType[key].includes(UploadService.#fileExt(file))) {
        folder = key;
        break;
      }
    }
    const up = UploadService.#mediasPath[folder];
    return path.join(UploadService.#uploadPath, up);
  }

  static #generateFileName = () =>
    Date.now() + "-" + Math.round(Math.random() * 1e9);

  /**
   * Sets a custom function to generate the file name.
   *
   * @param {Function} func - The custom function to generate the file name.
   */
  static setGenerateFileName(func = UploadService.#generateFileName) {
    UploadService.#generateFileName = func;
  }

  static #storage = multer.diskStorage({
    /**
     * Sets the destination folder for uploaded files.
     *
     * @param {Object} req - The request object.
     * @param {Object} file - The file object.
     * @param {Function} cb - The callback function to set the folder.
     */
    destination: (req, file, cb) => {
      let folder = UploadService.#fileFolder(file);
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

      cb(null, folder);
    },
    /**
     * Sets the filename for the uploaded file.
     *
     * @param {Object} req - The request object.
     * @param {Object} file - The file object.
     * @param {Function} cb - The callback function to set the filename.
     */
    filename: (req, file, cb) => {
      cb(null, UploadService.#generateFileName() + "." + UploadService.#fileExt(file)); // Unique name to avoid conflicts
    },
  });

  static middleware = multer({ storage: UploadService.#storage });

  /**
   * Deletes a file by its filename.
   *
   * @param {string} filename - The name of the file to delete.
   */
  static deleteFileByName(filename) {
    if (!filename) return;
    UploadService.deleteUploadedFiles([UploadService.file(filename)]);
  }

  /**
   * Deletes multiple uploaded files.
   *
   * @param {Array<Object>} files - The list of file objects to delete.
   */
  static deleteUploadedFiles(files) {
    files.forEach((file) => {
      if (!file) return;
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting file: ${file.path}`, err);
      });
    });
  }

  /**
   * Returns the file object for a given filename.
   *
   * @param {string} filename - The filename of the file.
   *
   * @returns {Object} - The file object containing file details.
   */
  static file(filename) {
    const p = path.resolve(
      UploadService.#fileFolder({
        originalname: filename,
      }),
      filename
    );

    return {
      filename,
      folder: UploadService.#fileFolder({
        originalname: filename,
      }),
      path: p,
    };
  }

  /**
   * Middleware to handle file retrieval by filename.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  static getFile(req, res, next) {
    const filename = req.params.filename;
    if (!filename) return res.sendStatus(400);
    const p = UploadService.file(filename).path;

    if (!fs.existsSync(p)) return res.sendStatus(404);
    return res.sendFile(p);
  }

  /**
   * Middleware to handle file upload.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The next middleware function.
   */
  static putFile(req, res, next) {
    const files = [];
    for (let file of req.files ?? []) {
      files.push(UploadService.getRoutePath(file.filename));
    }

    return res.json(files);
  }

  /**
   * Creates and returns an Express router for file-related routes.
   *
   */
  static get router() {
    const r = require("express").Router();
    r.get(UploadService.#routePath, UploadService.getFile);
    r.post(
      UploadService.#routePutPath,
      UploadService.middleware.any,
      UploadService.putFile
    );
    return r;
  }
}

module.exports = UploadService;
