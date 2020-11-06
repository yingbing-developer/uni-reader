package com.itstudy.io;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;

/**
 * @Title: FileList
 * @author: 康雷  e-mail: 1014295211@qq.com
 * @date: 2020/9/22 16:51
 * @ClassName: FileList
 * @Description:
 */
public class GetFileList {


    public String getFiles(String path) throws IOException, JSONException {
        File file = new File(path);
        File[] files = file.listFiles();
        JSONArray folderJsonArray = new JSONArray();
        JSONArray fileListJsonArray = new JSONArray();
        for (File value : files) {
            if ( !value.isHidden() ) {
                JSONObject jsonObject = new JSONObject();
                if (value.isDirectory()) {
                    jsonObject.put("name", value.getName());
                    jsonObject.put("path", value.getPath());
                    jsonObject.put("type", "folder");
                    jsonObject.put("size", "0B");
                    jsonObject.put("time", this.getFileTime(value));
                    jsonObject.put("createTime",value.lastModified());
                    folderJsonArray.put(jsonObject);
                }
                if (value.isFile()) {
                    if ("txt".equals(this.getFileType(value))) {
                        jsonObject.put("name", value.getName());
                        jsonObject.put("path", value.getPath());
                        jsonObject.put("type", this.getFileType(value));
                        jsonObject.put("size", this.getFileSize(value));
                        jsonObject.put("time", this.getFileTime(value));
                        jsonObject.put("createTime",value.lastModified());
                        fileListJsonArray.put(jsonObject);
                    }
                }
            }
        }
        return folderJsonArray.toString() + "::" + fileListJsonArray.toString();
    }

    private String getFileType(File file) {
        String fileName = file.getName();
        if (!fileName.contains(".")) {
            return "file";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length());
    }

    private String getFileSize(File file) throws IOException {
        FileInputStream fs = new FileInputStream(file);
        DecimalFormat df = new DecimalFormat("#.00");
        double size = fs.available();
        String fileSizeString;
        if (size == 0) {
            fileSizeString = "0B";
        } else if (size < 1024) {
            fileSizeString = size + "B";
        } else if (size < 1048576) {
            fileSizeString = df.format(size / 1024) + "KB";
        } else if (size < 1073741824) {
            fileSizeString = df.format(size / 1048576) + "MB";
        } else {
            fileSizeString = df.format(size / 1073741824) + "GB";
        }
        return fileSizeString;
    }

    private String getFileTime(File file) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        return formatter.format(file.lastModified());
    }
}
