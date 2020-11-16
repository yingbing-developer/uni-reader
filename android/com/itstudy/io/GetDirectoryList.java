package com.itstudy.io;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;

/**
 * @Title: FileList
 * @author: 康雷  e-mail: 1014295211@qq.com
 * @date: 2020/9/22 16:51
 * @ClassName: GetDirectoryList
 * @Description: 获取指定路径下的文件夹列表
 */
public class GetDirectoryList {


    public String getDirectories(String path) throws IOException, JSONException {
        File file = new File(path);
        File[] files = file.listFiles();
        JSONArray folderJsonArray = new JSONArray();
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
            }
        }
        return folderJsonArray.toString();
    }

    private String getFileTime(File file) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        return formatter.format(file.lastModified());
    }
}
