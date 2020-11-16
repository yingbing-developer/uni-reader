package com.itstudy.io;


import android.graphics.BitmapFactory;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Comparator;
import java.util.regex.Pattern;

/**
 * @Title: FileList
 * @author: 康雷  e-mail: 1014295211@qq.com
 * @date: 2020/9/22 16:51
 * @ClassName: GetComicContent
 * @Description: 读取指定路径下的漫画内容
 */
public class GetComicContent {


    public String getContent(String path, int chapter) throws IOException, JSONException {
        File file = new File(path);
        File[] files = file.listFiles();
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File t1, File t2) {
            return chineseNumber2Int(t1.getName()) - chineseNumber2Int(t2.getName());
            }
        });
        //记录文件夹的数量
        JSONArray foldeListJsonArray = new JSONArray();
        for (File value : files) {
             if ( !value.isHidden() && value.isDirectory()) {
                 JSONObject jsonObject = new JSONObject();
                 jsonObject.put("path", value.getPath());
                 foldeListJsonArray.put(jsonObject);
             }
        }
        JSONArray fileListJsonArray = new JSONArray();
        String[] types = {"jpg","png","gif","JPG","PNG","GIF"};
        if ( foldeListJsonArray.length() == 0 ) {
            if ( files.length > 0 ) {
                for (File value : files) {
                    if ( !value.isHidden() && !value.getName().equals("000_preview.jpg") && Arrays.asList(types).contains(this.getFileType(value)) ) {
                        JSONObject jsonObject = new JSONObject();
                        JSONObject imageSize = this.getImageSize(value);
                        jsonObject.put("name", value.getName());
                        jsonObject.put("path", value.getPath());
                        jsonObject.put("imageWidth", imageSize.get("width"));
                        jsonObject.put("imageHeight", imageSize.get("height"));
                        fileListJsonArray.put(jsonObject);
                    }
                }
            }
        } else {
            File newFile = new File((String) foldeListJsonArray.getJSONObject(chapter).get("path"));
            if ( newFile.exists() && newFile != null ) {
                File[] childFiles = newFile.listFiles();
                Arrays.sort(childFiles, new Comparator<File>() {
                    @Override
                    public int compare(File t1, File t2) {
                        return chineseNumber2Int(t1.getName()) - chineseNumber2Int(t2.getName());
                    }
                });
                for (File value : childFiles) {
                    if ( !value.isHidden() && !value.getName().equals("000_preview.jpg") && Arrays.asList(types).contains(this.getFileType(value)) ) {
                        JSONObject jsonObject = new JSONObject();
                        JSONObject imageSize = this.getImageSize(value);
                        jsonObject.put("name", value.getName());
                        jsonObject.put("path", value.getPath());
                        jsonObject.put("imageWidth", imageSize.get("width"));
                        jsonObject.put("imageHeight", imageSize.get("height"));
                        fileListJsonArray.put(jsonObject);
                    }
                }
            }
        }
        return fileListJsonArray.toString();
    }

    private JSONObject getImageSize(File file) throws IOException, JSONException {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;//这个参数设置为true才有效，
        BitmapFactory.decodeFile(file.getPath(), options);//这里的bitmap是个空
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("width", options.outWidth);
        jsonObject.put("height", options.outHeight);
        return jsonObject;
    }

    private String getFileType(File file) {
        String fileName = file.getName();
        if (!fileName.contains(".")) {
            return "file";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length());
    }

    @SuppressWarnings("unused")
    private static int chineseNumber2Int(String str){
        Pattern p = Pattern.compile("[^0-9]");
        String s = p.matcher(str.replace("", "")).replaceAll("");
        if ( !s.equals("") && s != null ) {
            return Integer.parseInt(s);
        }
        String chineseNumber = "";
        p = Pattern.compile("[^一二三四五六七八九零十百千万亿]");
        s = p.matcher(str.replace("", "")).replaceAll("");
        if ( !s.equals("") && s != null ) {
            chineseNumber = s;
        } else  {
           return 0;
        }
        int result = 0;
        int temp = 1;//存放一个单位的数字如：十万
        int count = 0;//判断是否有chArr
        char[] cnArr = new char[]{'一','二','三','四','五','六','七','八','九'};
        char[] chArr = new char[]{'十','百','千','万','亿'};
        for (int i = 0; i < chineseNumber.length(); i++) {
            boolean b = true;//判断是否是chArr
            char c = chineseNumber.charAt(i);
            for (int j = 0; j < cnArr.length; j++) {//非单位，即数字
                if (c == cnArr[j]) {
                    if(0 != count){//添加下一个单位之前，先把上一个单位值添加到结果中
                        result += temp;
                        temp = 1;
                        count = 0;
                    }
                    // 下标+1，就是对应的值
                    temp = j + 1;
                    b = false;
                    break;
                }
            }
            if(b){//单位{'十','百','千','万','亿'}
                for (int j = 0; j < chArr.length; j++) {
                    if (c == chArr[j]) {
                        switch (j) {
                            case 0:
                                temp *= 10;
                                break;
                            case 1:
                                temp *= 100;
                                break;
                            case 2:
                                temp *= 1000;
                                break;
                            case 3:
                                temp *= 10000;
                                break;
                            case 4:
                                temp *= 100000000;
                                break;
                            default:
                                break;
                        }
                        count++;
                    }
                }
            }
            if (i == chineseNumber.length() - 1) {//遍历到最后一个字符
                result += temp;
            }
        }
        return result;
    }
}
