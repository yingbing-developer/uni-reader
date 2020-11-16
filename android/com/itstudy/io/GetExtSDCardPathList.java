package com.itstudy.io;


import android.os.Build;
import android.os.Environment;
import android.os.UserHandle;
import android.support.annotation.RequiresApi;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

/**
 * @Title: FileList
 * @author: 康雷  e-mail: 1014295211@qq.com
 * @date: 2020/9/22 16:51
 * @ClassName: GetExtSDCardPathList
 * @Description: 获取扩展TF卡路径
 */
public class GetExtSDCardPathList {


    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public static String getSDPath() throws IOException, JSONException{
        JSONArray paths = new JSONArray();
        try {
            //===========================获取UserEnvironment================
            Class<?> userEnvironment = Class.forName("android.os.Environment$UserEnvironment");
            Method getExternalDirs =userEnvironment.getDeclaredMethod("getExternalDirs");
            getExternalDirs.setAccessible(true);
            //========获取构造UserEnvironment的必要参数UserId================
            Class<?> userHandle = Class.forName("android.os.UserHandle");
            Method myUserId = userHandle.getDeclaredMethod("myUserId");
            myUserId.setAccessible(true);
            int mUserId = (int) myUserId.invoke(UserHandle.class);
            Constructor<?> declaredConstructor = userEnvironment.getDeclaredConstructor(Integer.TYPE);
            // 得到UserEnvironment instance
            Object instance = declaredConstructor.newInstance(mUserId);
            File[] files = (File[]) getExternalDirs.invoke(instance);
            for (int i = 0; i < files.length; i++) {
                if (Environment.isExternalStorageRemovable(files[i])){
                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("path", files[i].getPath());
                    paths.put(jsonObject);
                }
            }
        } catch (Exception e) {

        }
        return paths.toString();
    }
}
