package com.itstudy.io;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Comparator;

/**
 * @Title: FileList
 * @author: 康雷  e-mail: 1014295211@qq.com
 * @date: 2020/9/22 16:51
 * @ClassName: GetFileList
 * @Description: 获取指定路径下的文件列表
 */
public class GetFileList {


    public String getFiles(String path, String type, String option) throws IOException, JSONException {
        File file = new File(path);
        File[] files = file.listFiles();
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File t1, File t2) {
            return (int)(t2.lastModified() - t1.lastModified());
            }
        });
        String[] types = type.split(",");
        String[] options = option.split(",");
        JSONArray fileListJsonArray = new JSONArray();
        for (File value : files) {
            if ( !value.isHidden() ) {
                JSONObject jsonObject = new JSONObject();
                if (value.isFile()) {
                    if ( Arrays.asList(types).contains(this.getFileType(value)) ) {
                        for (String s : options) {
                            if (s.equals("name")) {
                                jsonObject.put(s, value.getName());
                            }
                            if (s.equals("path")) {
                                jsonObject.put(s, value.getPath());
                            }
                            if (s.equals("type")) {
                                jsonObject.put(s, this.getFileType(value));
                            }
                            if (s.equals("size")) {
                                jsonObject.put(s, this.getFileSize(value));
                            }
                            if (s.equals("time")) {
                                jsonObject.put(s, this.getFileTime(value));
                            }
                            if (s.equals("createTime")) {
                                jsonObject.put(s, value.lastModified());
                            }
                        }
                        fileListJsonArray.put(jsonObject);
                    }
                }
            }
        }
        return fileListJsonArray.toString();
    }

    public String getFiles(String path, String type) throws IOException, JSONException {
        File file = new File(path);
        File[] files = file.listFiles();
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File t1, File t2) {
                return (int)(t2.lastModified() - t1.lastModified());
            }
        });
        String[] types = type.split(",");
        JSONArray fileListJsonArray = new JSONArray();
        for (File value : files) {
            if ( !value.isHidden() ) {
                JSONObject jsonObject = new JSONObject();
                if (value.isFile()) {
                    if ( Arrays.asList(types).contains(this.getFileType(value)) ) {
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
        return fileListJsonArray.toString();
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
