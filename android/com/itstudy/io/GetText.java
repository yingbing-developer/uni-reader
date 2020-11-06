package com.itstudy.io;

import java.io.*;

/**
 * @Title: TestTranslate
 * @author: 何杰  e-mail: 734412450@qq.com
 * @date: 2020/8/26 16:45
 * @ClassName: TestTranslate
 * @Description:
 */
public class GetText {



    //判断编码格式方法
    private static String getFileCharset(File sourceFile) {
        String charset = "GBK";
        byte[] first3Bytes = new byte[3];
        try {
            boolean checked = false;
            BufferedInputStream bis = new BufferedInputStream(new FileInputStream(sourceFile));
            bis.mark(0);
            int read = bis.read(first3Bytes, 0, 3);
            //文件编码为 ANSI
            if (read == -1) {
                return charset;
            } else if (first3Bytes[0] == (byte) 0xFF
                    && first3Bytes[1] == (byte) 0xFE) {
                //文件编码为 Unicode
                charset = "UTF-16LE";
                checked = true;
            } else if (first3Bytes[0] == (byte) 0xFE
                    && first3Bytes[1] == (byte) 0xFF) {
                //文件编码为 Unicode big endian
                charset = "UTF-16BE";
                checked = true;
            } else if (first3Bytes[0] == (byte) 0xEF
                    && first3Bytes[1] == (byte) 0xBB
                    && first3Bytes[2] == (byte) 0xBF) {
                //文件编码为 UTF-8
                charset = "UTF-8";
                checked = true;
            }
            bis.reset();
            if (!checked) {
                int loc = 0;
                while ((read = bis.read()) != -1) {
                    loc++;
                    if (read >= 0xF0) {
                        break;
                    }
                    // 单独出现BF以下的，也算是GBK
                    if (0x80 <= read && read <= 0xBF) {
                        break;
                    }
                    if (0xC0 <= read && read <= 0xDF) {
                        read = bis.read();
                        // 双字节 (0xC0 - 0xDF)
                        if (0x80 <= read && read <= 0xBF)
                        // (0x80
                        // - 0xBF),也可能在GB编码内
                        {
                            continue;
                        } else {
                            break;
                        }
                        // 也有可能出错，但是几率较小
                    } else if (0xE0 <= read && read <= 0xEF) {
                        read = bis.read();
                        if (0x80 <= read && read <= 0xBF) {
                            read = bis.read();
                            if (0x80 <= read && read <= 0xBF) {
                                charset = "UTF-8";
                                break;
                            } else{
                                break;}
                        } else {
                            break;
                        }
                    }
                }
            }
            bis.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return charset;
    }

    public String getTextFromText(String filePath) {

        try {
            // 获取输入流
            InputStreamReader isr = new InputStreamReader(new FileInputStream(filePath), getFileCharset(new File(filePath)));
            BufferedReader br = new BufferedReader(isr);

            StringBuffer sb = new StringBuffer();
            String temp = null;
            while ((temp = br.readLine()) != null) {
                sb.append(temp+"\r\n");
            }
            br.close();
            return sb.toString();
        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();

        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }
}
