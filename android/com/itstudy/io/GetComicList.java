package com.itstudy.io;


import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Comparator;
import java.util.regex.Pattern;

/**
 * @Title: FileList
 * @author: 康雷  e-mail: 1014295211@qq.com
 * @date: 2020/9/22 16:51
 * @ClassName: GetComicList
 * @Description: 读取指定路径下的漫画列表
 */
public class GetComicList {


    public String getComic(String path) throws IOException, JSONException {
        File file = new File(path);
        File[] files = file.listFiles();
        Arrays.sort(files, new Comparator<File>() {
            @Override
            public int compare(File t1, File t2) {
                return (int)(t2.lastModified() - t1.lastModified());
            }
        });
        JSONArray fileListJsonArray = new JSONArray();
        for (File value : files) {
            if ( !value.isHidden() ) {
                JSONObject jsonObject = new JSONObject();
                if (value.isDirectory()) {
                    jsonObject.put("name", value.getName());
                    jsonObject.put("path", value.getPath());
                    jsonObject.put("time", this.getFileTime(value));
                    jsonObject.put("createTime", value.lastModified());
                    jsonObject.put("image", this.getImage(value));
                    jsonObject.put("length", this.getComicLength(value));
                    fileListJsonArray.put(jsonObject);
                }
            }
        }
        return fileListJsonArray.toString();
    }

    private String getImage(File file) {
       File[] childFiles = file.listFiles();
       for ( File value : childFiles ) {
           if ( value.getName().equals("000_preview.jpg") ) {
               return value.getPath();
           }
       }
       Arrays.sort(childFiles, new Comparator<File>() {
            @Override
            public int compare(File t1, File t2) {
           return chineseNumber2Int(t1.getName()) - chineseNumber2Int(t2.getName());
            }
       });
       for (File value : childFiles) {
           if ( value.isDirectory() ) {
               File[] grandFiles = value.listFiles();
               if ( grandFiles.length > 0 ) {
                   Arrays.sort(grandFiles, new Comparator<File>() {
                       @Override
                       public int compare(File t1, File t2) {
                           return chineseNumber2Int(t1.getName()) - chineseNumber2Int(t2.getName());
                       }
                   });
                   return reduceImage(grandFiles[0].getPath(), file.getPath());
               }
           }
       }
        String[] types = {"jpg","png","gif","JPG","PNG","GIF"};
        for (File value : childFiles) {
            if ( value.isFile() ) {
                if ( Arrays.asList(types).contains(getFileType(value))) {
                    return reduceImage(value.getPath(), file.getPath());
                }
            }
        }
       return "";
    }

    //压缩成缩略图
    private static String reduceImage(String srcPath, String savePath) {
        BitmapFactory.Options newOpts = new BitmapFactory.Options();
        // 开始读入图片，此时把options.inJustDecodeBounds 设回true了
        newOpts.inJustDecodeBounds = true;
        Bitmap bitmap = BitmapFactory.decodeFile(srcPath, newOpts);// 此时返回bm为空
        newOpts.inJustDecodeBounds = false;
        int w = newOpts.outWidth;
        int h = newOpts.outHeight;
        // 现在主流手机比较多是800*480分辨率，所以高和宽我们设置为
        float hh = 285f;// 这里设置高度为800f
        float ww = 250f;// 这里设置宽度为480f
        // 缩放比。由于是固定比例缩放，只用高或者宽其中一个数据进行计算即可
        int be = 1;// be=1表示不缩放
        if (w > h && w > ww) {// 如果宽度大的话根据宽度固定大小缩放
            be = (int) (newOpts.outWidth / ww);
        } else if (w < h && h > hh) {// 如果高度高的话根据高度固定大小缩放
            be = (int) (newOpts.outHeight / hh);
        }
        if (be <= 0)
            be = 1;
        newOpts.inSampleSize = be;// 设置缩放比例
        // 重新读入图片，注意此时已经把options.inJustDecodeBounds 设回false了
        bitmap = BitmapFactory.decodeFile(srcPath, newOpts);
        return savePreviewImage(bitmap, savePath);// 压缩好比例大小后再进行质量压缩
    }

    //保存缩略图
    private static String savePreviewImage (Bitmap image, String savePath) {
        File filePic;
        try {
            filePic = new File(savePath + "/000_preview.jpg");
            if (!filePic.exists()) {
                filePic.getParentFile().mkdirs();
                filePic.createNewFile();
            }
            FileOutputStream fos = new FileOutputStream(filePic);
            //不压缩，保存本地
            image.compress(Bitmap.CompressFormat.JPEG, 100, fos);
            fos.flush();
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
        return filePic.getAbsolutePath();
    }

    private int getComicLength(File file) {
        File[] childFiles = file.listFiles();
        int length = 0;
        for (File value : childFiles) {
            if ( value.isDirectory() ) {
                length = length + 1;
            }
        }
        if ( length == 0 && childFiles.length > 0 ) {
            length = 1;
        }
        return length;
    }

    private String getFileTime(File file) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm");
        return formatter.format(file.lastModified());
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
