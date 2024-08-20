"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const http_errors_1 = __importDefault(require("http-errors"));
const UPLOAD_PATH = config_1.default.uploadFolder || "public/images/users";
const MAX_FILE_SIZE = Number(config_1.default.maxFileSize) || 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".xlsx",
    ".xls",
    ".csv",
    ".pdf",
    ".doc",
    ".docx",
    ".mp3",
    ".wav",
    ".ogg",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
    ".svg",
];
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        const extName = path_1.default.extname(file.originalname);
        console.log("extName: ", extName);
        const fileName = `${Date.now()}-${file.originalname.replace(extName, "")}${extName}`;
        req.body.image = fileName;
        cb(null, fileName);
    },
});
const fileFilter = (req, file, cb) => {
    let extName = path_1.default.extname(file.originalname).toLocaleLowerCase();
    const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
    if (!isAllowedFileType) {
        return cb((0, http_errors_1.default)(400, "File type not allowed"));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});
exports.default = upload;
